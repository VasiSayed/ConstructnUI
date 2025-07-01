
import { useState } from "react"
import { MdOutlineCancel } from "react-icons/md";
export default function User() {
const [isAdd, setAdd] = useState(false);

 const handleAdd = () => {
    setAdd(true); 
};
  
  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded shadow-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">USERS</h1>
        <div className="flex gap-3 mb-4">
          <input type="search" placeholder="Search" className="px-3 py-2 border rounded-md w-64" />
          <button className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded flex items-center gap-2 " onClick={handleAdd}>
            <span>+</span> Add
          </button>
         
          <button className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded">Remove User Access</button>
          <button className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded flex items-center gap-2">
            <span>↓</span> Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-purple-50">
              <th className="text-left p-3 font-semibold">ID</th>
              <th className="text-left p-3 font-semibold">Name</th>
              <th className="text-left p-3 font-semibold">Email</th>
              <th className="text-left p-3 font-semibold">Mobile</th>
              <th className="text-left p-3 font-semibold">Role</th>
              <th className="text-left p-3 font-semibold">Profile</th>
              <th className="text-left p-3 font-semibold">User Type</th>
              <th className="text-left p-3 font-semibold">Status</th>
              <th className="text-left p-3 font-semibold">View</th>
              <th className="text-left p-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(3)].map((_, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-purple-50"}>
                <td className="p-3">001</td>
                <td className="p-3">John Doe</td>
                <td className="p-3">john@example.com</td>
                <td className="p-3">+1234567890</td>
                <td className="p-3">Admin</td>
                <td className="p-3">Profile A</td>
                <td className="p-3">Full Access</td>
                <td className="p-3">Active</td>
                <td className="p-3">
                  <button className="text-purple-50">View</button>
                </td>
                <td className="p-3">
                  <button className="text-purple-50">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isAdd && (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
    <div className="bg-white max-h-[70vh] w-1/3 rounded-lg">
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
              <div className="flex items-center justify-between mb-6">
                <button className="text-gray-600 hover:text-gray-800" onClick={() => setAdd(false)}>
              <MdOutlineCancel size={24}/>
          </button>
          <h1 className="inset-0 flex justify-center text-xl font-semibold mx-auto">CREATE USER SCREEN</h1>
          
        </div>

        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <button className="absolute bottom-0 right-0 bg-purple-700 text-white p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[55vh]">
          <form className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  First Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-purple-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Last Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-purple-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Email<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-purple-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Mobile<span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-purple-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Password<span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-purple-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Role<span className="text-red-500">*</span>
              </label>
              <select className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-purple-700">
                <option value="">Select Role</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Profile<span className="text-red-500">*</span>
              </label>
              <select className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-purple-700">
                <option value="">Profile</option>
              </select>
            </div>

         

            <div>
              <label className="block text-sm font-medium mb-1">User Type</label>
              <select className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-purple-700">
                <option value="">Select User Type</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Project Associated</label>
              <select className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-purple-700">
                      <option value="">Project 1</option>
                      <option value="">Project 2</option>
                       <option value="">Project 3</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-700 text-white py-2 px-4 rounded hover:bg-purple-800 transition duration-200"
            >
              Create
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
)}

      
    </div>
  )
}

