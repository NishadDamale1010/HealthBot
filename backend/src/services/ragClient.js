const axios = require('axios');

// In production: set AI_SERVICE_URL to your Render URL (e.g., https://healthbot-ai.onrender.com)
// Both ML and RAG are now served from the same combined AI service
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: 30000, // 30s for cold starts on free tier
  headers: { 'Content-Type': 'application/json' }
});

const query = async (question) => {
  try {
    const res = await apiClient.post('/query', { query: question });
    return res.data;
  } catch (error) {
    console.error('RAG Service query error:', error.message);
    return null;
  }
};

const getDiseaseInfo = async (diseaseName) => {
  try {
    const res = await apiClient.get(`/disease/${encodeURIComponent(diseaseName)}`);
    return res.data;
  } catch (error) {
    console.error('RAG Service getDiseaseInfo error:', error.message);
    return null;
  }
};

const getMedicineInfo = async (medicineName) => {
  try {
    const res = await apiClient.get(`/medicine/${encodeURIComponent(medicineName)}`);
    return res.data;
  } catch (error) {
    console.error('RAG Service getMedicineInfo error:', error.message);
    return null;
  }
};

module.exports = {
  query,
  getDiseaseInfo,
  getMedicineInfo
};
