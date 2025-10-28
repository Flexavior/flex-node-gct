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

app.use((req, res, next) => {
  console.log('Incoming request origin:', req.headers.origin);
  next();
});

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow curl or server requests
    const normalized = origin.replace(/\/$/, '').toLowerCase();
    const isAllowed = allowedOrigins.some(o => o.toLowerCase() === normalized);
    if (isAllowed) return callback(null, true);
    console.error('Blocked CORS origin:', origin);
    return callback(new Error('CORS not allowed for this origin: ' + origin));
  },
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

app.options('*', (req,res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.sendStatus(204);
});

const AUTH_TOKEN = process.env.TRANSLATE_AUTH_TOKEN;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

function getLogFilePath() {
  const today = new Date().toISOString().split('T')[0];
  const logsDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);
  return path.join(logsDir, `translations-${today}.jsonl`);
}

app.post('/translate', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { text, target } = req.body;
    if (!text || !target) return res.status(400).json({ error: 'Missing text or target' });

    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`,
      { q: text, target, source: 'my' } // Myanmar source
    );

    const translated = response.data.data.translations[0].translatedText;

    const record = {
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
      input: text,
      output: translated,
      target
    };

    fs.appendFile(getLogFilePath(), JSON.stringify(record) + '\n', (err) => {
      if (err) console.error('Error writing log:', err);
    });

    res.json(record);
  } catch (err) {
    console.error('Translation error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Translation failed' });
  }
});

app.get('/health', (req,res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Translation service running on port ${port}`);
});
