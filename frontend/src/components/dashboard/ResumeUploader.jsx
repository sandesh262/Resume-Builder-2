import React, { useCallback, useState, useEffect } from 'react';
import { useAnalysis } from '../../context/AnalysisContext';
import { FaCloudUploadAlt, FaFileAlt, FaEye } from 'react-icons/fa';
import Button from '../common/Button';
import Card from '../common/Card';
import toast from 'react-hot-toast';

const ResumeUploader = () => {
  const { selectedResume, setSelectedResume } = useAnalysis();
  const [resumes, setResumes] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    // Revoke object URLs on cleanup to prevent memory leaks
    return () => {
      resumes.forEach(resume => {
        if (resume.url) {
          URL.revokeObjectURL(resume.url);
        }
      });
    };
  }, [resumes]);

  const handleFileUpload = useCallback((files) => {
    const file = files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF, DOC, or DOCX file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Create file URL for preview
    const fileUrl = URL.createObjectURL(file);

    const newResume = {
      id: Date.now().toString(),
      uploadDate: new Date().toISOString(),
      name: file.name,
      type: file.type,
      size: file.size,
      file: file,
      url: fileUrl
    };

    setResumes(prev => [...prev, newResume]);
    setSelectedResume(newResume);
    toast.success('Resume uploaded successfully!');
  }, [setSelectedResume]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFileUpload(files);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type === 'application/pdf') {
      return <FaFileAlt className="w-6 h-6 text-primary-600" />;
    }
    return <FaFileAlt className="w-6 h-6 text-blue-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Resume</h3>
        
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <FaCloudUploadAlt className="w-12 h-12 mx-auto text-gray-400" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Drop your resume here
          </p>
          <p className="text-sm text-gray-500 mb-4">
            or click to browse files
          </p>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
            id="resume-upload"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('resume-upload').click()}
          >
            Choose File
          </Button>
          <p className="text-xs text-gray-400 mt-2">
            Supports PDF, DOC, DOCX (max 5MB)
          </p>
        </div>
      </Card>

      {/* Resume List */}
      {resumes.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Resumes</h3>
          
          <div className="space-y-3">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className={`flex items-center justify-between p-4 border rounded-lg transition-colors cursor-pointer ${
                  selectedResume?.id === resume.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedResume(resume)}
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(resume.type)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {resume.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(resume.size)} • {new Date(resume.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {selectedResume?.id === resume.id && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Selected
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle preview
                      toast.info('Preview functionality will be implemented');
                    }}
                  >
                    <FaEye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ResumeUploader;