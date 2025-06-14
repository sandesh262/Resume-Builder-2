import React, { useState } from 'react';
import Button from '../common/Button';
import { FiCopy, FiDownload } from 'react-icons/fi';
import { saveAs } from 'file-saver';
import api from '../../utils/api';

export default function CoverLetterTab() {
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      alert('Please enter a job description');
      return;
    }

    try {
      setIsGenerating(true);
      const response = await api.post('/cover-letter', {
        jobDescription,
        tone
      });
      setCoverLetter(response.data.coverLetter);
    } catch (error) {
      console.error('Error generating cover letter:', error);
      alert('Failed to generate cover letter. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    alert('Cover letter copied to clipboard!');
  };

  const handleDownload = () => {
    const blob = new Blob([coverLetter], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'cover-letter.txt');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Generate Cover Letter</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={8}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="casual">Casual</option>
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
            </select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !jobDescription.trim()}
            className="w-full"
          >
            {isGenerating ? 'Generating...' : 'Generate Cover Letter'}
          </Button>
        </div>
      </div>

      {coverLetter && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Cover Letter</h2>
            <div className="flex space-x-2">
              <button
                onClick={handleCopy}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Copy to clipboard"
              >
                <FiCopy className="w-5 h-5" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Download as text file"
              >
                <FiDownload className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded border border-gray-200">
            {coverLetter}
          </div>
        </div>
      )}
    </div>
  );
}
