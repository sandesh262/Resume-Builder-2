// server/services/resumeParser.js
const axios = require('axios');
const pdf = require('pdf-parse');

const parseResumeUrl = async (url) => {
  try {
    // Download the file from Cloudinary
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    
    // If it's a PDF
    if (url.endsWith('.pdf')) {
      return await parsePDF(buffer);
    }
    
    // For image-based resumes, use OCR
    if (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg')) {
      return await parseImageWithOCR(buffer);
    }
    
    // For DOCX, you'd need another parser
    return {
      name: 'Unknown',
      email: '',
      phone: '',
      location: '',
      summary: '',
      experience: [],
      education: [],
      skills: []
    };
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw new Error('Failed to parse resume');
  }
};

const parseImageWithOCR = async (imageBuffer) => {
  try {
    // You would need to implement or integrate with an OCR service here
    // For example, you could use Tesseract.js or Google Cloud Vision API
    // This is a placeholder implementation
    
    // For now, we'll return empty fields
    return {
      name: 'Unknown',
      email: '',
      phone: '',
      location: '',
      summary: '',
      experience: [],
      education: [],
      skills: []
    };
  } catch (error) {
    console.error('Error with OCR:', error);
    throw new Error('Failed to process image-based resume');
  }
};

const parsePDF = async (buffer) => {
  try {
    const data = await pdf(buffer);
    
    // Basic extraction logic (will need enhancement)
    const text = data.text;
    
    // Extract email
    const emailMatch = text.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/);
    
    // Extract phone
    const phoneMatch = text.match(/(\+\d{1,3}[- ]?)?\d{3}[- ]?\d{3}[- ]?\d{4}/);

    
    // Extract name (very basic - would need improvement)
    const lines = text.split('\n').filter(line => line.trim());
    const name = lines[0];
    
    return {
      name: name || 'Unknown',
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0] : '',
      location: '',
      summary: '',
      // Basic experience extraction - this would need refinement
      experience: [
        {
          title: 'Position',
          company: 'Company',
          location: 'Location',
          startDate: new Date(),
          endDate: new Date(),
          current: false,
          description: ['Extracted bullet point 1', 'Extracted bullet point 2']
        }
      ],
      education: [],
      skills: []
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF');
  }
};

module.exports = {
  parseResumeUrl
};