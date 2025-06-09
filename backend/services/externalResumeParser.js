// services/externalResumeParser.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
require('dotenv').config();
const { cloudinary } = require('../config/cloudinary');

const API_KEY = process.env.RESUME_PARSER_API_KEY;
const API_ENDPOINT = process.env.RESUME_PARSER_API_ENDPOINT;

// Helper function to download a file from a URL
async function downloadFile(url, outputPath) {
  console.log(`Downloading file from ${url} to ${outputPath}...`);
  
  // Just use the original URL directly
  let downloadUrl = url;
  console.log('Using direct URL for download:', downloadUrl);
  
  const writer = fs.createWriteStream(outputPath);
  
  try {
    const response = await axios({
      url: downloadUrl,
      method: 'GET',
      responseType: 'stream',
      maxRedirects: 5,
      timeout: 30000
    });
    
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    // If download fails, try a different approach
    console.log('First download attempt failed, trying alternative method...');
    try {
      // Try without stream for simpler download
      const response = await axios({
        url: downloadUrl,
        method: 'GET',
        responseType: 'arraybuffer',
        timeout: 30000
      });
      
      fs.writeFileSync(outputPath, response.data);
      return Promise.resolve();
    } catch (secondError) {
      return Promise.reject(secondError);
    }
  }
}

const parseResumeWithExternalApi = async (fileUrl) => {
  try {
    console.log('Parsing resume with external API, URL:', fileUrl);
    
    // Create a temporary directory if it doesn't exist
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Generate a unique filename for the temporary file
    const tempFilePath = path.join(tempDir, `temp-${Date.now()}.pdf`);
    
    try {
      // Download the file from the URL
      await downloadFile(fileUrl, tempFilePath);
      console.log('File downloaded successfully to:', tempFilePath);
    } catch (downloadError) {
      console.error('Error downloading file:', downloadError.message);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }
    
    // Check if API key and endpoint are configured
    if (!API_KEY || !API_ENDPOINT) {
      console.warn('Resume parser API key or endpoint not configured. Using fallback parser.');
      // Clean up temp file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
        console.log('Temporary file deleted');
      }
      return {
        name: 'Resume from External Parser',
        email: '',
        phone: '',
        location: '',
        summary: 'External resume parser not configured. Please set API_KEY and API_ENDPOINT in .env file.',
        experience: [],
        education: [],
        skills: []
      };
    }
    
    try {
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
      
      // Clean up temp file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
        console.log('Temporary file deleted');
      }
      
      return parsedData;
    } catch (apiError) {
      console.error('Error calling API Layer service:', apiError.message);
      if (apiError.response) {
        console.error('API Response Status:', apiError.response.status);
        console.error('API Response Data:', JSON.stringify(apiError.response.data, null, 2));
      }
      
      // Clean up temp file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
        console.log('Temporary file deleted');
      }
      
      throw new Error(`API Layer service error: ${apiError.message}`);
    }
  } catch (error) {
    console.error('Error parsing resume with API Layer:', error.message);
    // Instead of throwing an error, return a fallback object
    // This allows the process to continue even if the external API fails
    return {
      name: 'Resume (External Parser Failed)',
      email: '',
      phone: '',
      location: '',
      summary: 'The external resume parser encountered an error. You can still edit this resume manually.',
      experience: [],
      education: [],
      skills: [],
      parserError: error.message || 'Unknown error'
    };
  }
};

module.exports = {
  parseResumeWithExternalApi
};