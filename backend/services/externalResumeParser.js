// services/externalResumeParser.js
const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.RESUME_PARSER_API_KEY;
const API_ENDPOINT = process.env.RESUME_PARSER_API_ENDPOINT;

const parseResumeWithExternalApi = async (fileUrl) => {
  try {
    const config = {
      headers: {
        'apikey': API_KEY,
        'Content-Type': 'application/json'
      }
    };

    const response = await axios.post(
      API_ENDPOINT,
      {
        url: fileUrl
      },
      config
    );

    // Transform API response to match our expected format
    const parsedData = {
      name: response.data.name || 'Unknown',
      email: response.data.email || '',
      phone: response.data.phone || '',
      location: response.data.address || '',
      summary: response.data.summary || '',
      experience: response.data.work_experience || [],
      education: response.data.education || [],
      skills: response.data.skills || []
    };

    return parsedData;
  } catch (error) {
    console.error('Error parsing resume with API Layer:', error.response?.data || error.message);
    throw new Error('Failed to parse resume');
  }
};

module.exports = {
  parseResumeWithExternalApi
};