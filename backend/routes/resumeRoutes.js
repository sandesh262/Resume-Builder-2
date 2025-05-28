// server/routes/resumeRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const Resume = require('../models/Resume');
const resumeParser = require('../services/resumeParser');

// @route   POST api/resumes/upload
// @desc    Upload a resume file
// @access  Private
router.post('/upload', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    // Parse the uploaded resume
    const parsedData = await resumeParser.parseResumeUrl(req.file.path);
    
    // Create a new resume entry
    let resume = new Resume({
      user: req.user.id,
      name: parsedData.name || 'My Resume',
      contact: {
        email: parsedData.email || '',
        phone: parsedData.phone || '',
        location: parsedData.location || ''
      },
      summary: parsedData.summary || '',
      experience: parsedData.experience || [],
      education: parsedData.education || [],
      skills: parsedData.skills || [],
      originalResume: {
        url: req.file.path,
        publicId: req.file.filename,
        filename: req.file.originalname,
        uploadDate: new Date()
      }
    });

    await resume.save();
    res.json(resume);
  } catch (err) {
    console.error('Error uploading resume:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/resumes
// @desc    Get all resumes for a user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(resumes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/resumes/:id
// @desc    Get resume by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    
    // Check if resume exists
    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found' });
    }
    
    // Check user owns the resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    res.json(resume);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Resume not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/resumes/:id
// @desc    Delete a resume
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    
    // Check if resume exists
    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found' });
    }
    
    // Check user owns the resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Delete file from Cloudinary if it exists
    if (resume.originalResume && resume.originalResume.publicId) {
      await cloudinary.uploader.destroy(resume.originalResume.publicId);
    }
    
    await resume.remove();
    
    res.json({ msg: 'Resume removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Resume not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;