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
    const [paidStatus, setPaidStatus] = useState('all'); // Default is 'all' to show all data
    const [returnedFilter, setReturnedFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [showCheckboxes, setShowCheckboxes] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState('');
    const navigate = useNavigate();

    // Fetch data
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

    // Handle input changes
    const handleSearchChange = (e) => setSearchTerm(e.target.value);
    const handlePaidStatusChange = (e) => setPaidStatus(e.target.value);
    const handleSelectMonth = (e) => setSelectedMonth(e.target.value);

    const handleSelectChange = (id) => {
        setSelectedIds((prev) => {
            const updatedSelectedIds = new Set(prev);
            updatedSelectedIds.has(id) ? updatedSelectedIds.delete(id) : updatedSelectedIds.add(id);
            
            // Show checkboxes only if any items are selected
            setShowCheckboxes(updatedSelectedIds.size > 0);
            
            return updatedSelectedIds;
        });
    };

    const handleSelectAllChange = (e) => {
        const newSelectedIds = e.target.checked ? new Set(data.map(item => item._id)) : new Set();
        setSelectedIds(newSelectedIds);
        
        // Show checkboxes only if any items are selected
        setShowCheckboxes(newSelectedIds.size > 0);
    };

    const handleSelectPaid = () => {
        if (selectedIds.size === 0) {
            const paidIds = new Set(data.filter(item => item.paidStatus.toLowerCase() === 'paid').map(item => item._id));
            setSelectedIds(paidIds);
            setShowCheckboxes(true);  // Show checkboxes when selecting "paid"
        } else {
            setSelectedIds(new Set());
            setShowCheckboxes(false);  // Hide checkboxes when nothing is selected
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
                setShowCheckboxes(false);  // Hide checkboxes after deletion
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

    // Utility function to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
        const year = date.getFullYear();
        return `${day}/${month}/${year}`; // Return formatted date
    };

    // Filter data
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

    // Handle Edit Entry
    const handleEditEntry = (item) => {
        navigate('/', { state: { item } }); // Pass the item to edit in state
    };

    // Render component
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
                            className="w-full p-2 border border-gray-300 shadow-md rounded-md placeholder:text-slate-500"
                            placeholder="Enter name or phone number"
                            disabled={loading}
                            aria-label="Search by name or phone number"
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

                <div className="flex items-center space-x-4">
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
                </div>
            </header>

            {loading ? (
                <Spinner />
            ) : (
                <section>
                    {filteredData.length > 0 ? (
                        <div className="overflow-x-auto ">
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
                                            <td className="p-3 border  border-slate-500">{index + 1}</td>
                                            <td className="p-3 border border-slate-500">{formatDate(item.date)}</td>
                                            <td className="p-3 border border-slate-500">{item.name}</td>
                                            <td className="p-3 border border-slate-500">{item.phoneNo}</td>
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
