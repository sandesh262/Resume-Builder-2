import React, { createContext, useContext, useState } from 'react';

const AnalysisContext = createContext();

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};

export const AnalysisProvider = ({ children }) => {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const addResume = (resume) => {
    const newResume = {
      ...resume,
      id: Date.now().toString(),
      uploadDate: new Date().toISOString()
    };
    setResumes(prev => [...prev, newResume]);
    return newResume;
  };

  const selectResume = (resume) => {
    setSelectedResume(resume);
  };

  const updateJobDescription = (description) => {
    setJobDescription(description);
  };

  const analyzeResume = async () => {
    if (!selectedResume || !jobDescription.trim()) {
      throw new Error('Please select a resume and provide a job description');
    }

    setIsAnalyzing(true);
    
    try {
      // Mock API call - replace with actual API integration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult = {
        jobScore: Math.floor(Math.random() * 40) + 60, // 60-100 for demo
        targetedChanges: [
          {
            section: "Skills",
            suggestion: "Add 'React.js', 'Node.js', and 'TypeScript' to align with the job requirements."
          },
          {
            section: "Experience",
            suggestion: "Quantify your achievements with specific metrics like 'improved performance by 25%'."
          },
          {
            section: "Projects",
            suggestion: "Include more details about your full-stack development projects."
          }
        ],
        overallImprovements: [
          "Strong alignment with technical requirements",
          "Consider adding more specific achievements with numbers",
          "Great educational background for this role",
          "Include links to your portfolio and GitHub profile"
        ]
      };

      setAnalysisResult(mockResult);
      return mockResult;
    } catch (error) {
      throw new Error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysisResult(null);
    setJobDescription('');
    setSelectedResume(null);
  };

  const value = {
    resumes,
    selectedResume,
    jobDescription,
    analysisResult,
    isAnalyzing,
    addResume,
    selectResume,
    updateJobDescription,
    analyzeResume,
    clearAnalysis
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};