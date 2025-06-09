// Simple script to test the resume parser API
const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.RESUME_PARSER_API_KEY;
const API_ENDPOINT = process.env.RESUME_PARSER_API_ENDPOINT;

// Sample PDF URL - using a public PDF for testing
const TEST_PDF_URL = 'https://res.cloudinary.com/ds4pkrro9/image/upload/v1748434532/resume-builder/file_slkrjk.pdf';

async function testResumeParserAPI() {
  console.log('Testing Resume Parser API');
  console.log('API Key:', API_KEY ? 'Configured' : 'Missing');
  console.log('API Endpoint:', API_ENDPOINT);
  console.log('Test PDF URL:', TEST_PDF_URL);
  
  if (!API_KEY || !API_ENDPOINT) {
    console.error('API Key or Endpoint not configured in .env file');
    return;
  }
  
  try {
    console.log('Sending request to API...');
    
    const config = {
      headers: {
        'apikey': API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    };
    
    const response = await axios.post(
      API_ENDPOINT,
      {
        url: TEST_PDF_URL
      },
      config
    );
    
    console.log('API Response Status:', response.status);
    console.log('API Response Headers:', response.headers);
    console.log('API Response Data:', JSON.stringify(response.data, null, 2));
    console.log('API Test Successful!');
  } catch (error) {
    console.error('API Test Failed!');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Headers:', error.response.headers);
      console.error('Response Data:', error.response.data);
    }
  }
}

// Run the test
testResumeParserAPI();
