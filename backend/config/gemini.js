const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Lazy initialization to avoid startup errors
let genAI;

function getGenAIClient() {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key') {
      return null;
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

// Function to generate cover letter using Gemini
async function generateCoverLetter(jobDescription, tone, userInfo) {
  try {
    const client = getGenAIClient();
    if (!client) {
      throw new Error('Gemini API key is not configured');
    }

    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    
    const prompt = `
    Generate a ${tone} cover letter based on the following information:
    
    Job Description:
    ${jobDescription}
    
    Applicant Information:
    - Name: ${userInfo.name || 'Not provided'}
    - Email: ${userInfo.email || 'Not provided'}
    - Phone: ${userInfo.phone || 'Not provided'}
    
    Please generate a professional, well-structured cover letter that:
    1. Addresses the hiring manager appropriately
    2. Highlights relevant skills and experiences
    3. Matches the ${tone} tone
    4. Is concise and to the point (3-4 paragraphs)
    5. Includes a professional closing
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    if (!response) {
      throw new Error('No response from Gemini API');
    }
    
    const text = response.text();
    
    if (!text) {
      throw new Error('Failed to generate cover letter content');
    }
    
    return text;
  } catch (error) {
    console.error('Error generating cover letter with Gemini:', error);
    
    // Provide a fallback cover letter if the API call fails
    return `Dear Hiring Manager,

I am excited to apply for the position. Based on the job description, I believe my skills and experience make me a strong candidate.

[Generated cover letter content would appear here based on the job description and user's resume data]

Sincerely,
${userInfo?.name || 'Applicant'}`;
  }
}

module.exports = {
  generateCoverLetter,
  getGenAIClient
};
