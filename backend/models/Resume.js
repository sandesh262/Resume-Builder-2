// server/models/Resume.js
const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    // required: true // Temporarily disabled for testing
  },
  name: {
    type: String,
    required: true
  },
  contact: {
    email: String,
    phone: String,
    location: String,
    linkedin: String
  },
  summary: String,
  jobDescription: String,
  parsedText: String, // To store the manually parsed text from originalResume
  experience: [{
    title: String,
    company: String,
    location: String,
    startDate: Date,
    endDate: Date,
    current: Boolean,
    description: [String]  // Array of bullet points
  }],
  education: [{
    institution: String,
    degree: String,
    field: String,
    startDate: Date,
    endDate: Date,
    gpa: Number
  }],
  skills: [String],
  projects: [{
    name: String,
    description: String,
    technologies: [String],
    link: String
  }],
  // Fields for storing resume directly in MongoDB
  originalResume: {
    data: Buffer,        // To store the file binary data
    contentType: String, // To store the MIME type (e.g., 'application/pdf')
    filename: String,    // Original filename
  },
  analysis: {
    score: Number,
    overview: String,
    strengths: [String],
    improvement_areas: [String],
    missing_keywords: [String],
    missing_skills: [String],
    section_analysis: [{
      section: String,
      score: Number,
      feedback: String,
      suggestions: [String]
    }],
    targeted_improvements: {
      critical: [String],
      recommended: [String],
      optional: [String]
    },
    general_feedback: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  generatedResumes: [{
    name: String,      // Version name
    parsedContent: String, // Parsed text content of the generated version
    createdAt: Date    // When it was generated
  }],
  template: {
    type: String,
    default: 'modern'  // Default template
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  analysis: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

module.exports = mongoose.model('resume', ResumeSchema);