// routes/resumeParsingRoutes.js
const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const resumeParser = require('../services/resumeParser');
const Resume = require('../models/Resume');
const jwt = require('jsonwebtoken');
require('dotenv').config();

router.get('/test', (req, res) => {
    res.json({ message: 'Resume parsing routes are working!' });
});

// Test route to check if a resume exists without authentication
router.get('/check/:id', async (req, res) => {
    try {
        const resumeId = req.params.id;
        console.log('Checking for resume with ID:', resumeId);
        
        // Try to find by exact ID first
        let resume = await Resume.findById(resumeId);
        
        if (!resume) {
            console.log('Resume not found by ID, trying to find by other means...');
            
            // Try to find by string comparison (in case of formatting issues)
            const allResumes = await Resume.find({});
            console.log('Total resumes found:', allResumes.length);
            
            // Log all resume IDs for comparison
            allResumes.forEach(r => {
                console.log(`Resume ID: ${r._id}, toString: ${r._id.toString()}, equals: ${r._id.toString() === resumeId}`);
            });
            
            // Try to find a match
            resume = allResumes.find(r => r._id.toString() === resumeId);
            
            if (!resume) {
                return res.status(404).json({ 
                    msg: 'Resume not found', 
                    requestedId: resumeId,
                    availableIds: allResumes.map(r => r._id.toString())
                });
            }
        }
        
        res.json({
            message: 'Resume found',
            resumeId: resume._id,
            resumeIdString: resume._id.toString(),
            name: resume.name,
            user: resume.user.toString(),
            fileUrl: resume.originalResume?.url || 'No URL found',
            fullResume: resume
        });
    } catch (error) {
        console.error('Error checking resume:', error);
        res.status(500).json({ 
            msg: 'Server error', 
            error: error.message,
            stack: error.stack
        });
    }
});

// Test endpoint for parsing resumes without auth checks (FOR DEVELOPMENT ONLY)
router.get('/test-parse/:id', async (req, res) => {
    try {
        const resumeId = req.params.id;
        console.log('Test parsing resume with ID:', resumeId);
        
        // Find resume by ID
        const resume = await Resume.findById(resumeId);
        
        if (!resume) {
            return res.status(404).json({ msg: 'Resume not found' });
        }
        
        // Get the file URL from the resume document
        const fileUrl = resume.originalResume.url;
        console.log('Parsing resume URL:', fileUrl);
        
        // Parse the resume using the local parser
        try {
            const parsedData = await resumeParser.parseResumeUrl(fileUrl);
            console.log('Local parser result:', parsedData);

            // Update resume with parsed data
            const updatedResume = await Resume.findByIdAndUpdate(
                resumeId,
                { $set: parsedData },
                { new: true }
            );

            return res.json({
                success: true,
                data: updatedResume,
                note: 'Used local parser'
            });
        } catch (parseError) {
            console.error('Error with local parser:', parseError);

            // If local parser fails, update with error message
            const updatedResume = await Resume.findByIdAndUpdate(
                resumeId,
                {
                    $set: {
                        name: 'Resume (Parser Failed)',
                        summary: 'The local parser encountered an error. You can still edit this resume manually.'
                    }
                },
                { new: true }
            );

            return res.json({
                success: false, // Indicate failure more clearly
                data: updatedResume,
                error: 'Local parser failed',
                errorMessage: parseError.message
            });
        }
    } catch (error) {
        console.error('Server error in test-parse:', error);
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
});

// Debug route to list all resumes
router.get('/list-all', async (req, res) => {
    try {
        console.log('Listing all resumes');
        
        const resumes = await Resume.find({}).select('_id name user');
        
        if (!resumes || resumes.length === 0) {
            return res.status(404).json({ msg: 'No resumes found' });
        }
        
        // Log the IDs for comparison
        console.log('Resume IDs in database:');
        resumes.forEach(resume => {
            console.log(`ID: ${resume._id}, Type: ${typeof resume._id}`);
        });
        
        res.json({
            count: resumes.length,
            resumes: resumes.map(resume => ({
                id: resume._id,
                name: resume.name,
                user: resume.user
            }))
        });
    } catch (error) {
        console.error('Error listing resumes:', error);
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
});

// Helper function to extract token from request
const extractToken = (req) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
        return req.query.token;
    }
    return null;
};

// @route   GET or POST /api/resume-parsing/parse/:id
// @desc    Parse resume using external API
// @access  Private
router.all('/parse/:id', async (req, res) => {
    // Handle authentication manually to support both query param and header token
    const token = extractToken(req);
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    
    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
    } catch (err) {
        return res.status(401).json({ msg: 'Token is not valid' });
    }
    try {
        const resumeId = req.params.id;
        const resume = await Resume.findById(resumeId);
        
        if (!resume) {
            return res.status(404).json({ msg: 'Resume not found' });
        }

        // Check if user is authorized
        console.log('User from token:', req.user.id);
        console.log('Resume owner:', resume.user.toString());
        
        if (resume.user.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        // Get the file URL from the resume document
        const fileUrl = resume.originalResume.url;
        
        if (!fileUrl) {
            return res.status(400).json({ msg: 'No resume file URL found' });
        }
        
        // Parse the resume using local parser
        const parsedData = await resumeParser.parseResumeUrl(fileUrl);
        
        // Update the resume document with parsed data
        // Merge the parsed data into the resume
        if (parsedData.name) resume.name = parsedData.name;
        if (parsedData.email) resume.contact.email = parsedData.email;
        if (parsedData.phone) resume.contact.phone = parsedData.phone;
        if (parsedData.location) resume.contact.location = parsedData.location;
        if (parsedData.summary) resume.summary = parsedData.summary;
        if (parsedData.experience && parsedData.experience.length > 0) resume.experience = parsedData.experience;
        if (parsedData.education && parsedData.education.length > 0) resume.education = parsedData.education;
        if (parsedData.skills && parsedData.skills.length > 0) resume.skills = parsedData.skills;
        
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