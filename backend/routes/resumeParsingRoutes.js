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



module.exports = router;