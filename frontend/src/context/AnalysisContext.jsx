import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api'; // Import the centralized api utility

const AnalysisContext = createContext();

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};

export const AnalysisProvider = ({ children }) => {
  const [selectedResume, setSelectedResume] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('resumeAnalysisHistory');
    if (savedHistory) {
      setAnalysisHistory(JSON.parse(savedHistory));
    }
    // Also fetch from API
    const fetchHistory = async () => {
      try {
        const response = await api.get('/resumes/history');
        const apiHistory = response.data || [];
        // Update both state and localStorage
        setAnalysisHistory(apiHistory);
        localStorage.setItem('resumeAnalysisHistory', JSON.stringify(apiHistory));
      } catch (err) {
        console.error('Error fetching analysis history:', err);
      }
    };
    fetchHistory();
  }, []);

  const analyzeResume = async () => {
    if (!selectedResume || !jobDescription) {
      setError('Please select a resume and provide a job description.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null); // Clear previous results

    try {
      // Step 1: Upload the resume file using the api utility
      const uploadFormData = new FormData();
      uploadFormData.append('resume', selectedResume.file);

      const uploadRes = await api.post('/resumes/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const resumeId = uploadRes.data.resumeId;

      // Step 2: Update the job description for the resume
      await api.put(`/resumes/${resumeId}/job-description`, { jobDescription });

      // Step 3: Trigger the analysis
      const analysisResponse = await api.post(`/resumes/${resumeId}/analyze`);

      // Log the raw data to the browser console for inspection
      console.log('Analysis data received from API:', analysisResponse.data);

      if (analysisResponse.data) {
        handleAnalysisComplete(analysisResponse.data);
      } else {
        throw new Error('Analysis returned no data.');
      }

    } catch (err) {
      console.error('An error occurred during the analysis process:', err);
      const errorMsg = err.response?.data?.error || err.message || 'An unexpected error occurred. Please try again.';
      setError(errorMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalysisComplete = (analysisData) => {
    setAnalysisResult(analysisData);
    // Add the new analysis to history and persist to localStorage
    const newHistory = [
      { ...analysisData, timestamp: new Date().toISOString() },
      ...analysisHistory
    ];
    setAnalysisHistory(newHistory);
    localStorage.setItem('resumeAnalysisHistory', JSON.stringify(newHistory));
  };

  const deleteAnalysis = async (id) => {
    try {
      await api.delete(`/resumes/${id}`);
      const newHistory = analysisHistory.filter((analysis) => analysis._id !== id);
      setAnalysisHistory(newHistory);
      localStorage.setItem('resumeAnalysisHistory', JSON.stringify(newHistory));
    } catch (err) {
      console.error('Error deleting analysis:', err);
      setError(err.response?.data?.error || 'Failed to delete analysis.');
    }
  };

  return (
    <AnalysisContext.Provider
      value={{
        isAnalyzing,
        analysisResult,
        error,
        analysisHistory,
        selectedResume,
        jobDescription,
        setSelectedResume,
        setJobDescription,
        analyzeResume,
        handleAnalysisComplete,
        deleteAnalysis
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};