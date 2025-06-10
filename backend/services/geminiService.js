// services/geminiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Lazily initialize the client to avoid startup errors
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

/**
 * Analyzes a resume against a job description using the Gemini API.
 * @param {string} resumeText - The full text of the resume.
 * @param {string} jobDescription - The text of the job description.
 * @returns {Promise<object>} - The analysis result from Gemini.
 */
async function analyzeResumeWithGemini(resumeText, jobDescription) {
  const client = getGenAIClient();
  if (!client) {
    console.error('GEMINI_API_KEY is not set. Cannot analyze resume.');
    return { success: false, error: 'GEMINI_API_KEY is not set in the environment variables.' };
  }

  try {
    const model = client.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `
      Analyze the following resume based on the provided job description.
      First, provide a score from 1 to 100 indicating how well the resume matches the job description. The score should be on its own line, like this: "Score: 85".
      Then, provide a brief, one-paragraph summary of why you gave that score, highlighting the key strengths and weaknesses of the resume in relation to the job description.

      Job Description:
      ---
      ${jobDescription}
      ---

      Resume Text:
      ---
      ${resumeText}
      ---
    `;

    console.log("Sending prompt to Gemini...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();
    
    console.log("Received analysis from Gemini:", analysis);

    return { success: true, analysis };

  } catch (error) {
    console.error("Error calling Gemini API:", error.message);
    // Check for specific safety-related errors
    if (error.message.includes('SAFETY')) {
        return { success: false, error: 'The request was blocked due to safety settings. Please check the content.' };
    }
    return { success: false, error: "Failed to analyze resume with Gemini." };
  }
}

module.exports = { analyzeResumeWithGemini };
