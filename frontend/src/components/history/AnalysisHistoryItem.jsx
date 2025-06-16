import React from 'react';
import { FaClock, FaFileAlt, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AnalysisHistoryItem = ({ analysis, date }) => {
  const { score, overview, jobTitle } = analysis;

  return (
    <div className="group relative bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-primary-200 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-primary-100 rounded-full">
            <FaFileAlt className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{jobTitle || 'Unknown Job'}</h3>
            <p className="text-sm text-gray-500">{date}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-2xl font-bold text-primary-600">
            {score}%
          </div>
          <FaArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
        </div>
      </div>
      
      <div className="mt-4 text-gray-600 line-clamp-2">
        {overview || 'No overview available'}
      </div>
    </div>
  );
};

export default AnalysisHistoryItem;
