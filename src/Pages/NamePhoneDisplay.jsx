import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NamePhoneDisplay = () => {
  const [namePhoneData, setNamePhoneData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhoneNo, setNewPhoneNo] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const data = localStorage.getItem("namePhoneData");
      const parsedData = data ? JSON.parse(data) : [];
      setNamePhoneData(parsedData);
      setError("");
    } catch (error) {
      console.error("Failed to parse namePhoneData from localStorage:", error);
      setError("Failed to load data.");
    }
  }, []);

  const filteredData = useMemo(() => {
    const uniqueEntries = new Map();
    namePhoneData.forEach((entry) => {
      if (
        entry.phoneNo.length === 10 &&
        !entry.phoneNo.startsWith("0") &&
        !uniqueEntries.has(entry.phoneNo)
      ) {
        uniqueEntries.set(entry.phoneNo, entry);
      }
    });

    return Array.from(uniqueEntries.values()).filter(
      (entry) =>
        entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.phoneNo.includes(searchTerm)
    );
  }, [namePhoneData, searchTerm]);

  const handleDelete = (phoneNo) => {
    const updatedData = namePhoneData.filter((entry) => entry.phoneNo !== phoneNo);
    setNamePhoneData(updatedData);
    localStorage.setItem("namePhoneData", JSON.stringify(updatedData));
    toast.success("Entry deleted successfully!");
  };

  const handleUpdate = (entry) => {
    navigate("/update", { state: { entry } });
  };

  const isValidPhoneNumber = (phoneNo) => {
    const phoneRegex = /^[1-9]\d{9}$/;
    return phoneRegex.test(phoneNo);
  };

  const handleAddEntry = (e) => {
    e.preventDefault();
    if (newName.trim() === "" || newPhoneNo.trim() === "") {
      setError("Name and Phone Number are required.");
      return;
    }
    if (!isValidPhoneNumber(newPhoneNo)) {
      setError("Invalid phone number. It must be 10 digits and cannot start with 0.");
      return;
    }
    if (namePhoneData.some((entry) => entry.phoneNo === newPhoneNo)) {
      setError("Phone number already exists.");
      return;
    }
    const newEntry = { name: newName, phoneNo: newPhoneNo };
    const updatedData = [...namePhoneData, newEntry];
    setNamePhoneData(updatedData);
    localStorage.setItem("namePhoneData", JSON.stringify(updatedData));
    setNewName("");
    setNewPhoneNo("");
    setShowAddForm(false);
    setError("");
    toast.success("Entry added successfully!");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-blue-100 rounded-lg shadow-md">
      <ToastContainer />
      <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
        Phone Number 
      </h1>
      <div className="flex justify-between">
      <Link to="/">
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061A1.125 1.125 0 0 1 21 8.689v8.122ZM11.25 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061a1.125 1.125 0 0 1 1.683.977v8.122Z" />
        </svg>
        </button>
      </Link>
      <Link to="/calculation">
      <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
       <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z" />
       </svg>

      </button>
      </Link>
      </div>
      {error && (
        <p className="text-red-600 text-center font-semibold mb-4">{error}</p>
      )}
      <div className="mb-6">
        <button
          onClick={() => setShowAddForm((prev) => !prev)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {showAddForm ? "Cancel" : "Add Entry"}
        </button>
        {showAddForm && (
          <form
            className="mt-4  md:max-w-96 bg-white p-4 rounded shadow"
            onSubmit={handleAddEntry}
          >
            <input
              type="text"
              placeholder="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full mb-4 px-3 py-2 border rounded  outline-0 focus:ring focus:ring-blue-300"
              required
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={newPhoneNo}
              onChange={(e) => setNewPhoneNo(e.target.value)}
              className="w-full mb-4 px-3 py-2 border rounded  outline-0 focus:ring focus:ring-blue-300"
              required
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add
            </button>
          </form>
        )}
      </div>
      <input
        type="text"
        placeholder="Search by name or phone number"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full md:w-1/2 md:ml-20 mb-6 px-3 py-2 border rounded outline-0 focus:ring  focus:ring-blue-300"
      />
      {filteredData.length === 0 ? (
        <p className="text-center text-gray-500">
          {searchTerm ? "No results found." : "No data available."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded shadow">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="px-4 py-2 text-left">No</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Phone Number</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((entry, index) => (
                <tr
                  key={entry.phoneNo}
                  className="border-t hover:bg-gray-100"
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{entry.name}</td>
                  <td className="px-4 py-2">{entry.phoneNo}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleUpdate(entry)}
                      className="px-3 py-1 bg-green-600 mb-2 text-white rounded hover:bg-green-700 md:mr-4 "
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(entry.phoneNo)}
                      className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NamePhoneDisplay;
