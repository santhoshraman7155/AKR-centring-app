import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from './Pages/Login';
import Myprofile from './Pages/Myprofile';
import Navbar from './Components/Navbar';
import DataEntry from './Pages/DataEntry';
import Datas from './Pages/Datas';

import Calculation from './Pages/Calculation';
import NamePhoneDisplay from './Pages/NamePhoneDisplay';
import UpdateEntry from './Pages/Update';

const App = () => {
  // Define state and state updaters
  const [totalAmount, setTotalAmount] = useState(0);
  const [data, setData] = useState([]); // Assuming `data` is an array

  return (
    <div className="mx-4 sm:mx-[10%] ">
      <Navbar />
      <Routes>
        <Route path='/' element={<DataEntry />} />
        <Route
          path='/datas'
          element={<Datas setTotalAmount={setTotalAmount} setData={setData} data={data} />}
        />
        <Route path='/login' element={<Login />} />
        <Route path='/phoneno' element={<NamePhoneDisplay />} />
        <Route 
          path='/calculation' 
          element={<Calculation data={data} totalAmount={totalAmount} />} 
        />
        <Route path='/update' element={<UpdateEntry />} />
        <Route path='/my-profile' element={<Myprofile />} />
      </Routes>
    </div>
  );
}

export default App;
