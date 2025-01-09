import React, { useState, useEffect, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const InputField = memo(({ label, name, type, value, onChange, required, placeholder, error }) => (
    <div className="mb-4">
        <label htmlFor={name} className="block font-bold mb-1">
            {label}
            <input
                id={name}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                className={`mt-1 w-full p-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-blue-500`}
            />
            {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
        </label>
    </div>
));

const DataEntry = () => {
    const location = useLocation();
    const navigate = useNavigate(); // Initialize the useNavigate hook
    const [formData, setFormData] = useState({
        name: '',
        phoneNo: '0', // Set default phone number to 0
        date: new Date().toISOString().split('T')[0], // Default to today's date
        product: '',
        paidAmount: '0', // Default to 0
        paidStatus: 'Pending', // Default to 'Pending'
        returned: false,
        notes: '',
    });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMessages, setErrorMessages] = useState({});

    useEffect(() => {
        if (location.state && location.state.item) {
            const item = location.state.item;
            setFormData({
                name: item.name,
                phoneNo: item.phoneNo,
                date: item.date.split('T')[0], // Format to YYYY-MM-DD
                product: item.product,
                paidAmount: item.paidAmount,
                paidStatus: item.paidStatus || 'Pending', // Default to 'Pending' if not provided
                returned: item.returned,
                notes: item.notes || '',
            });
            setEditingId(item._id);
        }
    }, [location.state]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
        setErrorMessages((prev) => ({ ...prev, [name]: '' })); // Clear error message on change
    };

    const validateForm = () => {
        const errors = {};
        const phoneRegex = /^(0|\d{10})$/; // Validates either '0' or a 10-digit number

        if (!phoneRegex.test(formData.phoneNo)) {
            errors.phoneNo = 'Please enter a valid phone number (either "0" or a 10-digit number).';
        }
        if (isNaN(formData.paidAmount) || Number(formData.paidAmount) < 0) { // Allow 0 as valid
            errors.paidAmount = 'Amount Paid must be a non-negative number.';
        }
        if (!formData.name) {
            errors.name = 'Name is required.';
        }
        if (!formData.product) {
            errors.product = 'Product is required.';
        }
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrorMessages(validationErrors);
            setLoading(false);
            return; // Stop submission if there are validation errors
        }

        try {
            if (editingId) {
                await axios.put(`${API_BASE_URL}/${editingId}`, formData);
                toast.success('Entry updated successfully!'); // Show success toast for update
            } else {
                await axios.post(API_BASE_URL, formData);
                toast.success('Entry added successfully!'); // Show success toast for add
            }
            saveNamePhone(formData.name, formData.phoneNo);
            resetForm();

            // Navigate to the datas page after a short delay to allow the toast to show
            setTimeout(() => {
                navigate('/datas');
            }, 2000); // Delay of 2 seconds (2000 milliseconds)

        } catch (error) {
            console.error('Error submitting form', error);
            const errorMessage = error.response?.data?.message || 'Error submitting form. Please try again.';
            toast.error(errorMessage); // Show error toast on failure
        } finally {
            setLoading(false);
        }
    };

    const saveNamePhone = (name, phoneNo) => {
        const existingData = JSON.parse(localStorage.getItem('namePhoneData')) || [];
        const alreadyExists = existingData.some(item => item.phoneNo === phoneNo);
        
        if (!alreadyExists) {
            existingData.push({ name, phoneNo });
            localStorage.setItem('namePhoneData', JSON.stringify(existingData));
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            phoneNo: '0', // Reset to default 0
            date: new Date().toISOString().split('T')[0], // Reset to today's date
            product: '',
            paidAmount: '0', // Reset to 0
            paidStatus: 'Pending', // Reset to 'Pending'
            returned: false,
            notes: '',
        });
        setEditingId(null);
        setErrorMessages({});
    };

    return (
      <main className='bg-slate-400'>
      
        <div className="max-w-xl mb-2 mx-auto p-5 border border-gray-300 rounded-lg bg-blue-300 shadow-md ">
            <ToastContainer />
            <h1 className="text-center mb-5 text-2xl font-bold text-red-500">Data Entry</h1>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                <InputField label="Name" name="name" type="text" value={formData.name} onChange={handleChange} required error={errorMessages.name} />
                <InputField label="Phone Number" name="phoneNo" type="text" value={formData.phoneNo} onChange={handleChange} required error={errorMessages.phoneNo} />
                <InputField label="Date" name="date" type="date" value={formData.date} onChange={handleChange} required error={errorMessages.date} />
                <InputField label="Product" name="product" type="text" value={formData.product} onChange={handleChange} required error={errorMessages.product} />
                <InputField label="Amount Paid" name="paidAmount" type="number" value={formData.paidAmount} onChange={handleChange} required error={errorMessages.paidAmount} />
                <div className="mb-4">
                    <label className="block font-bold mb-1">
                        Paid Status:
                        <select name="paidStatus" value={formData.paidStatus} onChange={handleChange} required className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500">
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                        </select>
                    </label>
                </div>
                <div className="mb-4">
                    <label className="block font-bold mb-1">
                        Returned
                        <input
                            type="checkbox"
                            name="returned"
                            checked={formData.returned}
                            onChange={handleChange}
                            className="ml-2"
                        />
                    </label>
                </div>
                <InputField 
                    label="Notes" 
                    name="notes" 
                    type="text" 
                    value={formData.notes} 
                    onChange={handleChange} 
                    placeholder="Enter any additional notes here" 
                    error={errorMessages.notes} 
                />
                
                <div className="flex justify-between items-center mt-5">
                    <button type="submit" disabled={loading} className={`px-4 py-2 rounded text-white font-semibold ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'}`}>
                        {loading ? 'Loading...' : editingId ? 'Update' : 'Submit'}
                    </button>
                    <Link to="/datas">
                        <button  type="button" className="px-4 py-2 rounded border border-blue-500 text-blue-500 hover:bg-blue-100">
                           <div className='hidden md:block'>Data</div>
                           <div className='md:hidden'><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
                            <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                            <path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clip-rule="evenodd" />
                            </svg></div>
                            

                        </button>
                        
                    </Link>
                </div>
            </form>
        </div>
      </main>
    );
};

export default DataEntry;

