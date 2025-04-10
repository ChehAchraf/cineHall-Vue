import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth endpoints
export const auth = {
    login: (credentials) => api.post('/login', credentials),
    register: (userData) => api.post('/register', userData),
    logout: () => api.post('/logout'),
    refresh: () => api.post('/refresh'),
};

// Movies endpoints
export const movies = {
    getAll: () => api.get('/movies'),
    getById: (id) => api.get(`/movies/${id}`),
    getByHall: (hallId) => api.get(`/movies/hall/${hallId}`),
};

// Halls endpoints
export const halls = {
    getAll: () => api.get('/halls'),
    getById: (id) => api.get(`/halls/show/${id}`),
    getAvailableSeats: (id) => api.get(`/halls/${id}/available-seats`),
    getReservedSeats: (id) => api.get(`/halls/${id}/reserved-seats`),
};

// Sessions endpoints
export const sessions = {
    getAll: () => api.get('/session'),
    create: (movieId, hallId) => api.post(`/session/add/${movieId}/${hallId}`),
    update: (id, data) => api.put(`/session/update/${id}`, data),
    delete: (id) => api.delete(`/session/delete/${id}`),
};

// Seats endpoints
export const seats = {
    getAll: () => api.get('/seats'),
    getById: (id) => api.get(`/seats/${id}`),
    getByHall: (hallId) => api.get(`/seats/hall/${hallId}`),
    getAvailableSeats: (hallId) => api.get(`/seats/hall/${hallId}/available`),
    getReservedSeats: (hallId) => api.get(`/seats/hall/${hallId}/reserved`),
    getByReservation: (reservationId) => api.get(`/seats/reservation/${reservationId}`),
    getBySession: (sessionId) => api.get(`/seats/session/${sessionId}`),
};

// Reservations endpoints
export const reservations = {
    getAll: () => api.get('/reservations'),
    getById: (id) => api.get(`/reservations/${id}`),
    create: (sessionId, seatIds) => api.post(`/reservations/add/${sessionId}/${seatIds}`),
    update: (id, data) => api.put(`/reservations/update/${id}`, data),
    delete: (id) => api.delete(`/reservations/delete/${id}`),
    getUserReservations: (userId) => api.get(`/reservations/user/${userId}`),
    getReservationSeats: (id) => api.get(`/reservations/${id}/seats`),
    processTransaction: () => api.get('create-transaction'),
    handlePaymentSuccess: (reservationId) => api.get(`payment/success/${reservationId}`),
    handlePaymentCancel: (reservationId) => api.get(`payment/cancel/${reservationId}`),
};

export default api; 