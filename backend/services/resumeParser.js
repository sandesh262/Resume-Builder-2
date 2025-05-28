// server/services/resumeParser.js
const axios = require('axios');
const pdf = require('pdf-parse');
const { cloudinary } = require('../config/cloudinary');

const parseResumeUrl = async (url) => {
  try {
    console.log('Downloading file from URL:', url);
    
    // For Cloudinary URLs, we need to ensure they're accessible
    // Sometimes Cloudinary requires special handling for PDFs
    if (url.includes('cloudinary.com')) {
      // Extract the Cloudinary details from the URL
      const cloudName = url.split('/')[3]; // e.g., ds4pkrro9
      const version = url.match(/v\d+/)?.[0] || ''; // e.g., v1748433046
      const folder = url.split('/')[url.split('/').length - 2]; // e.g., resume-builder
      const publicId = url.split('/').pop().split('.')[0]; // e.g., file_x1xcal
      
      console.log('Cloudinary details:', { cloudName, version, folder, publicId });
      
      // Construct a direct download URL with fl_attachment
      const directUrl = `https://res.cloudinary.com/${cloudName}/image/upload/fl_attachment/${version}/${folder}/${publicId}.pdf`;
      
      console.log('Using direct download URL:', directUrl);
      
      try {
        // Try with the direct download URL first
        const response = await axios.get(directUrl, { 
          responseType: 'arraybuffer',
          timeout: 15000
        });
        
        console.log('File downloaded successfully using direct URL');
        return Buffer.from(response.data);
      } catch (directError) {
        console.log('Direct download failed, trying original URL:', directError.message);
        // Fall back to the original URL
      }
    }
    
    // Try the original URL as a fallback
    const response = await axios.get(url, { 
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: {
        // Add headers that might help with access
        'Accept': 'application/pdf,application/octet-stream',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    console.log('File downloaded successfully');
    return Buffer.from(response.data);
  } catch (error) {
    console.error('Error downloading file:', error);
    
    // Create a dummy buffer with basic PDF content as a last resort
    console.log('Creating a placeholder PDF buffer');
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
        skills: []
      };
    }
    
    // Try to parse the PDF with a timeout to prevent hanging
    let data;
    try {
      data = await Promise.race([
        pdf(buffer, {
          // Add options to improve parsing reliability
          max: 2, // only parse first two pages for speed
          pagerender: function(pageData) { return pageData.getTextContent(); }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('PDF parsing timeout')), 10000)
        )
      ]);
      console.log('PDF parsed successfully, text length:', data.text.length);
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
        skills: []
      };
    }
    
    const text = data.text.toLowerCase(); // Convert to lowercase for consistent matching
    
    // Extract email
    const emailMatch = text.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/);
    
    // Extract phone
    const phoneMatch = text.match(/(\+\d{1,3}[- ]?)?\d{3}[- ]?\d{3}[- ]?\d{4}/);
    
    // Extract name - look for common name patterns
    const nameMatch = text.match(/([a-z]+\s+[a-z]+)/);
    const name = nameMatch ? nameMatch[0] : 'Unknown';
    
    // Extract location - look for common location keywords
    const locationKeywords = ['address', 'location', 'city', 'state', 'country'];
    let location = '';
    for (const keyword of locationKeywords) {
      const locationMatch = text.match(new RegExp(keyword + '.*?(?=\n|$)', 'i'));
      if (locationMatch) {
        location = locationMatch[0].replace(keyword, '').trim();
        break;
      }
    }
    
    // Extract experience - look for common experience keywords
    const experienceKeywords = ['experience', 'work', 'professional', 'career'];
    const experience = [];
    for (const keyword of experienceKeywords) {
      const expSections = text.match(new RegExp(keyword + '.*?(?=\n\n|$)', 'gi'));
      if (expSections) {
        expSections.forEach(section => {
          const titleMatch = section.match(/\b\w+\s+\w+\b/);
          const companyMatch = section.match(/at\s+\w+/i);
          
          if (titleMatch && companyMatch) {
            experience.push({
              title: titleMatch[0],
              company: companyMatch[0].replace('at', '').trim(),
              description: section.split('\n').slice(1).join('\n')
            });
          }
        });
      }
    }
    
    // Extract education - look for common education keywords
    const educationKeywords = ['education', 'degree', 'university', 'college'];
    const education = [];
    for (const keyword of educationKeywords) {
      const eduSections = text.match(new RegExp(keyword + '.*?(?=\n\n|$)', 'gi'));
      if (eduSections) {
        eduSections.forEach(section => {
          const degreeMatch = section.match(/\b\w+\s+\w+\b/);
          const schoolMatch = section.match(/at\s+\w+/i);
          
          if (degreeMatch && schoolMatch) {
            education.push({
              degree: degreeMatch[0],
              school: schoolMatch[0].replace('at', '').trim(),
              description: section.split('\n').slice(1).join('\n')
            });
          }
        });
      }
    }
    
    // Extract skills - look for common skill sections
    const skills = [];
    const skillSections = text.match(/skills.*?(?=\n\n|$)/i);
    if (skillSections) {
      skillSections.forEach(section => {
        const skillList = section.split(',').map(skill => skill.trim());
        skills.push(...skillList);
      });
    }
    
    return {
      name: name,
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0] : '',
      location: location,
      summary: '',
      experience: experience,
      education: education,
      skills: skills
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

module.exports = {
  parseResumeUrl,
  parsePDF,
  parseImageWithOCR,
  testResumeParser
};