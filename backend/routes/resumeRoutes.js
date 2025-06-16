// server/routes/resumeRoutes.js
// server/routes/resumeRoutes.js
const { analyzeResumeWithGemini } = require('../services/geminiService');
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const Resume = require('../models/Resume');
const resumeParser = require('../services/resumeParser');

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Allow only PDF, DOCX, and image files
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype.startsWith('image/')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload a PDF, DOCX, or image file.'));
    }
  }
});

// @route   POST api/resumes/upload
// @desc    Upload a resume file
// @access  Private
router.post('/upload', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    // Parse the uploaded resume using the file buffer
    try {
      console.log('Uploaded file details (from memory):', {
        mimetype: req.file.mimetype,
        size: req.file.size,
        filename: req.file.originalname
      });
      
      const fileBuffer = req.file.buffer; // Use buffer directly
      
      // Check file type and use appropriate parser
      let parsedData;
      const lowerOriginalName = req.file.originalname.toLowerCase();
      if (req.file.mimetype === 'application/pdf' || lowerOriginalName.endsWith('.pdf')) {
        console.log('Processing as PDF file');
        parsedData = await resumeParser.parsePDF(fileBuffer); // Pass buffer
      } else if (req.file.mimetype.startsWith('image/') || 
                ['.png', '.jpg', '.jpeg'].some(ext => req.file.originalname.toLowerCase().endsWith(ext))) {
        console.log('Processing as image file');
        parsedData = await resumeParser.parseImageWithOCR(fileBuffer); // Pass buffer
      } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || lowerOriginalName.endsWith('.docx')) {
        console.log('Processing as DOCX file');
        parsedData = await resumeParser.parseDOCX(fileBuffer);
      } else {
        console.log('Unknown file type, using default parser');
        parsedData = {
          name: req.file.originalname.split('.')[0] || 'My Resume',
          originalResume: {
            data: req.file.buffer,
            contentType: req.file.mimetype,
            filename: req.file.originalname
          },
          email: '',
          phone: '',
          location: '',
          summary: 'File type not supported for detailed parsing'
        };
      }

      // --- Debug Logging for parsedData ---
      console.log('--- Inspecting Parsed Data ---');
      console.log('Type of parsedData:', typeof parsedData);
      if (typeof parsedData === 'object' && parsedData !== null) {
        console.log('parsedData keys:', Object.keys(parsedData));
        console.log('parsedData.fullText length:', parsedData.fullText ? parsedData.fullText.length : 0);
        console.log('parsedData.parsedText length:', parsedData.parsedText ? parsedData.parsedText.length : 0);
      } else if (typeof parsedData === 'string') {
        console.log('parsedData is a string with length:', parsedData.length);
      }
      console.log('-----------------------------');
      // --- End Debug Logging ---

      // Handle cases where parser returns a raw string or a structured object
      const resumeTextContent = (typeof parsedData === 'string') ? parsedData : (parsedData.fullText || parsedData.parsedText || '');
      const contactInfo = (typeof parsedData === 'object' && parsedData.contact) ? parsedData.contact : {};
      const summaryInfo = (typeof parsedData === 'object' && parsedData.summary) ? parsedData.summary : '';
      const experienceInfo = (typeof parsedData === 'object' && parsedData.experience) ? parsedData.experience : [];
      const educationInfo = (typeof parsedData === 'object' && parsedData.education) ? parsedData.education : [];
      const skillsInfo = (typeof parsedData === 'object' && parsedData.skills) ? parsedData.skills : [];
      const nameInfo = (typeof parsedData === 'object' && parsedData.name) ? parsedData.name : req.file.originalname.split('.')[0] || 'My Resume';

      // Create new resume document
      const newResume = new Resume({
        user: req.user.id,
        name: nameInfo,
        originalResume: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
          filename: req.file.originalname
        },
        contact: {
          email: contactInfo.email || '',
          phone: contactInfo.phone || '',
          location: contactInfo.location || '',
          linkedin: contactInfo.linkedin || ''
        },
        summary: summaryInfo,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        buffer: fileBuffer,
        parsedText: resumeTextContent,
        jobDescription: req.body.jobDescription || '',
        experience: experienceInfo,
        education: educationInfo,
        skills: skillsInfo,
        fullText: resumeTextContent
      });

      // Save the resume
      const savedResume = await newResume.save();

      // Send back a summarized response
      res.status(201).json({
        message: 'Resume uploaded and parsed successfully!',
        resumeId: savedResume._id,
        name: savedResume.name,
        contact: savedResume.contact,
        summary: savedResume.summary,
        experience: savedResume.experience,
        education: savedResume.education,
        skills: savedResume.skills
      });
    } catch (err) {
      console.error('Error uploading resume:', err);
      res.status(500).json({ 
        error: err.message,
        fileInfo: req.file ? {
          mimetype: req.file.mimetype,
          size: req.file.size,
          filename: req.file.originalname
        } : 'No file info available'
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
    const resumes = await Resume.find({ user: req.user.id })
      .select('_id name createdAt')
      .sort({ createdAt: -1 });
    res.json(resumes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/resumes/history
// @desc    Get user's resume analysis history
// @access  Private
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const resumeHistory = await Resume.find({ user: req.user.id })
      .select('analysis jobDescription createdAt originalResume.filename name')
      .sort({ createdAt: -1 });

    // --- Debug Logging for History ---
    console.log('--- Inspecting History Documents ---');
    resumeHistory.forEach(doc => {
      console.log(`Doc ID: ${doc._id}, Name: ${doc.name}, Filename: ${doc.originalResume?.filename}`);
    });
    console.log('------------------------------------');
    // --- End Debug Logging ---

    // Filter out any resumes without analysis
    const filteredHistory = resumeHistory.filter(resume => resume.analysis)
      .map(resume => ({
        ...resume.analysis,
        filename: resume.originalResume?.filename || resume.name || 'Untitled Resume',
        originalname: resume.originalResume?.filename || resume.name || 'Untitled Resume', // Keep for backward compatibility
        jobTitle: resume.jobDescription || 'No job title',
        timestamp: resume.createdAt,
        id: resume._id
      }));

    res.json(filteredHistory);
  } catch (err) {
    console.error('Error fetching analysis history:', err);
    res.status(500).json({ msg: 'Error fetching analysis history' });
  }
});

// @route   GET api/resumes/:id
// @desc    Get resume by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    
    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found' });
    }
    
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
    
    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found' });
    }
    
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // No longer need to delete from Cloudinary
    // if (resume.originalResume && resume.originalResume.publicId) {
    //   await cloudinary.uploader.destroy(resume.originalResume.publicId);
    // }
    
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

// @route   PUT api/resumes/:id/job-description
// @desc    Add or update a job description for a resume
// @access  Private
router.put('/:id/job-description', authMiddleware, async (req, res) => {
  const { jobDescription } = req.body;
  
  if (!jobDescription) {
    return res.status(400).json({ msg: 'Job description is required' });
  }

  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });

    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found' });
    }

    resume.jobDescription = jobDescription;
    resume.updatedAt = Date.now();

    await resume.save();

    res.json({
      message: 'Job description added successfully',
      resumeId: resume._id,
      jobDescription: resume.jobDescription
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Resume not found' });
    }
    res.status(500).json({ 
      msg: 'Server Error', 
      error: err.message 
    });
  }
});

// @route   POST /api/resumes/:id/analyze
// @desc    Analyze a resume against a job description using Gemini
// @access  Private
router.post('/:id/analyze', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });

    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found' });
    }

    if (!resume.jobDescription) {
      return res.status(400).json({ msg: 'Please add a job description first' });
    }

    // Use fullText as a fallback for resume content
    const resumeText = resume.fullText || resume.parsedText || '';

    // --- Enhanced Debug Logging ---
    console.log('--- Analyzing Resume ---');
    console.log('Resume ID:', req.params.id);
    console.log('Job Description Length:', resume.jobDescription ? resume.jobDescription.length : 0);
    console.log('Parsed Text Length:', resume.parsedText ? resume.parsedText.length : 0);
    console.log('Full Text Length:', resume.fullText ? resume.fullText.length : 0);
    console.log('==> Using Resume Text Length:', resumeText.length);
    console.log('------------------------');
    // --- End Debug Logging ---

    // Analyze the resume
    const analysis = await analyzeResumeWithGemini(resumeText, resume.jobDescription);
    
    // Store the analysis results in the resume
    resume.analysis = {
      ...analysis,
      timestamp: Date.now()
    };
    resume.markModified('analysis');
    
    console.log('Attempting to save analysis...');
    await resume.save();
    console.log('Analysis saved successfully.');

    res.json({ success: true, ...resume.analysis });
  } catch (err) {
    console.error('Error saving analysis to database:', err.message);
    res.status(500).json({ 
      success: false, 
      msg: 'Server Error: Could not save analysis to the database.', 
      error: err.message 
    });
  }
});

// @route   DELETE api/resumes/:id
// @desc    Delete a resume analysis
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found' });
    }

    // Make sure user owns the resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
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