import React, { useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import Navbar from '../components/layout/Navbar';
import ResumeUploader from '../components/dashboard/ResumeUploader';
import JobDescriptionInput from '../components/dashboard/JobDescriptionInput';
import { useNavigate } from 'react-router-dom';
import CoverLetterTab from '../components/dashboard/CoverLetterTab';
import Button from '../components/common/Button';
import { FaChartBar, FaFileAlt, FaPencilAlt } from 'react-icons/fa';
import ResumePreview from '../components/dashboard/ResumePreview';
import toast from 'react-hot-toast';

const DashboardPage = () => {

  const [activeTab, setActiveTab] = useState('resume'); // 'resume' or 'coverLetter'
  const navigate = useNavigate();
  const { 
    selectedResume, 
    jobDescription, 
    analyzeResume, 
    isAnalyzing, 
    clearAnalysis 
  } = useAnalysis();

  const canAnalyze = selectedResume && jobDescription.trim().length >= 50;

  const handleAnalyze = async () => {
    try {
      await analyzeResume();
      navigate('/analysis-result');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {activeTab === 'resume' ? 'Resume Analysis' : 'Cover Letter Generator'}
          </h1>
          <p className="text-gray-600">
            {activeTab === 'resume' 
              ? 'Upload your resume and compare it with job descriptions to get personalized improvement suggestions.'
              : 'Generate a professional cover letter tailored to your job application.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('resume')}
              className={`${activeTab === 'resume' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <FaChartBar className="inline mr-2" />
              Resume Analysis
            </button>
            <button
              onClick={() => setActiveTab('coverLetter')}
              className={`${activeTab === 'coverLetter' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <FaFileAlt className="inline mr-2" />
              Cover Letter
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'resume' ? ( <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Input */}
            <div className="space-y-6">
              <ResumeUploader />
              <JobDescriptionInput />
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleAnalyze}
                  disabled={!canAnalyze}
                  isLoading={isAnalyzing}
                  size="lg"
                  className="flex-1"
                >
                  <FaChartBar className="w-5 h-5 mr-2" />
                  Analyze Resume
                </Button>
                
                <Button
                  onClick={clearAnalysis}
                  variant="secondary"
                  size="lg"
                  className="sm:w-auto"
                >
                  Clear
                </Button>
              </div>
              
              {!canAnalyze && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    {!selectedResume && "Please select a resume. "}
                    {selectedResume && jobDescription.trim().length < 50 && "Please provide a job description (minimum 50 characters)."}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Preview + Edit */}
            <div className="space-y-4 lg:pl-4">
              <ResumePreview file={selectedResume?.file || selectedResume} />

              <Button
                onClick={() => toast('Edit functionality coming soon!', { icon: '🔜' })}
                disabled={!selectedResume}
                size="lg"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
              >
                <FaPencilAlt className="w-4 h-4" />
                Edit Resume (Coming Soon)
              </Button>
            </div>
          </div>

          </>
        ) : (
          <CoverLetterTab />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;