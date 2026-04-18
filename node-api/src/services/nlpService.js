const axios = require('axios');

const NLP_URL = process.env.NLP_SERVICE_URL || 'http://localhost:8000';

exports.analyzeEmotion = async (text) => {
  const response = await axios.post(`${NLP_URL}/analyze`, { text }, { timeout: 30000 });
  return response.data;
};
