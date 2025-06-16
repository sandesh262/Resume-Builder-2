// server/services/resumeParser.js
const axios = require('axios');
const pdf = require('pdf-parse');
const mammoth = require('mammoth'); // Added mammoth for DOCX

// Helper function to extract common details from raw text
const _extractDetailsFromText = (text) => {
  const lowerText = text.toLowerCase(); // Convert to lowercase for consistent matching

  // Extract email
  const emailMatch = lowerText.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/);
  
  // Extract phone
  const phoneMatch = lowerText.match(/(\+\d{1,3}[- ]?)?\d{3}[- ]?\d{3}[- ]?\d{4}/);
  
  // Enhanced name extraction logic
  let name = '';
  const lines = text.split('\n');
  
  // Try to extract name from first few lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    // Skip if line looks like a section header or contains common keywords
    if (line.toLowerCase().includes('resume') || 
        line.toLowerCase().includes('curriculum vitae') ||
        line.toLowerCase().includes('c.v.') ||
        line.toLowerCase().includes('contact') ||
        line.toLowerCase().includes('summary') ||
        line.toLowerCase().includes('objective')) {
      continue;
    }
    
    // Check if line looks like a name
    const words = line.split(' ').filter(w => w.length > 1);
    if (words.length >= 2 && words.length <= 5) {
      // Check if most words look like names (capitalized)
      const nameWords = words.filter(w => /^[A-Z][a-z'-]*$/.test(w));
      if (nameWords.length >= words.length - 1) {
        name = words.join(' ');
        break;
      }
    }
  }
  
  // If no name found, try to extract from filename
  if (!name) {
    const filenameMatch = text.match(/(?:filename|name)[:\s]*([\w\s'-]+)/i);
    if (filenameMatch) {
      name = filenameMatch[1].trim();
    }
  }
  
  // If still no name, use a default
  if (!name) {
    name = 'Unnamed Resume';
  }
  
  // Clean up and format the name
  name = name.replace(/[^a-zA-Z\s'-]/g, '')
             .replace(/\s+/g, ' ')
             .trim();
  name = name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  // Extract location - look for common location keywords
  const locationKeywords = ['address', 'location', 'city', 'state', 'country'];
  let location = '';
  for (const keyword of locationKeywords) {
    const locationMatch = lowerText.match(new RegExp(keyword + '[\s:]*([^\n]*)', 'i'));
    if (locationMatch && locationMatch[1]) {
      location = locationMatch[1].trim();
      break;
    }
  }
  
  // Extract experience - look for common experience keywords
  const experienceKeywords = ['experience', 'work', 'professional', 'career', 'employment history'];
  const experience = [];
  // Basic regex, can be improved significantly
  const expSections = lowerText.split(/\n\s*\n/); // Split by blank lines
  expSections.forEach(section => {
    if (experienceKeywords.some(keyword => section.includes(keyword))) {
      const lines = section.split('\n');
      const title = lines[0] || 'N/A'; // Simplistic title extraction
      const companyMatch = section.match(/(?:at|company|employer)[:\s]*([^\n]+)/i);
      const company = companyMatch ? companyMatch[1].trim() : 'N/A';
      experience.push({
        title: title.trim(),
        company: company,
        description: lines.slice(1).join('\n').trim()
      });
    }
  });

  // Extract education - look for common education keywords
  const educationKeywords = ['education', 'degree', 'university', 'college', 'academic'];
  const education = [];
  const eduSections = lowerText.split(/\n\s*\n/);
  eduSections.forEach(section => {
    if (educationKeywords.some(keyword => section.includes(keyword))) {
      const lines = section.split('\n');
      const degree = lines[0] || 'N/A'; // Simplistic degree extraction
      const schoolMatch = section.match(/(?:at|institution|university|college)[:\s]*([^\n]+)/i);
      const school = schoolMatch ? schoolMatch[1].trim() : 'N/A';
      education.push({
        degree: degree.trim(),
        institution: school, // Changed from school to institution to match model
        description: lines.slice(1).join('\n').trim()
      });
    }
  });
  
  // Extract skills - look for common skill sections
  let skills = [];
  const skillsMatch = lowerText.match(/(?:skills|technical skills|proficiencies)[:\s]*([^\n]+(?:\n(?!\n)[^\n]+)*)/i);
  if (skillsMatch && skillsMatch[1]) {
    skills = skillsMatch[1].split(/[,;•\n]/).map(skill => skill.trim()).filter(skill => skill.length > 1 && skill.length < 50);
  }

  return {
    name: name,
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0] : '',
    location: location,
    summary: '', // Summary extraction is complex, placeholder for now
    experience: experience.slice(0, 5), // Limit entries for brevity
    education: education.slice(0, 5),
    skills: [...new Set(skills)].slice(0, 20) // Unique skills, limited
  };
};

const parseResumeUrl = async (url) => {
  try {
    console.log('Attempting to download file from URL:', url);
    
    const response = await axios.get(url, { 
      responseType: 'arraybuffer',
      timeout: 20000, // Increased timeout slightly
      // It's good practice to have a User-Agent
      headers: {
        'User-Agent': 'ResumeBuilderApp/1.0'
      }
    });
    
    console.log('File downloaded successfully from URL. Size:', response.data.length);
    return Buffer.from(response.data);

  } catch (error) {
    console.error('Error downloading file from URL:', url);
    if (error.response) {
      // Axios error with a response from the server
      console.error('Status:', error.response.status);
      console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
      // console.error('Data:', error.response.data.toString()); // Be careful logging full data if it's large/binary
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something else happened in setting up the request
      console.error('Error message:', error.message);
    }
    console.error('Axios error config:', JSON.stringify(error.config, null, 2));

    // Fallback to placeholder if download fails
    console.log('Creating a placeholder PDF buffer due to download failure.');
    return Buffer.from('%PDF-1.5\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n2 0 obj\n<</Type/Pages/Kids[3 0 R]/Count 1>>\nendobj\n3 0 obj\n<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\n\ntrailer\n<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF');
  }
};

const parseImageWithOCR = async (imageBuffer) => {
  try {
    // For now, we'll use a basic fallback for image-based resumes
    // In production, you would want to integrate with a proper OCR service
    // like Google Cloud Vision or Tesseract.js
    
    console.log('Processing image-based resume...');
    
    // Return a basic structure with placeholder data
    return {
      name: 'Image Resume',
      email: '',
      phone: '',
      location: '',
      summary: 'This is an image-based resume that needs to be processed with OCR',
      experience: [],
      education: [],
      skills: [],
      note: 'This resume is an image file and requires OCR processing to extract text content'
    };
  } catch (error) {
    console.error('Error processing image-based resume:', error);
    throw new Error('Failed to process image-based resume');
  }
};

const parsePDF = async (buffer) => {
  try {
    console.log('Starting PDF parsing, buffer size:', buffer.length);
    
    // Check if buffer is valid
    if (!buffer || buffer.length === 0) {
      console.error('Empty buffer provided to parsePDF');
      return {
        name: 'Unknown',
        email: '',
        phone: '',
        location: '',
        summary: 'Could not parse PDF - empty file',
        experience: [],
        education: [],
        skills: [],
        fullText: '' // Empty text for empty file
      };
    }
    
    // Try to parse the PDF with a timeout to prevent hanging
    let data;
    try {
      data = await Promise.race([
        pdf(buffer), // No options, parse all pages
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('PDF parsing timeout')), 10000)
        )
      ]);
      console.log('PDF parsed successfully, text length:', data.text.length);
      if (data.text && data.text.length > 0 && data.text.length < 200) {
        console.log('Extracted text (short):', data.text);
      }
    } catch (pdfError) {
      console.error('Error in PDF parsing library:', pdfError);
      // Return a basic structure if PDF parsing fails
      return {
        name: 'PDF Resume',
        email: '',
        phone: '',
        location: '',
        summary: 'This PDF could not be parsed automatically. Please edit the details manually.',
        experience: [],
        education: [],
        skills: [],
        fullText: '' // Empty text if parsing failed
      };
    }
    
    const extractedDetails = _extractDetailsFromText(data.text);
    return {
      ...extractedDetails,
      fullText: data.text // Add the full extracted text
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF');
  }
};

const testResumeParser = async (fileUrl) => {
  try {
    // Download the file
    const buffer = await parseResumeUrl(fileUrl);
    
    // Parse the file based on its type
    if (fileUrl.endsWith('.pdf')) {
      return await parsePDF(buffer);
    } else if (fileUrl.endsWith('.png') || fileUrl.endsWith('.jpg') || fileUrl.endsWith('.jpeg')) {
      return await parseImageWithOCR(buffer);
    } else {
      // For other file types
      return {
        name: 'Unknown',
        email: '',
        phone: '',
        location: '',
        summary: 'File type not supported for detailed parsing',
        experience: [],
        education: [],
        skills: []
      };
    }
  } catch (error) {
    console.error('Error in test resume parser:', error);
    throw new Error('Failed to parse resume in test function');
  }
};

// Function to parse DOCX files
const parseDOCX = async (buffer) => {
  try {
    console.log('Starting DOCX parsing, buffer size:', buffer.length);
    if (!buffer || buffer.length === 0) {
      console.error('Empty buffer provided to parseDOCX');
      return {
        name: 'Unknown',
        email: '',
        phone: '',
        location: '',
        summary: 'Could not parse DOCX - empty file',
        experience: [],
        education: [],
        skills: [],
        fullText: ''
      };
    }

    const { value } = await mammoth.extractRawText({ buffer });
    console.log('DOCX parsed successfully, text length:', value.length);
    
    const extractedDetails = _extractDetailsFromText(value);
    return {
      ...extractedDetails,
      fullText: value
    };

  } catch (docxError) {
    console.error('Error in DOCX parsing library:', docxError);
    return {
      name: 'DOCX Resume',
      email: '',
      phone: '',
      location: '',
      summary: 'This DOCX could not be parsed automatically. Please edit the details manually.',
      experience: [],
      education: [],
      skills: [],
      fullText: ''
    };
  }
};

module.exports = {
  parseResumeUrl,
  parsePDF,
  parseDOCX,
  parseImageWithOCR,
  testResumeParser
};