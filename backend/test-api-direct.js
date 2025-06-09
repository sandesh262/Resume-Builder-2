// Script to test the resume parser API with direct file upload
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
require('dotenv').config();

const API_KEY = process.env.RESUME_PARSER_API_KEY;
const API_ENDPOINT = process.env.RESUME_PARSER_API_ENDPOINT;

// Sample PDF URL - using the Cloudinary PDF
const TEST_PDF_URL = 'https://res.cloudinary.com/ds4pkrro9/image/upload/v1748434532/resume-builder/file_slkrjk.pdf';

async function downloadFile(url, outputPath) {
  console.log(`Downloading file from ${url} to ${outputPath}...`);
  const writer = fs.createWriteStream(outputPath);
  
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });
  
  response.data.pipe(writer);
  
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function testResumeParserAPIWithDirectUpload() {
  console.log('Testing Resume Parser API with Direct File Upload');
  console.log('API Key:', API_KEY ? 'Configured' : 'Missing');
  console.log('API Endpoint:', API_ENDPOINT);
  
  if (!API_KEY || !API_ENDPOINT) {
    console.error('API Key or Endpoint not configured in .env file');
    return;
  }
  
  try {
    // Download the PDF file
    const tempFilePath = path.join(__dirname, 'temp-resume.pdf');
    await downloadFile(TEST_PDF_URL, tempFilePath);
    console.log('File downloaded successfully');
    
    // Create form data with the file
    const form = new FormData();
    form.append('file', fs.createReadStream(tempFilePath));
    
    // Send the file to the API
    console.log('Sending file to API...');
    const config = {
      headers: {
        ...form.getHeaders(),
        'apikey': API_KEY
      },
      timeout: 30000 // 30 second timeout
    };
    
    const response = await axios.post(
      API_ENDPOINT,
      form,
      config
    );
    
    console.log('API Response Status:', response.status);
    console.log('API Response Data:', JSON.stringify(response.data, null, 2));
    console.log('API Test Successful!');
    
    // Clean up temp file
    fs.unlinkSync(tempFilePath);
    console.log('Temporary file deleted');
  } catch (error) {
    console.error('API Test Failed!');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
    
    // Clean up temp file if it exists
    const tempFilePath = path.join(__dirname, 'temp-resume.pdf');
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
      console.log('Temporary file deleted');
    }
  }
}

// Run the test
testResumeParserAPIWithDirectUpload();
