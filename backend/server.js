// server/server.js
// Load environment variables first
require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');

// Connect to database
connectDB();

const app = express();
const resumeParser = require('./services/resumeParser');

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
};

// Init middleware
app.use(cors(corsOptions));
app.use(express.json({ extended: false }));

// Apply auth middleware to all API routes except auth routes
app.use('/api', (req, res, next) => {
  // Skip auth for auth endpoints
  if (req.path.startsWith('/auth/') || req.path === '/auth') {
    return next();
  }
  // Use the auth middleware for all other API routes
  const auth = require('./middleware/authMiddleware');
  return auth(req, res, next);
});

// Define routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/resumes', require('./routes/resumeRoutes'));
app.use('/api/resume-parsing', require('./routes/resumeParsingRoutes'));

// Test endpoint for resume parsing
app.post('/api/test-resume-parser', async (req, res) => {
  try {
    const { fileUrl } = req.body;
    if (!fileUrl) {
      return res.status(400).json({ error: 'File URL is required' });
    }
    
    const parsedData = await resumeParser.testResumeParser(fileUrl);
    res.json(parsedData);
  } catch (error) {
    console.error('Error in test endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Define a simple test route
app.get('/', (req, res) => res.send('API Running'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));