import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Setting withCredentials to false until backend is properly configured for CORS with credentials
  withCredentials: false
});

// Add a request interceptor to inject the token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log all API errors for debugging
    console.error(`API Error [${error?.config?.method?.toUpperCase() || 'UNKNOWN'}] ${error?.config?.url || 'unknown-url'}:`, error);
    
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Enhance error object with more useful information
    error.friendlyMessage = getFriendlyErrorMessage(error);
    
    return Promise.reject(error);
  }
);

/**
 * Get a user-friendly error message based on the error
 */
function getFriendlyErrorMessage(error) {
  // Network errors (no connection to server)
  if (error.message === 'Network Error') {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  
  // No response from server (server down)
  if (!error.response) {
    return 'The server is not responding. Please try again later.';
  }
  
  // Handle different HTTP error codes
  switch (error.response.status) {
    case 400:
      return 'The request was invalid. Please check your input and try again.';
    case 401:
      return 'Authentication is required. Please log in again.';
    case 403:
      return 'You do not have permission to access this resource.';
    case 404:
      return 'The requested resource was not found.';
    case 500:
      return 'The server encountered an error. Our team has been notified.';
    default:
      return `Error: ${error.response.status} ${error.response.statusText}`;
  }
}

/**
 * Safely make API requests with error handling and fallback data
 * @param {Function} apiCall - The API function to call
 * @param {Object} options - Additional options
 * @returns {Promise} - Result with success status and data or error
 */
async function safeApiCall(apiCall, options = {}) {
  const {
    fallbackData = null,
    timeout = 10000,
    retries = 0,
    showFallbackMessage = true
  } = options;
  
  let currentTry = 0;
  
  const makeRequest = async () => {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Request timed out after ${timeout}ms`));
        }, timeout);
      });
      
      // Race between the actual request and the timeout
      const response = await Promise.race([
        apiCall(),
        timeoutPromise
      ]);
      
      return {
        success: true,
        data: response.data,
        status: response.status,
        headers: response.headers
      };
    } catch (error) {
      // If we have retries left, try again
      if (currentTry < retries) {
        currentTry++;
        console.log(`Retrying API call (${currentTry}/${retries})...`);
        return makeRequest();
      }
      
      // Otherwise, handle the error
      const errorResult = {
        success: false,
        error: error.friendlyMessage || error.message,
        status: error.response?.status,
        originalError: error
      };
      
      // If fallback data is provided, include it
      if (fallbackData !== null) {
        errorResult.data = typeof fallbackData === 'function' ? fallbackData() : fallbackData;
        if (showFallbackMessage) {
          errorResult.fallbackMessage = 'Showing cached or sample data. Actual data could not be loaded.';
        }
      }
      
      return errorResult;
    }
  };
  
  return makeRequest();
}

// Export the original API methods and safe versions
export default {
  // Auth endpoints
  login(credentials) {
    return apiClient.post('/login', credentials);
  },
  
  register(userData) {
    return apiClient.post('/register', userData);
  },
  
  logout() {
    return apiClient.post('/logout');
  },
  
  // User endpoints
  getCurrentUser() {
    return apiClient.get('/user');
  },

  // Movie endpoints
  getMovies() {
    return apiClient.get('/movies');
  },

  getMovie(id) {
    return apiClient.get(`/movies/${id}`);
  },

  getMoviesByHall(hallId) {
    return apiClient.get(`/movies/hall/${hallId}`);
  },

  // Hall endpoints
  getHalls() {
    return apiClient.get('/halls');
  },

  getHall(id) {
    return apiClient.get(`/halls/show/${id}`);
  },

  getHallAvailableSeats(id) {
    return apiClient.get(`/halls/${id}/available-seats`);
  },

  getHallReservedSeats(id) {
    return apiClient.get(`/halls/${id}/reserved-seats`);
  },

  // Session endpoints
  getSessions() {
    return apiClient.get('/session');
  },

  getMovieSessions(movieId) {
    return apiClient.get(`/session/movie/${movieId}`);
  },
  
  getSession(id) {
    // For now, we'll try the index endpoint and filter client-side
    return apiClient.get('/session').then(response => {
      const sessions = response.data;
      const session = sessions.find(s => s.id == id);
      if (!session) {
        throw new Error('Session not found');
      }
      return { data: session };
    });
  },

  // Seat endpoints
  getSessionSeats(sessionId) {
    return apiClient.get(`/seats/session/${sessionId}`);
  },

  // Reservation endpoints
  getUserReservations(userId) {
    return apiClient.get(`/reservations/user/${userId}`);
  },

  cancelReservation(reservationId) {
    return apiClient.delete(`/reservations/${reservationId}`);
  },

  createReservation(sessionId, seatIds) {
    return apiClient.post(`/reservations/add/${sessionId}/${seatIds}`);
  },
  
  // Enhanced safe API methods
  safe: {
    async getMovies(options = {}) {
      return safeApiCall(
        () => apiClient.get('/movies'),
        {
          fallbackData: () => [
            {
              id: 1,
              title: "Inception",
              description: "A thief who steals corporate secrets...",
              genre: "Sci-Fi",
              duration: 148,
              image: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg"
            },
            {
              id: 2,
              title: "The Dark Knight",
              description: "When the menace known as the Joker...",
              genre: "Action",
              duration: 152,
              image: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg"
            }
          ],
          ...options
        }
      );
    },
    
    async getMovie(id, options = {}) {
      return safeApiCall(
        () => apiClient.get(`/movies/${id}`),
        {
          fallbackData: () => {
            const fallbackMovies = {
              1: {
                id: 1,
                title: "Inception",
                description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
                genre: "Sci-Fi",
                duration: 148,
                rating: 8.8,
                director: "Christopher Nolan",
                image: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
                backdrop: "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg"
              },
              2: {
                id: 2,
                title: "The Dark Knight",
                description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
                genre: "Action",
                duration: 152,
                rating: 9.0,
                director: "Christopher Nolan",
                image: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
                backdrop: "https://image.tmdb.org/t/p/original/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg"
              }
            };
            
            return fallbackMovies[id] || {
              id,
              title: "Sample Movie",
              description: "This is sample data as the API connection failed.",
              genre: "Drama",
              duration: 120,
              rating: 7.5,
              director: "Sample Director",
              image: "https://via.placeholder.com/300x450/121212/E50914?text=CineHall",
              backdrop: "https://via.placeholder.com/1200x600/121212/E50914?text=CineHall"
            };
          },
          ...options
        }
      );
    },
    
    async getSessions(options = {}) {
      return safeApiCall(
        () => apiClient.get('/session'),
        {
          fallbackData: [],
          ...options
        }
      );
    },
    
    async getMovieSessions(movieId, options = {}) {
      return safeApiCall(
        () => apiClient.get(`/session/movie/${movieId}`),
        {
          fallbackData: () => {
            // Generate sample sessions if API fails
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            return [
              {
                id: 1,
                movie_id: movieId,
                movie_name: "Sample Movie",
                hall_id: 1,
                hall_name: "Hall A1",
                start_time: now.toISOString(),
                language: "EN",
                type: "normal",
                price: 12.99,
                available_seats: 45
              },
              {
                id: 2,
                movie_id: movieId,
                movie_name: "Sample Movie",
                hall_id: 2,
                hall_name: "Hall B2 IMAX",
                start_time: tomorrow.toISOString(),
                language: "EN",
                type: "VIP",
                price: 19.99,
                available_seats: 20
              }
            ];
          },
          retries: 1,
          ...options
        }
      );
    },
    
    async getSession(id, options = {}) {
      return safeApiCall(
        () => apiClient.get(`/session/${id}`),
        {
          fallbackData: () => {
            // Create a sample session if API fails
            return {
              id: parseInt(id),
              movie_name: "Sample Movie",
              hall_name: "A1",
              start_time: "11/04/2025",
              language: "EN",
              type: "normal"
            };
          },
          retries: 1,
          showFallbackMessage: true,
          ...options
        }
      );
    }
  }
}; 