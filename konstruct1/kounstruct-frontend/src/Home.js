import React, { useState } from 'react';
import { FaCogs, FaUsers, FaCalendarAlt, FaTasks, FaHandshake, FaFileSignature } from 'react-icons/fa';
import SiteConfig from './SiteConfig';
import UserHome from './UserHome';
import SlotConfig from './SlotConfig';
import RequestManagement from './RequestManagement';
import CoustemerHandover from './CoustemerHandover';
import Chif from './Chif'; 
import Checklist from './Checklist'; 
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";





const SiteConfiguration = () => {
  const navigate = useNavigate();
  const goToChifSetup = () => {
    navigate("/ChifSetup"); // Navigate to the ChifSetup page
  };
  
  const [activeTab, setActiveTab] = useState('SiteConfig');


  const renderContent = () => {
    switch (activeTab) {
      case 'SiteConfig':
        return <SiteConfig />;
      case 'UserHome':
        return <UserHome />;
      case 'SlotConfig':
        return <SlotConfig />;
      case 'RequestManagement':
        return <RequestManagement />;
      case 'CustomerHandover':
        return <CoustemerHandover />;
      case 'Chif':
        return <Chif />;
        case 'Checklist':
        return <Checklist />;
      default:
        return <SiteConfig />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-gray-800 text-white py-8">
        <div className="container mx-auto flex justify-between items-center px-6">
          <div className="flex items-center space-x-2">
            <img src="/path/to/your/logo.png" alt="Logo" className="w-12 h-12" />
            <h1 className="text-2xl font-bold">Property Management System</h1>
          </div>

          <nav className="space-x-4">
            <a href="#" className="hover:text-gray-400 text-lg">Home</a>
            <a href="#" className="hover:text-gray-400 text-lg">Contact Us</a>
            
<Link to="/login" className="hover:text-gray-400 text-lg">Login</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="flex justify-center bg-white px-0 rounded-lg">
          <ul className="flex w-full">
            <li className="flex-1">
              <button
                onClick={() => setActiveTab('SiteConfig')}
                className={`flex justify-center items-center w-full cursor-pointer px-0 py-4 text-sm font-medium rounded-t-md ${
                  activeTab === 'SiteConfig' ? 'bg-gray-100 border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600'
                } hover:bg-gray-100 hover:text-cyan-600 transition-colors duration-300`}
              >
                <FaCogs className="text-xl mr-2" />
                <span>Site Configuration</span>
              </button>
            </li>
            <li className="flex-1">
              <button
                onClick={() => setActiveTab('UserHome')}
                className={`flex justify-center items-center w-full cursor-pointer px-0 py-4 text-sm font-medium rounded-t-md ${
                  activeTab === 'UserHome' ? 'bg-gray-100 border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600'
                } hover:bg-gray-100 hover:text-cyan-600 transition-colors duration-300`}
              >
                <FaUsers className="text-xl mr-2" />
                <span>User Management</span>
              </button>
            </li>
            <li className="flex-1">
              <button
                onClick={() => setActiveTab('SlotConfig')}
                className={`flex justify-center items-center w-full cursor-pointer px-0 py-4 text-sm font-medium rounded-t-md ${
                  activeTab === 'SlotConfig' ? 'bg-gray-100 border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600'
                } hover:bg-gray-100 hover:text-cyan-600 transition-colors duration-300`}
              >
                <FaCalendarAlt className="text-xl mr-2" />
                <span>Slot Configuration</span>
              </button>
            </li>
            <li className="flex-1">
              <button
                onClick={() => setActiveTab('RequestManagement')}
                className={`flex justify-center items-center w-full cursor-pointer px-0 py-4 text-sm font-medium rounded-t-md ${
                  activeTab === 'RequestManagement' ? 'bg-gray-100 border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600'
                } hover:bg-gray-100 hover:text-cyan-600 transition-colors duration-300`}
              >
                <FaTasks className="text-xl mr-2" />
                <span>Request Management</span>
              </button>
            </li>
            <li className="flex-1">
              <button
                onClick={() => setActiveTab('CustomerHandover')}
                className={`flex justify-center items-center w-full cursor-pointer px-0 py-4 text-sm font-medium rounded-t-md ${
                  activeTab === 'CustomerHandover' ? 'bg-gray-100 border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600'
                } hover:bg-gray-100 hover:text-cyan-600 transition-colors duration-300`}
              >
                <FaHandshake className="text-xl mr-2" />
                <span>Customer Handover</span>
              </button>
            </li>
            <li className="flex-1">
              <button
                onClick={() => setActiveTab('Chif')}
                className={`flex justify-center items-center w-full cursor-pointer px-0 py-4 text-sm font-medium rounded-t-md ${
                  activeTab === 'Chif' ? 'bg-gray-100 border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600'
                } hover:bg-gray-100 hover:text-cyan-600 transition-colors duration-300`}
              >
                <FaFileSignature className="text-xl mr-2" />
                <span>CHIF Form</span>
              </button>
            </li>
            <li className="flex-1">
              <button
                onClick={() => setActiveTab('Checklist')}
                className={`flex justify-center items-center w-full cursor-pointer px-0 py-4 text-sm font-medium rounded-t-md ${
                  activeTab === 'Checklist' ? 'bg-gray-100 border-b-2 border-cyan-600 text-cyan-600' : 'text-gray-600'
                } hover:bg-gray-100 hover:text-cyan-600 transition-colors duration-300`}
              >
                <FaTasks className="text-xl mr-2" />
                <span>Checklist</span>
              </button>
            </li>
             <li className="flex-1">
              
              <button
              onClick={goToChifSetup}
              className="bg-green-500 hover:bg-green-700 mt-2 ml-5 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
              
                <span>Project Configuration</span>
              
            </button>

            </li>
          </ul>
        </div>

        {/* Content Section */}
        <div className="bg-gray-100 rounded-lg">
          {renderContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto text-center">
          <p>&copy; 2023 Property Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default SiteConfiguration;
