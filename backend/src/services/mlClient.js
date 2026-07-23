const axios = require('axios');

// In production: set AI_SERVICE_URL to your Render URL (e.g., https://healthbot-ai.onrender.com)
// Locally: defaults to localhost:8000
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: 30000, // 30s for ML model loading on cold starts
  headers: { 'Content-Type': 'application/json' },
  httpAgent: new (require('http')).Agent({ keepAlive: true }),
  httpsAgent: new (require('https')).Agent({ keepAlive: true })
});

const isAvailable = async () => {
  try {
    const res = await apiClient.get('/healthz');
    return res.status === 200;
  } catch (error) {
    return false;
  }
};

const predictFromText = async (text) => {
  try {
    const res = await apiClient.post('/api/predict/text', { text });
    return res.data;
  } catch (error) {
    console.error('ML Service predictFromText error:', error.message);
    return null;
  }
};

const predictFromVector = async (symptomVector) => {
  try {
    const res = await apiClient.post('/api/predict', { symptomVector });
    return res.data;
  } catch (error) {
    console.error('ML Service predictFromVector error:', error.message);
    return null;
  }
};

const extractSymptoms = async (text) => {
  try {
    const res = await apiClient.post('/api/extract-symptoms', { text });
    return res.data;
  } catch (error) {
    console.error('ML Service extractSymptoms error:', error.message);
    return null;
  }
};

const detectEmergency = async (text) => {
  try {
    const res = await apiClient.post('/api/detect-emergency', { text });
    return res.data;
  } catch (error) {
    console.error('ML Service detectEmergency error:', error.message);
    return null;
  }
};

const suggestQuestions = async (knownSymptoms, sessionContext) => {
  try {
    const res = await apiClient.post('/api/suggest-questions', { knownSymptoms, sessionContext });
    return res.data;
  } catch (error) {
    console.error('ML Service suggestQuestions error:', error.message);
    return null;
  }
};

module.exports = {
  isAvailable,
  predictFromText,
  predictFromVector,
  extractSymptoms,
  detectEmergency,
  suggestQuestions
};
