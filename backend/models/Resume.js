// server/models/Resume.js
const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
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
  // Cloudinary-specific fields
  originalResume: {
    url: String,       // Cloudinary URL
    publicId: String,  // Cloudinary public ID
    filename: String,  // Original filename
    uploadDate: Date   // When it was uploaded
  },
  generatedResumes: [{
    url: String,       // Cloudinary URL
    publicId: String,  // Cloudinary public ID
    name: String,      // Version name
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
  }
});

module.exports = mongoose.model('resume', ResumeSchema);