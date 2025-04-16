import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false
});

// Add request interceptor to inject the token
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

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error);
    return Promise.reject(error);
  }
);

export default {
  // Reservation endpoints
  createReservation(sessionId, seatIds) {
    return apiClient.post(`/reservations/add/${sessionId}/${seatIds}`);
  },
  
  getUserReservations(userId) {
    return apiClient.get(`/reservations/user/${userId}`);
  },
  
  cancelReservation(reservationId) {
    return apiClient.delete(`/reservations/delete/${reservationId}`);
  },
  
  getReservationDetails(reservationId) {
    return apiClient.get(`/reservations/${reservationId}`);
  },
  
  // Session endpoints
  getMovieSessions(movieId) {
    return apiClient.get(`/session/movie/${movieId}`);
  },
  
  // Seat endpoints
  getSessionSeats(sessionId) {
    return apiClient.get(`/seats/session/${sessionId}`);
  }
}; 