import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const UpdateEntry = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const entry = location.state?.entry;

    const [name, setName] = useState(entry?.name || '');
    const [phoneNo, setPhoneNo] = useState(entry?.phoneNo || '');

    const handleUpdate = () => {
        if (phoneNo.length === 10 && !phoneNo.startsWith('0')) {
            const data = JSON.parse(localStorage.getItem('namePhoneData')) || [];
            const updatedData = data.map(item =>
                item.phoneNo === entry.phoneNo ? { name, phoneNo } : item
            );

            localStorage.setItem('namePhoneData', JSON.stringify(updatedData));
            navigate('/phoneno'); // Redirect back to NamePhoneDisplay
        } else {
            alert('Please enter a valid phone number (10 digits, not starting with 0).');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100 p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Update Entry</h1>
            <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    aria-label="Name"
                    className="w-full mb-4 px-4 py-2 border rounded focus:ring focus:ring-blue-300"
                />
                <input
                    type="text"
                    value={phoneNo}
                    onChange={(e) => setPhoneNo(e.target.value)}
                    placeholder="Phone Number"
                    aria-label="Phone Number"
                    className="w-full mb-6 px-4 py-2 border rounded focus:ring focus:ring-blue-300"
                />
                <button
                    onClick={handleUpdate}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-200"
                >
                    Update
                </button>
                <button
                    onClick={() => navigate('/phoneno')}
                    className="w-full mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-200"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default UpdateEntry;
