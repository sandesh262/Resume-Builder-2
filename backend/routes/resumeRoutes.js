// server/routes/resumeRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { upload, cloudinary } = require('../config/cloudinary');
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

    // Parse the uploaded resume using Cloudinary URL
    try {
      console.log('Uploaded file details:', {
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
        filename: req.file.originalname
      });
      
      const fileBuffer = await resumeParser.parseResumeUrl(req.file.path);
      
      // Check file type and use appropriate parser
      let parsedData;
      if (req.file.mimetype === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf')) {
        console.log('Processing as PDF file');
        parsedData = await resumeParser.parsePDF(fileBuffer);
      } else if (req.file.mimetype.startsWith('image/') || 
                ['.png', '.jpg', '.jpeg'].some(ext => req.file.originalname.toLowerCase().endsWith(ext))) {
        console.log('Processing as image file');
        parsedData = await resumeParser.parseImageWithOCR(fileBuffer);
      } else {
        console.log('Unknown file type, using default parser');
        parsedData = {
          name: req.file.originalname.split('.')[0] || 'My Resume',
          email: '',
          phone: '',
          location: '',
          summary: 'File type not supported for detailed parsing',
          experience: [],
          education: [],
          skills: []
        };
      }
      
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
          publicId: req.file.public_id || req.file.filename,
          filename: req.file.originalname,
          uploadDate: new Date()
        }
      });

      await resume.save();
      res.json(resume);
    } catch (error) {
      console.error('Error processing resume:', error);
      // Provide more detailed error information
      res.status(500).json({ 
        error: error.message,
        fileInfo: req.file ? {
          path: req.file.path,
          mimetype: req.file.mimetype,
          size: req.file.size,
          filename: req.file.originalname
        } : 'No file info available',
        step: error.step || 'unknown step'
      });
    }
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
    
    await resume.deleteOne();
    
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