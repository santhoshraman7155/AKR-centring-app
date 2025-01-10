import React from 'react';

const Spinner = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="space-x-1 flex">
                <div className="w-2 h-6 bg-blue-500 animate-bounce"></div>
                <div className="w-2 h-6 bg-blue-500 animate-bounce delay-100"></div>
                <div className="w-2 h-6 bg-blue-500 animate-bounce delay-200"></div>
            </div>
        </div>
    );
};

export default Spinner;




