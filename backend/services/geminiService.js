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
      You are an expert resume analyzer. Analyze the following resume based on the provided job description.
      Provide your analysis in a JSON format. The JSON object should have the following keys:
      - "score": An integer from 1 to 100 representing the match score.
      - "summary": A one-paragraph summary explaining the score, highlighting key strengths and weaknesses.
      - "pros": An array of strings, where each string is a specific strength of the resume.
      - "cons": An array of strings, where each string is a specific weakness or area for improvement.
      - "section_scores": An array of objects, where each object has "section_name" (string) and "score" (integer 0-100). Analyze these sections: 'Summary', 'Experience', 'Education', and 'Skills'.

      Do not include any text outside of the JSON object, including markdown formatting.

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
    const analysisText = response.text();
    
    console.log("Received analysis from Gemini:", analysisText);

    // The Gemini API might wrap the JSON in ```json ... ```, so we need to extract it.
    const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : analysisText;
    
    try {
      const parsedAnalysis = JSON.parse(jsonString);
      return { success: true, ...parsedAnalysis };
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", parseError);
      console.error("Raw Gemini response was:", analysisText);
      return { success: false, error: "Failed to parse analysis from Gemini." };
    }

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
