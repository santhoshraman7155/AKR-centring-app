import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Calculation = ({ data }) => {
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [calculatedTotal, setCalculatedTotal] = useState(0);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 30 }, (_, index) => currentYear - index); // Last 30 years
    const months = [
        { value: 1, label: "January" },
        { value: 2, label: "February" },
        { value: 3, label: "March" },
        { value: 4, label: "April" },
        { value: 5, label: "May" },
        { value: 6, label: "June" },
        { value: 7, label: "July" },
        { value: 8, label: "August" },
        { value: 9, label: "September" },
        { value: 10, label: "October" },
        { value: 11, label: "November" },
        { value: 12, label: "December" },
    ];

    const calculateTotal = () => {
        if (!month && !year) {
            toast.warn("Please select both Month and Year.");
            return;
        }

        let filteredTotal = 0;

        if (data && data.length > 0) {
            // Debugging: Log the data and selected filters
            console.log('Data:', data);
            console.log('Selected Month:', month);
            console.log('Selected Year:', year);

            const filteredData = data.filter(item => {
                const itemDate = new Date(item.date);
                const itemMonth = itemDate.getMonth() + 1; // Months are 0-indexed in JavaScript
                const itemYear = itemDate.getFullYear();

                // Debugging: Log filtered data for each item
                console.log(`Item: ${item.date}, Month: ${itemMonth}, Year: ${itemYear}`);

                const monthMatch = !month || itemMonth === parseInt(month); // Ensure month is valid
                const yearMatch = !year || itemYear === parseInt(year); // Ensure year is valid

                return monthMatch && yearMatch;
            });

            // Debugging: Log filtered data
            console.log('Filtered Data:', filteredData);

            filteredTotal = filteredData.reduce((acc, item) => acc + parseFloat(item.paidAmount || 0), 0);
        }

        // Debugging: Log the final total
        console.log('Total:', filteredTotal);

        setCalculatedTotal(filteredTotal);

        toast.success(
            `Total Amount for ${months.find(m => m.value === parseInt(month))?.label || ''} ${year}: ₹${filteredTotal}.00`
        );
    };

    return (
        <div className="min-h-screen bg-blue-200 flex items-start justify-center py-6">
            <ToastContainer />
            <div className="w-full max-w-md">
                <div className='mx-10 my-20'>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Total Calculation</h2>
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col">
                                <label htmlFor="month-select" className="text-sm font-medium text-gray-700">
                                    Month
                                </label>
                                <select
                                    id="month-select"
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select Month</option>
                                    {months.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="year-select" className="text-sm font-medium text-gray-700">
                                    Year
                                </label>
                                <select
                                    id="year-select"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select Year</option>
                                    {years.map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button
                            onClick={calculateTotal}
                            className="mt-4 w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition duration-200"
                        >
                            Calculate Total
                        </button>
                    </div>
                    <h3 className="mt-6 text-lg font-semibold text-gray-800 text-center">
                        Total Amount: <span className="text-green-600">&#8377;{calculatedTotal}.00</span>
                    </h3>
                </div>
            </div>
        </div>
    );
};

export default Calculation;
