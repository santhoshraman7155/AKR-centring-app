import React, { createContext, useState } from 'react';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [dataEntries, setDataEntries] = useState([]);

    return (
        <DataContext.Provider value={{ dataEntries, setDataEntries }}>
            {children}
        </DataContext.Provider>
    );
};

