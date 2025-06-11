import React from 'react';
import { useAnalysis } from '../../context/AnalysisContext';
import { FaCheckCircle, FaBullseye, FaLightbulb, FaChartLine } from 'react-icons/fa';
import JobScoreCircle from './JobScoreCircle';
import TargetedChangeCard from './TargetedChangeCard';
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

  return (
    <div className="space-y-6">
      {/* Job Score */}
      <Card className="p-6">
        <div className="flex justify-center">
          <JobScoreCircle score={analysisResult.jobScore} />
        </div>
      </Card>

      {/* Targeted Changes */}
      {analysisResult.targetedChanges && analysisResult.targetedChanges.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FaBullseye className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Targeted Improvements
            </h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Specific changes to make your resume more aligned with this job:
          </p>
          
          <div className="space-y-3">
            {analysisResult.targetedChanges.map((change) => (
              <TargetedChangeCard
                key={change.suggestion}
                section={change.section}
                suggestion={change.suggestion}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Overall Improvements */}
      {analysisResult.overallImprovements && analysisResult.overallImprovements.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FaLightbulb className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              General Feedback
            </h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Overall observations and recommendations:
          </p>
          
          <div className="space-y-3">
            {analysisResult.overallImprovements.map((improvement) => (
              <div key={improvement} className="flex items-start space-x-3">
                <FaCheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700 leading-relaxed">
                  {improvement}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AnalysisDisplay;