// routes/resumeParsingRoutes.js
const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { parseResumeWithExternalApi } = require('../services/externalResumeParser');
const Resume = require('../models/Resume');

router.get('/test', (req, res) => {
    res.json({ message: 'Resume parsing routes are working!' });
});
// @route   POST /api/resume-parsing/parse/:id
// @desc    Parse resume using external API
// @access  Private
router.post('/parse/:id', protect, async (req, res) => {
    try {
        const resumeId = req.params.id;
        const resume = await Resume.findById(resumeId);
        
        if (!resume) {
            return res.status(404).json({ msg: 'Resume not found' });
        }

        // Check if user is authorized
        if (resume.user.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        // Get the file URL from the resume document
        const fileUrl = resume.originalFile.url;
        
        // Parse the resume using external API
        const parsedData = await parseResumeWithExternalApi(fileUrl);
        
        // Update the resume document with parsed data
        resume.parsedData = parsedData;
        resume.updatedAt = Date.now();
        await resume.save();
        
        res.json({
            success: true,
            data: resume
        });
    } catch (error) {
        console.error('Resume parsing error:', error);
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
});

module.exports = router;