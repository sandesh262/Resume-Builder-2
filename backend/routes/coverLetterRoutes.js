const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateCoverLetter } = require('../config/gemini');

// @route   POST /
// @desc    Generate cover letter
// @access  Private
console.log('Setting up cover letter route...');
router.post(
  '/',
  [
    (req, res, next) => {
      console.log('Auth middleware running...');
      next();
    },
    auth,
    [
      check('jobDescription', 'Job description is required').not().isEmpty(),
      check('tone', 'Tone is required').isIn(['formal', 'professional', 'friendly']),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    
    console.log('Request body:', req.body);

    const { jobDescription, tone } = req.body;

    try {
      // Get user's data
      const user = await User.findById(req.user.id).select('-password');
      
      // Generate cover letter using Gemini API
      const coverLetter = await generateCoverLetter(
        jobDescription,
        tone,
        {
          name: user?.name || 'Applicant',
          email: user?.email || '',
          phone: user?.phone || ''
        }
      );
      
      if (!coverLetter) {
        throw new Error('Failed to generate cover letter');
      }

      // Return the generated cover letter
      res.status(200).json({ 
        success: true, 
        coverLetter 
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
