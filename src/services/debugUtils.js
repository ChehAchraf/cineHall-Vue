import axios from 'axios';

// Track API requests and responses for debugging
const apiHistory = [];
const maxHistoryItems = 10;

// Settings for debug mode
let debugMode = import.meta.env.DEV || false;

export const ApiDebugger = {
  /**
   * Initialize the API debugger
   * @param {boolean} enabled - Whether to enable debug mode
   */
  init(enabled = true) {
    debugMode = enabled;
    console.log(`API Debugger ${debugMode ? 'enabled' : 'disabled'}`);
    
    if (debugMode) {
      this.setupInterceptors();
    }
  },
  
  /**
   * Set up axios interceptors to log API activity
   */
  setupInterceptors() {
    // Remove any existing interceptors
    axios.interceptors.request.eject(this._reqInterceptor);
    axios.interceptors.response.eject(this._resInterceptor);
    
    // Add request interceptor
    this._reqInterceptor = axios.interceptors.request.use(
      (config) => {
        const entry = {
          timestamp: new Date(),
          type: 'request',
          method: config.method?.toUpperCase(),
          url: config.url,
          headers: { ...config.headers },
          data: config.data,
        };
        
        this.addToHistory(entry);
        console.debug('API Request:', entry);
        return config;
      },
      (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor
    this._resInterceptor = axios.interceptors.response.use(
      (response) => {
        const entry = {
          timestamp: new Date(),
          type: 'response',
          status: response.status,
          statusText: response.statusText,
          url: response.config.url,
          method: response.config.method?.toUpperCase(),
          data: response.data,
          headers: { ...response.headers },
        };
        
        this.addToHistory(entry);
        console.debug('API Response:', entry);
        return response;
      },
      (error) => {
        const entry = {
          timestamp: new Date(),
          type: 'error',
          name: error.name,
          message: error.message,
          url: error.config?.url,
          method: error.config?.method?.toUpperCase(),
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        };
        
        this.addToHistory(entry);
        console.error('API Error:', entry);
        return Promise.reject(error);
      }
    );
  },
  
  /**
   * Add an entry to the API history log
   * @param {Object} entry - The entry to add
   */
  addToHistory(entry) {
    apiHistory.unshift(entry);
    
    // Keep history at max length
    if (apiHistory.length > maxHistoryItems) {
      apiHistory.pop();
    }
  },
  
  /**
   * Get the API history log
   * @returns {Array} - The API history
   */
  getHistory() {
    return [...apiHistory];
  },
  
  /**
   * Clear the API history log
   */
  clearHistory() {
    apiHistory.length = 0;
  },
  
  /**
   * Test the API connection
   * @param {string} endpoint - The endpoint to test
   * @param {Object} options - Additional options
   * @returns {Promise} - The test result
   */
  async testConnection(endpoint = '/api/movies', options = {}) {
    const baseUrl = 'http://localhost:8000';
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
    
    const token = localStorage.getItem('token');
    const headers = {
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };
    
    try {
      const startTime = performance.now();
      const response = await axios.get(url, { 
        headers,
        timeout: options.timeout || 5000,
        // Option to control credentials mode for testing
        withCredentials: options.withCredentials ?? false
      });
      const endTime = performance.now();
      
      return {
        success: true,
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        time: Math.round(endTime - startTime),
        headers: response.headers
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        cors: this.checkForCorsError(error)
      };
    }
  },

  /**
   * Check if an error is related to CORS
   * @param {Error} error - The error to check
   * @returns {Object|null} - CORS error information or null
   */
  checkForCorsError(error) {
    if (error.message?.includes('CORS') || error.message?.includes('Network Error')) {
      return {
        isCorsError: true,
        details: "This appears to be a CORS-related error. The browser blocked the request because the server's CORS configuration doesn't allow it.",
        possibleSolutions: [
          "Ensure the backend has proper CORS headers configured",
          "If using credentials (cookies/auth), the backend must specify the exact origin, not '*'",
          "Check that the backend responds with 'Access-Control-Allow-Credentials: true' when using credentials",
          "Temporarily disable 'withCredentials' if not using session cookies"
        ]
      };
    }
    return null;
  },
  
  /**
   * Get detailed information about the current API configuration
   * @returns {Object} - API configuration info
   */
  getDiagnostics() {
    const token = localStorage.getItem('token');
    const apiClientConfig = axios.defaults;
    
    return {
      baseUrl: 'http://localhost:8000/api',
      tokenPresent: !!token,
      tokenLength: token?.length || 0,
      defaultWithCredentials: apiClientConfig.withCredentials || false,
      defaultHeaders: apiClientConfig.headers?.common || {},
      corsStatus: {
        origin: window.location.origin,
        isSecureContext: window.isSecureContext,
      }
    };
  }
};

// Enable by default in development
if (import.meta.env.DEV) {
  ApiDebugger.init(true);
}

export default ApiDebugger; 