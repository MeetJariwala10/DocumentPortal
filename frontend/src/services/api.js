import axios from 'axios';

// Use env override when provided, default to same-origin '/api'
const API_URL = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Add request interceptor for handling common request tasks
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens or other headers here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling common response tasks
api.interceptors.response.use(
  (response) => {
    // Return the response
    return response;
  },
  (error) => {
    // Handle common error scenarios
    if (error.response) {
      // Server responded with an error status
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.request);
    } else {
      // Something else happened while setting up the request
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const uploadFile = async (endpoint, formData) => {
  try {
    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.message || `Error in ${endpoint}`;
    console.error(errorMessage, error);
    throw error;
  }
};

export const analyzeDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return uploadFile('/analyze', formData);
};

export const compareDocuments = async (referenceFile, actualFile) => {
  const formData = new FormData();
  formData.append('reference', referenceFile);
  formData.append('actual', actualFile);
  return uploadFile('/compare', formData);
};

export const buildChatIndex = async (files, sessionId, useSessionDirs, chunkSize, chunkOverlap, k) => {
  const formData = new FormData();
  
  // Append all files
  files.forEach(file => {
    formData.append('files', file);
  });
  
  // Append other parameters
  if (sessionId) formData.append('session_id', sessionId);
  formData.append('use_session_dirs', useSessionDirs ? 'true' : 'false');
  formData.append('chunk_size', String(chunkSize));
  formData.append('chunk_overlap', String(chunkOverlap));
  formData.append('k', String(k));
  
  return uploadFile('/chat/index', formData);
};

export const queryChatDocument = async (question, sessionId, useSessionDirs, k) => {
  const formData = new FormData();
  formData.append('question', question);
  formData.append('use_session_dirs', useSessionDirs ? 'true' : 'false');
  formData.append('k', String(k));
  
  if (useSessionDirs && sessionId) {
    formData.append('session_id', sessionId);
  }
  
  return uploadFile('/chat/query', formData);
};

export default api;