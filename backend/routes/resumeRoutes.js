// server/routes/resumeRoutes.js
// server/routes/resumeRoutes.js
const { analyzeResumeWithGemini } = require('../services/geminiService');
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer'); // Added multer
const Resume = require('../models/Resume');
const resumeParser = require('../services/resumeParser');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
          email: '',
          phone: '',
          location: '',
          summary: 'File type not supported for detailed parsing',
          experience: [],
          education: [],
          skills: [],
          fullText: '' // Default empty fullText for unsupported types
        };
      }
      
      // Create a new resume entry
      let resume = new Resume({
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
        parsedText: parsedData.fullText || '', // Save the full parsed text
        originalResume: {
          data: req.file.buffer, // Store file buffer
          contentType: req.file.mimetype, // Store content type
          filename: req.file.originalname
        }
      });

      await resume.save();
      
      // Send back a summarized response, not the whole document
      res.status(201).json({
        message: 'Resume uploaded and parsed successfully!',
        resumeId: resume._id,
        name: resume.name,
        contact: resume.contact,
        summary: resume.summary,
        experience: resume.experience,
        education: resume.education,
        skills: resume.skills
      });
    } catch (error) {
      console.error('Error processing resume:', error);
      res.status(500).json({ 
        error: error.message,
        fileInfo: req.file ? {
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
    const resumes = await Resume.find({ user: req.user.id })
      .select('_id name createdAt')
      .sort({ createdAt: -1 });
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
router.put('/:id/job-description', async (req, res) => {
  const { jobDescription } = req.body;
  
  if (!jobDescription) {
    return res.status(400).json({ msg: 'Job description is required' });
  }

  try {
    const resume = await Resume.findById(req.params.id);

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
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/resumes/:id/analyze
// @desc    Analyze a resume against a job description using Gemini
// @access  Private
router.post('/:id/analyze', async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found' });
    }

    if (!resume.jobDescription) {
      return res.status(400).json({ msg: 'Job description is missing. Please add one first.' });
    }

    if (!resume.parsedText) {
      return res.status(400).json({ msg: 'Resume has not been parsed yet.' });
    }

    // Call the Gemini service to get the structured analysis
    const analysisResult = await analyzeResumeWithGemini(resume.parsedText, resume.jobDescription);

    if (!analysisResult.success) {
      console.error('Gemini analysis failed:', analysisResult.error);
      return res.status(500).json({ msg: 'Error analyzing resume with Gemini', error: analysisResult.error });
    }

    // Save the structured analysis to the resume document
    resume.analysis = {
      score: analysisResult.score,
      summary: analysisResult.summary,
      pros: analysisResult.pros,
      cons: analysisResult.cons,
      analyzedAt: new Date()
    };
    
    await resume.save();

    // Send the new analysis back to the client
    res.json(resume.analysis);

  } catch (err) {
    console.error('Error in /analyze route:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;