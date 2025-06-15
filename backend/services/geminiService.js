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
      You are an expert resume analyzer with years of experience in technical recruiting. Your task is to provide a comprehensive, structured analysis of a resume against a given job description.

      Please return your analysis strictly in the following JSON format. Do not include any text, markdown formatting, or explanations outside of the JSON object.

      { 
        "score": <integer, 1-100, overall match score>,
        "overview": "<string, a detailed 2-3 sentence summary of the candidate's fit for the role>",
        "strengths": [
          "<string, a key strength>",
          "<string, another key strength>"
        ],
        "improvement_areas": [
          "<string, a key area for improvement>",
          "<string, another key area for improvement>"
        ],
        "missing_keywords": [
          "<string, an important keyword from the job description missing in the resume>"
        ],
        "missing_skills": [
          "<string, an important skill from the job description missing in the resume>"
        ],
        "section_analysis": [
          {
            "section": "<string, e.g., 'Experience', 'Education', 'Skills'>",
            "score": <integer, 1-100, score for this section>,
            "feedback": "<string, detailed feedback on this section's content and relevance>",
            "suggestions": [
              "<string, an actionable suggestion for this section>"
            ]
          }
        ],
        "targeted_improvements": {
          "critical": [
            "<string, a critical change that must be made>"
          ],
          "recommended": [
            "<string, a highly recommended change>"
          ],
          "optional": [
            "<string, a nice-to-have change>"
          ]
        },
        "general_feedback": "<string, a concluding paragraph with final thoughts and encouragement.>"
      }

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
