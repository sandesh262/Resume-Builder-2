import axiosInstance from './axiosConfig';

export const resumeService = {
  uploadResume: async (formData) => {
    try {
      const response = await axiosInstance.post('/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Upload failed'
      };
    }
  },

  getResumes: async () => {
    try {
      const response = await axiosInstance.get('/resumes');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch resumes'
      };
    }
  },

  analyzeResume: async (resumeId, jobDescription) => {
    try {
      const response = await axiosInstance.post('/resumes/analyze', {
        resumeId,
        jobDescription
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Analysis failed'
      };
    }
  }
};