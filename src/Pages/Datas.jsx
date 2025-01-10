import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_BASE_URL } from '../../config';
import { useNavigate } from 'react-router-dom';
import Spinner from './Spinner';

const Datas = ({ setTotalAmount, setData, data }) => {
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [paidStatus, setPaidStatus] = useState('all');
    const [returnedFilter, setReturnedFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [showCheckboxes, setShowCheckboxes] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState('');
    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_BASE_URL);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data', error);
            toast.error('Error fetching data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSearchChange = (e) => setSearchTerm(e.target.value);
    const handlePaidStatusChange = (e) => setPaidStatus(e.target.value);
    const handleSelectMonth = (e) => setSelectedMonth(e.target.value);

    const handleSelectChange = (id) => {
        setSelectedIds((prev) => {
            const updatedSelectedIds = new Set(prev);
            updatedSelectedIds.has(id) ? updatedSelectedIds.delete(id) : updatedSelectedIds.add(id);
            
            setShowCheckboxes(updatedSelectedIds.size > 0);
            
            return updatedSelectedIds;
        });
    };

    const handleSelectAllChange = (e) => {
        const newSelectedIds = e.target.checked ? new Set(data.map(item => item._id)) : new Set();
        setSelectedIds(newSelectedIds);
        setShowCheckboxes(newSelectedIds.size > 0);
    };

    const handleSelectPaid = () => {
        if (selectedIds.size === 0) {
            const paidIds = new Set(data.filter(item => item.paidStatus.toLowerCase() === 'paid').map(item => item._id));
            setSelectedIds(paidIds);
            setShowCheckboxes(true);
        } else {
            setSelectedIds(new Set());
            setShowCheckboxes(false);
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.size === 0) {
            toast.error('No items selected for deletion.');
            return;
        }

        const selectedIdsArray = [...selectedIds];
        const itemsToDelete = selectedIdsArray.filter(id => {
            const item = data.find(item => item._id === id);
            const itemDate = new Date(item.date);
            return (itemDate.getMonth() + 1).toString() === selectedMonth;
        });

        if (itemsToDelete.length === 0) {
            toast.error('No entries from the selected month to delete.');
            return;
        }

        if (window.confirm("Are you sure you want to delete the selected entries for the selected month?")) {
            setLoading(true);
            try {
                await Promise.all(itemsToDelete.map(id => axios.delete(`${API_BASE_URL}/${id}`)));
                toast.success('Selected entries for the month deleted successfully!');
                fetchData();
                setSelectedIds(new Set());
                setShowCheckboxes(false);
            } catch (error) {
                console.error('Error deleting entries', error);
                toast.error('Error deleting entries. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDeleteEntry = async (id) => {
        if (window.confirm("Are you sure you want to delete this entry?")) {
            setLoading(true);
            try {
                await axios.delete(`${API_BASE_URL}/${id}`);
                toast.success('Entry deleted successfully!');
                fetchData();
            } catch (error) {
                console.error('Error deleting entry', error);
                toast.error('Error deleting entry. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const highlightSearchTerm = (text, searchTerm) => {
        if (!searchTerm) return text;

        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, index) =>
            regex.test(part) ? (
                <span key={index} className="text-red-500 font-bold">
                    {part}
                </span>
            ) : (
                part
            )
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const matchesSearch = 
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                item.phoneNo.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesPaidStatus = paidStatus === 'all' || item.paidStatus.toLowerCase() === paidStatus.toLowerCase();
            const matchesReturned = returnedFilter === 'all' || 
                (returnedFilter === 'returned' && item.returned) || 
                (returnedFilter === 'notReturned' && !item.returned);
            
            const itemDate = new Date(item.date);
            const monthMatches = !selectedMonth || (itemDate.getMonth() + 1).toString() === selectedMonth;

            return matchesSearch && matchesPaidStatus && matchesReturned && monthMatches;
        });
    }, [data, searchTerm, paidStatus, returnedFilter, selectedMonth]);

    const handleEditEntry = (item) => {
        navigate('/', { state: { item } });
    };

    const exportToCSV = () => {
        const headers = [
            'Date',
            'Name',
            'Phone Number',
            'Products',
            'Amount',
            'Paid',
            'Returned',
            'Notes'
        ];

        const rows = filteredData.map(item => [
            formatDate(item.date),           // Format the date
            item.name,                       // Name
            item.phoneNo,                    // Phone Number
            item.product,                    // Products
            item.paidAmount,                 // Amount
            item.paidStatus,                 // Paid status
            item.returned ? 'Yes' : 'No',    // Returned status
            item.notes                       // Notes
        ]);

        let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';
        rows.forEach(row => {
            csvContent += row.join(',') + '\n';
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'table_data.csv');
        document.body.appendChild(link); // Required for Firefox
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-4 space-y-4 bg-blue-400 rounded-xl">
            <ToastContainer />
            <header className="flex flex-col space-y-4">
                <h1 className="text-3xl font-bold text-center text-red-600">AKR CENTRING</h1>
                <div className="space-y-4 p-4 bg-gray-200 rounded-lg shadow-lg">
                    <div>
                        <label className="block font-semibold mb-1">Search by Name or Phone Number:</label>
                        <input 
                            type="text" 
                            value={searchTerm} 
                            onChange={handleSearchChange} 
                            className="w-full p-2 border border-gray-300 shadow-md rounded-md placeholder:text-slate-500 outline-0 focus:ring focus:ring-blue-300"
                            placeholder="Enter name or phone number" 
                            disabled={loading}
                        />
                    </div>

                    <div className="flex flex-col md:flex-row md:space-x-4">
                        <div className="w-full md:w-1/3">
                            <label className="block font-semibold">Filter by Paid Status:</label>
                            <div className=" space-x-0 md:space-x-5 mt-2">
                                {['all', 'paid', 'pending'].map((status) => (
                                    <button
                                        key={status}
                                        className={`py-2 px-2 md:px-4 md:rounded-md border border-slate-300 shadow-sm  ${paidStatus === status ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
                                        onClick={() => setPaidStatus(status)}
                                        disabled={loading}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="w-full md:w-1/3">
                            <label className="block font-semibold mt-2">Filter by Returned:</label>
                            <div className=" space-x-0 border border-gray-200 md:space-x-4  mt-2">
                                {['all', 'returned', 'notReturned'].map((filter) => (
                                    <button
                                        key={filter}
                                        className={`py-2 px-2 md:px-4  md:rounded-md  md:border md:border-slate-300 shadow-md ${returnedFilter === filter ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
                                        onClick={() => setReturnedFilter(filter)}
                                        disabled={loading}
                                    >
                                        {filter.charAt(0).toUpperCase() + filter.slice(1).replace('Returned', ' Returned')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="w-full md:w-1/3">
                            <label className="block font-semibold mt-2">Filter by Month:</label>
                            <select 
                                value={selectedMonth} 
                                onChange={handleSelectMonth} 
                                className="w-5/6 mt-1 p-2 border shadow-sm border-gray-300 rounded-md"
                                disabled={loading}
                            >
                                <option value="">All Months</option>
                                {[...Array(12)].map((_, index) => (
                                    <option key={index} value={index + 1}>
                                        {new Date(0, index).toLocaleString('default', { month: 'long' })}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between">
                    <button 
                        className="bg-green-500 text-white py-2 px-4 rounded-md disabled:bg-gray-300"
                        onClick={handleSelectPaid} 
                        disabled={loading}
                    >
                        {selectedIds.size === 0 ? 'Select Paid' : 'Deselect'}
                    </button>

                    {selectedIds.size > 0 && (
                        <button 
                            className="bg-red-500 text-white py-2 px-4 rounded-md disabled:bg-gray-300"
                            onClick={handleDeleteSelected}
                            disabled={loading}
                        >
                            Delete
                        </button>
                    )}

                    {/* Download Button */}
                    <button 
                        className=" bg-blue-500 text-white py-2 px-4 rounded-md disabled:bg-gray-300"
                        onClick={exportToCSV}
                        disabled={loading}
                    >
                        
                        <div className='hidden md:block'> Download CSV</div>
                        <div className='md:hidden '><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                          </svg>
                        </div>
        

                    </button>
                </div>
            </header>

            {loading ? (
                <Spinner />
            ) : (
                <section>
                    {filteredData.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto bg-gray-200">
                                <thead>
                                    <tr className="bg-gray-200">
                                        {showCheckboxes && (
                                            <th className="p-3 ">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedIds.size === filteredData.length && filteredData.length > 0} 
                                                    onChange={handleSelectAllChange} 
                                                    aria-label="Select all"
                                                />
                                            </th>
                                        )}
                                        <th className="p-3 font-semibold border border-slate-500 text-blue-400 ">#</th>
                                        <th className="p-3 font-semibold border border-slate-500 ">Date</th>
                                        <th className="p-3 font-semibold border border-slate-500">Name</th>
                                        <th className="p-3 font-semibold border border-slate-500">Phone Number</th>
                                        <th className="p-3 font-semibold border border-slate-500">Products</th>
                                        <th className="p-3 font-semibold border border-slate-500">Amount</th>
                                        <th className="p-3 font-semibold border border-slate-500">Paid</th>
                                        <th className="p-3 font-semibold border border-slate-500">Returned</th>
                                        <th className="p-3 font-semibold border border-slate-500">Notes</th>
                                        <th className="p-3 font-semibold border border-slate-500">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((item, index) => (
                                        <tr key={item._id} className="hover:bg-gray-100">
                                            {showCheckboxes && (
                                                <td className="p-3">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedIds.has(item._id)} 
                                                        onChange={() => handleSelectChange(item._id)} 
                                                        aria-label={`Select ${item.name}`}
                                                    />
                                                </td>
                                            )}
                                            <td className="p-3 border border-slate-500">{index + 1}</td>
                                            <td className="p-3 border border-slate-500">{formatDate(item.date)}</td>
                                            <td className="p-3 border border-slate-500">
                                                {highlightSearchTerm(item.name, searchTerm)}
                                            </td>
                                            <td className="p-3 border border-slate-500">
                                                {highlightSearchTerm(item.phoneNo, searchTerm)}
                                            </td>
                                            <td className="p-3 border border-slate-500">{item.product}</td>
                                            <td className="p-3 border border-slate-500">{item.paidAmount}</td>
                                            <td className="p-3 border border-slate-500">{item.paidStatus}</td>
                                            <td className="p-3 border border-slate-500">{item.returned ? 'Yes' : 'No'}</td>
                                            <td className="p-3 border border-slate-500">{item.notes}</td>
                                            <td className="p-3 border border-slate-500">
                                                <button 
                                                    onClick={() => handleEditEntry(item)} 
                                                    className="bg-blue-500 mb-2 text-white py-1 px-5 rounded-md"
                                                    disabled={loading}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteEntry(item._id)} 
                                                    className="bg-red-500 text-white py-1 px-3 rounded-md "
                                                    disabled={loading}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-xl text-red-600">No data found</p>
                    )}
                </section>
            )}
        </div>
    );
};

export default Datas;
