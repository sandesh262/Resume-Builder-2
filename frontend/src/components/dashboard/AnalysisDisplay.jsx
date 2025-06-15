import React from 'react';
import { useAnalysis } from '../../context/AnalysisContext';
import { 
  FaCheckCircle, 
  FaBullseye, 
  FaLightbulb, 
  FaChartLine, 
  FaThumbsUp, 
  FaTools, 
  FaSearchPlus,
  FaClipboardCheck
} from 'react-icons/fa';
import JobScoreCircle from './JobScoreCircle';
import Card from '../common/Card';
import Spinner from '../common/Spinner';

const AnalysisDisplay = () => {
  const { analysisResult, isAnalyzing } = useAnalysis();

  if (isAnalyzing) {
    return (
      <div className="space-y-6">
        <Card className="p-8">
          <div className="text-center">
            <Spinner size="xl" className="mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Analyzing Your Resume
            </h3>
            <p className="text-gray-600">
              Our AI is comparing your resume with the job requirements...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="space-y-6">
        <Card className="p-8">
          <div className="text-center">
            <FaChartLine className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready for Analysis
            </h3>
            <p className="text-gray-600">
              Upload a resume and provide a job description to get started with your personalized analysis.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Destructure the analysis result with default values
  const {
    score = 0,
    overview = '',
    strengths = [],
    improvement_areas = [],
    missing_keywords = [],
    missing_skills = [],
    section_analysis = [],
    targeted_improvements = { critical: [], recommended: [], optional: [] },
    general_feedback = ''
  } = analysisResult;

  return (
    <div className="space-y-6">
      {/* Header with Score and Overview */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Resume Analysis Results</h2>
            <p className="text-gray-600 mb-4">{overview || 'No overview available.'}</p>
            
            {/* Strengths */}
            {strengths.length > 0 && (
              <div className="mt-4">
                <h3 className="flex items-center text-lg font-semibold text-green-700 mb-2">
                  <FaThumbsUp className="mr-2" /> Key Strengths
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {strengths.map((strength, index) => (
                    <li key={index} className="text-gray-700">{strength}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Score Card */}
          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <JobScoreCircle score={score} />
            <p className="mt-2 text-sm text-gray-600">Match Score</p>
          </div>
        </div>
      </Card>

      {/* Areas for Improvement */}
      {improvement_areas.length > 0 && (
        <Card className="p-6">
          <h3 className="flex items-center text-lg font-semibold text-amber-700 mb-4">
            <FaTools className="mr-2" /> Areas for Improvement
          </h3>
          <ul className="list-disc pl-5 space-y-2">
            {improvement_areas.map((area, index) => (
              <li key={index} className="text-gray-700">{area}</li>
            ))}
          </ul>
        </Card>
      )}

      {/* Missing Keywords & Skills */}
      {(missing_keywords.length > 0 || missing_skills.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {missing_keywords.length > 0 && (
            <Card className="p-6">
              <h3 className="flex items-center text-lg font-semibold text-blue-700 mb-4">
                <FaSearchPlus className="mr-2" /> Missing Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {missing_keywords.map((keyword, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {keyword}
                  </span>
                ))}
              </div>
            </Card>
          )}
          
          {missing_skills.length > 0 && (
            <Card className="p-6">
              <h3 className="flex items-center text-lg font-semibold text-purple-700 mb-4">
                <FaClipboardCheck className="mr-2" /> Missing Skills
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                {missing_skills.map((skill, index) => (
                  <li key={index} className="text-gray-700">{skill}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {/* Section-wise Analysis */}
      {section_analysis.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Section-wise Analysis</h3>
          <div className="space-y-6">
            {section_analysis.map((section, index) => (
              <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                <h4 className="font-medium text-gray-900">{section.section} <span className="text-sm text-gray-500">({section.score}/100)</span></h4>
                <p className="text-gray-600 text-sm mt-1">{section.feedback}</p>
                {section.suggestions && section.suggestions.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {section.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span className="text-gray-700 text-sm">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Targeted Improvements */}
      {(targeted_improvements.critical.length > 0 || 
        targeted_improvements.recommended.length > 0 || 
        targeted_improvements.optional.length > 0) && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Targeted Improvements</h3>
          
          {targeted_improvements.critical.length > 0 && (
            <div className="mb-6">
              <h4 className="flex items-center text-red-700 font-medium mb-2">
                <FaBullseye className="mr-2" /> Critical
              </h4>
              <ul className="space-y-2">
                {targeted_improvements.critical.map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span className="text-gray-800">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {targeted_improvements.recommended.length > 0 && (
            <div className="mb-6">
              <h4 className="flex items-center text-amber-600 font-medium mb-2">
                <FaLightbulb className="mr-2" /> Recommended
              </h4>
              <ul className="space-y-2">
                {targeted_improvements.recommended.map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-amber-500 mr-2">•</span>
                    <span className="text-gray-800">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {targeted_improvements.optional.length > 0 && (
            <div>
              <h4 className="flex items-center text-blue-600 font-medium mb-2">
                <FaCheckCircle className="mr-2" /> Optional
              </h4>
              <ul className="space-y-2">
                {targeted_improvements.optional.map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span className="text-gray-800">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* General Feedback */}
      {general_feedback && (
        <Card className="p-6 bg-blue-50 border-blue-100">
          <h3 className="flex items-center text-lg font-semibold text-blue-800 mb-3">
            <FaLightbulb className="mr-2" /> Expert Advice
          </h3>
          <p className="text-blue-900">{general_feedback}</p>
        </Card>
      )}
    </div>
  );
};

export default AnalysisDisplay;