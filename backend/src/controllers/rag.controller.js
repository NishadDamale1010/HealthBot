const ragClient = require('../services/ragClient');

const DISCLAIMER = '⚠️ This is not medical advice. Consult a healthcare provider.';

const queryRag = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }
    
    const result = await ragClient.query(query);
    if (result) {
      return res.status(200).json({ success: true, data: result, disclaimer: DISCLAIMER });
    }
    
    res.status(503).json({ success: false, message: 'RAG service unavailable', disclaimer: DISCLAIMER });
  } catch (error) {
    console.error('RAG query error:', error);
    res.status(500).json({ success: false, message: 'Server error', disclaimer: DISCLAIMER });
  }
};

const getDisease = async (req, res) => {
  try {
    const { name } = req.params;
    const result = await ragClient.getDiseaseInfo(name);
    if (result) {
      return res.status(200).json({ success: true, data: result, disclaimer: DISCLAIMER });
    }
    res.status(404).json({ success: false, message: 'Disease information not found', disclaimer: DISCLAIMER });
  } catch (error) {
    console.error('RAG getDisease error:', error);
    res.status(500).json({ success: false, message: 'Server error', disclaimer: DISCLAIMER });
  }
};

const getMedicine = async (req, res) => {
  try {
    const { name } = req.params;
    const result = await ragClient.getMedicineInfo(name);
    if (result) {
      return res.status(200).json({ success: true, data: result, disclaimer: DISCLAIMER });
    }
    res.status(404).json({ success: false, message: 'Medicine information not found', disclaimer: DISCLAIMER });
  } catch (error) {
    console.error('RAG getMedicine error:', error);
    res.status(500).json({ success: false, message: 'Server error', disclaimer: DISCLAIMER });
  }
};

module.exports = {
  queryRag,
  getDisease,
  getMedicine
};
