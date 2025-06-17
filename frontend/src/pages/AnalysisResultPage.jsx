import React from 'react';
import Navbar from '../components/layout/Navbar';
import AnalysisDisplay from '../components/dashboard/AnalysisDisplay';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const AnalysisResultPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <Link to="/dashboard" className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <FaArrowLeft className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Back to Dashboard
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Analysis Result
        </h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <AnalysisDisplay />
        </div>
      </div>
    </div>
  );
};

export default AnalysisResultPage;
