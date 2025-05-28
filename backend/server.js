// server/server.js
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

// Connect to database
connectDB();

const app = express();
const resumeParser = require('./services/resumeParser');

// Init middleware
app.use(cors());
app.use(express.json({ extended: false }));

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