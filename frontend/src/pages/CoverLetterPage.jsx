import React, { useState } from 'react';
// Removed unused useAuth import
import { FaFileAlt, FaMagic, FaDownload, FaCopy } from 'react-icons/fa';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import api from '../utils/api';

const CoverLetterPage = () => {
  const [formData, setFormData] = useState({
    jobDescription: '',
    tone: 'professional'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.jobDescription.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('Sending request to:', '/cover-letter');
      console.log('With data:', { jobDescription: formData.jobDescription, tone: formData.tone });
      
      const response = await api.post('/cover-letter', {
        jobDescription: formData.jobDescription,
        tone: formData.tone
      });
      
      if (response.data && response.data.success && response.data.coverLetter) {
        setCoverLetter(response.data.coverLetter);
        toast.success('Cover letter generated successfully!');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error generating cover letter:', error);
      let errorMessage = 'Failed to generate cover letter';
      
      if (error.response) {
        // Server responded with a status other than 200 range
        if (error.response.data && error.response.data.errors && error.response.data.errors.length > 0) {
          errorMessage = error.response.data.errors[0].msg;
        } else if (error.response.status === 401) {
          errorMessage = 'Please log in to generate a cover letter';
        } else if (error.response.status === 400) {
          errorMessage = 'Invalid request. Please check your input.';
        } else if (error.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter);
    toast.success('Copied to clipboard!');
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([coverLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `cover-letter-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <FaFileAlt className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cover Letter Generator</h1>
          <p className="text-gray-600">Create a professional cover letter tailored to your job application</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Job Description
              </label>
              <textarea
                id="jobDescription"
                name="jobDescription"
                rows={8}
                value={formData.jobDescription}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Paste the job description here..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">
                  Tone
                </label>
                <select
                  id="tone"
                  name="tone"
                  value={formData.tone}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="professional">Professional</option>
                  <option value="formal">Formal</option>
                  <option value="friendly">Friendly</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                isLoading={isGenerating}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                <FaMagic className="w-4 h-4" />
                {isGenerating ? 'Generating...' : 'Generate Cover Letter'}
              </Button>
            </div>
          </form>
        </div>

        {coverLetter && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Your Cover Letter</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyToClipboard}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Copy to clipboard"
                >
                  <FaCopy className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Download"
                >
                  <FaDownload className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="prose max-w-none p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
              {coverLetter}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoverLetterPage;
