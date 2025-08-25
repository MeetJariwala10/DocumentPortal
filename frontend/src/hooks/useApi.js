import { useState } from 'react';
import axios from 'axios';

/**
 * Custom hook for handling API requests with loading, error, and response states
 * 
 * @param {Function} apiFunction - The API function to call
 * @returns {Object} - Object containing loading state, error state, execute function, and reset function
 */
const useApi = (apiFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  /**
   * Execute the API function with the provided arguments
   * 
   * @param {...any} args - Arguments to pass to the API function
   * @returns {Promise<any>} - Promise that resolves with the API response data
   */
  const execute = async (...args) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiFunction(...args);
      setData(response);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset the hook state
   */
  const reset = () => {
    setLoading(false);
    setError('');
    setData(null);
  };

  return { loading, error, data, execute, reset };
};

export default useApi;