import React, { createContext, useContext, useState } from 'react';
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

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
        setAnalysisResult(analysisResponse.data);
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

  return (
    <AnalysisContext.Provider
      value={{
        isAnalyzing,
        analysisResult,
        error,
        selectedResume,
        jobDescription,
        setSelectedResume,
        setJobDescription,
        analyzeResume,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};