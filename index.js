require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const allowedOrigins = [
  'https://yourdomain.com',        
  'https://www.yourdomain.com',    
  'http://localhost:8080',         
  'http://127.0.0.1:8080'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl or local tools)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('CORS not allowed for this origin: ' + origin));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Optional: handle preflight OPTIONS requests globally
//pre-flight handler
app.options('*', (req,res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.sendStatus(204);
});

//app.options('*', cors());


const AUTH_TOKEN = process.env.TRANSLATE_AUTH_TOKEN;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Helper: get log filename for today (daily rotation)
function getLogFilePath() {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const logsDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }
  return path.join(logsDir, `translations-${today}.jsonl`);
}

// Route: Translate
app.post('/translate', async (req, res) => {
  try {
    // Auth check
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { text, target } = req.body;
    if (!text || !target) {
      return res.status(400).json({ error: 'Missing text or target' });
    }

    // Call Google Translation API
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`,
      { q: text, target, source: 'my' } // Source: Myanmar
    );

    const translated = response.data.data.translations[0].translatedText;

    // Build log record
    const record = {
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
      input: text,
      output: translated,
      target
    };

    // Append to today's JSONL
    fs.appendFile(getLogFilePath(), JSON.stringify(record) + '\n', (err) => {
      if (err) console.error('Error writing log:', err);
    });

    res.json(record);
  } catch (err) {
    console.error('Translation error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Translation failed' });
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Translation service running on port ${port}`);
});
