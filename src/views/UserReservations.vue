<template>
  <div class="min-h-screen bg-dark text-white pt-24 pb-16">
    <Navbar />
    
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row items-start justify-between mb-8">
        <div>
          <h1 class="text-3xl md:text-4xl font-display font-bold mb-2">My Reservations</h1>
          <p class="text-gray-400">View and manage your movie bookings</p>
        </div>
        
        <!-- Success Message Banner -->
        <div v-if="successMessage" class="w-full mt-4 md:mt-0 bg-green-500 bg-opacity-20 text-green-100 p-4 rounded-lg text-center">
          {{ successMessage }}
          <button @click="successMessage = ''" class="ml-2 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-500 bg-opacity-20 text-red-100 p-4 rounded-lg text-center my-8">
        {{ error }}
        <button @click="fetchReservations" class="underline mt-2 text-white hover:text-red-200">Try again</button>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="reservations.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
        <h2 class="text-xl font-medium mb-2">No Reservations Found</h2>
        <p class="text-gray-400 mb-6">You haven't made any movie reservations yet.</p>
        <router-link to="/movies" class="bg-primary hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-300">
          Browse Movies
        </router-link>
      </div>
      
      <!-- Reservations List -->
      <div v-else>
        <!-- Filters -->
        <div class="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div class="relative">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Search reservations..." 
              class="w-full md:w-64 bg-dark-lighter text-white rounded-full px-5 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-primary"
            >
            <div class="absolute left-3 top-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div class="flex space-x-4">
            <select 
              v-model="filterStatus" 
              class="bg-dark-lighter text-white rounded-lg px-4 py-2 border border-dark-lighter focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Reservations</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <button @click="clearFilters" class="text-gray-400 hover:text-white transition-colors">
              Clear Filters
            </button>
          </div>
        </div>
        
        <!-- Reservations Grid -->
        <div v-if="filteredReservations.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div 
            v-for="reservation in filteredReservations" 
            :key="reservation.id" 
            class="bg-dark-light rounded-xl overflow-hidden shadow-card hover:shadow-lg transition-all duration-300 border border-dark-lighter"
          >
            <div class="p-5 border-b border-dark-lighter">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-lg font-bold">{{ getMovieName(reservation) }}</h3>
                  <p class="text-sm text-gray-400">
                    {{ formatDateTime(getSessionStartTime(reservation)) }}
                  </p>
                </div>
                <div :class="getStatusClasses(reservation.status)">
                  {{ formatStatus(reservation.status) }}
                </div>
              </div>
            </div>
            
            <div class="p-5">
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p class="text-xs text-gray-400 mb-1">Hall</p>
                  <p>{{ getHallName(reservation) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400 mb-1">Reservation ID</p>
                  <p>{{ reservation.id }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400 mb-1">Seats</p>
                  <p>{{ formatSeats(reservation.seats) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400 mb-1">Total Price</p>
                  <p>${{ getReservationPrice(reservation) }}</p>
                </div>
              </div>
              
              <div class="flex justify-between mt-4">
                <button 
                  v-if="reservation.status === 'pending'"
                  @click="openPaymentLink(reservation)" 
                  class="bg-primary hover:bg-red-700 text-white font-medium py-1.5 px-4 rounded-lg transition-colors duration-300 text-sm"
                >
                  Complete Payment
                </button>
                
                <button 
                  v-if="reservation.status === 'paid' && isUpcoming(reservation)"
                  @click="viewTicket(reservation)" 
                  class="bg-green-600 hover:bg-green-700 text-white font-medium py-1.5 px-4 rounded-lg transition-colors duration-300 text-sm"
                >
                  View Ticket
                </button>
                
                <button 
                  v-if="reservation.status !== 'cancelled' && isUpcoming(reservation)"
                  @click="confirmCancel(reservation)" 
                  class="text-gray-400 hover:text-red-500 font-medium py-1.5 px-4 rounded-lg transition-colors duration-300 text-sm"
                  :disabled="cancellingId === reservation.id"
                >
                  <span v-if="cancellingId === reservation.id">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cancelling...
                  </span>
                  <span v-else>Cancel Reservation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- No Results -->
        <div v-else-if="reservations.length > 0" class="text-center py-10">
          <p class="text-gray-400 mb-4">No reservations match your search criteria.</p>
          <button @click="clearFilters" class="text-primary hover:text-red-400 transition-colors">
            Clear Filters
          </button>
        </div>
      </div>
    </div>
    
    <!-- Cancel Confirmation Modal -->
    <div v-if="showCancelModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div class="bg-dark-light rounded-xl p-6 max-w-md w-full">
        <h3 class="text-xl font-bold mb-4">Cancel Reservation</h3>
        <p class="mb-6">Are you sure you want to cancel this reservation? This action cannot be undone.</p>
        <div class="flex justify-end space-x-4">
          <button 
            @click="showCancelModal = false" 
            class="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Keep Reservation
          </button>
          <button 
            @click="cancelReservation()" 
            class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import api from '../services/api';

const route = useRoute();
const reservations = ref([]);
const loading = ref(true);
const error = ref('');
const searchQuery = ref('');
const filterStatus = ref('all');
const successMessage = ref('');
const cancellingId = ref(null);
const showCancelModal = ref(false);
const reservationToCancel = ref(null);

// Check for success message in route query
if (route.query.success) {
  successMessage.value = route.query.message || 'Operation completed successfully.';
}

const fetchReservations = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    // Get current user id from localStorage (in a real app, this would come from auth state)
    const userId = localStorage.getItem('userId') || '1'; // Fallback to ID 1 for demo
    
    // Fetch user reservations from API
    const response = await api.getUserReservations(userId);
    
    if (response.data && response.data.data) {
      reservations.value = response.data.data;
    } else {
      // Handle empty response
      reservations.value = [];
    }
  } catch (err) {
    console.error('Error fetching reservations:', err);
    error.value = 'Failed to load your reservations. Please try again.';
    
    // For demo purposes, load mock data if API fails
    generateMockReservations();
  } finally {
    loading.value = false;
  }
};

const generateMockReservations = () => {
  reservations.value = [
    {
      id: 1,
      user_id: 1,
      session_id: 101,
      status: 'paid',
      created_at: '2023-12-10T14:35:00Z',
      session: {
        movie_name: 'Inception',
        hall_name: 'IMAX Hall 1',
        start_time: '2023-12-15T19:30:00',
        price: 18
      },
      seats: [
        { id: 1, row: 'G', seat_number: 12 },
        { id: 2, row: 'G', seat_number: 13 }
      ]
    },
    {
      id: 2,
      user_id: 1,
      session_id: 102,
      status: 'pending',
      created_at: '2023-12-12T11:20:00Z',
      session: {
        movie_name: 'The Dark Knight',
        hall_name: 'Main Hall 2',
        start_time: '2023-12-20T20:15:00',
        price: 15
      },
      seats: [
        { id: 3, row: 'C', seat_number: 5 },
        { id: 4, row: 'C', seat_number: 6 },
        { id: 5, row: 'C', seat_number: 7 }
      ]
    },
    {
      id: 3,
      user_id: 1,
      session_id: 103,
      status: 'cancelled',
      created_at: '2023-11-25T09:10:00Z',
      session: {
        movie_name: 'Pulp Fiction',
        hall_name: 'Hall 3',
        start_time: '2023-11-30T18:45:00',
        price: 12
      },
      seats: [
        { id: 6, row: 'E', seat_number: 8 }
      ]
    }
  ];
};

// Filter reservations based on search and filter criteria
const filteredReservations = computed(() => {
  let filtered = [...reservations.value];
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(r => {
      const movieName = r.session?.movie_name || '';
      const hallName = r.session?.hall_name || '';
      return movieName.toLowerCase().includes(query) || 
             hallName.toLowerCase().includes(query) ||
             r.id.toString().includes(query);
    });
  }
  
  // Apply status filter
  if (filterStatus.value !== 'all') {
    filtered = filtered.filter(r => r.status === filterStatus.value);
  }
  
  // Sort by date (newest first) and status (pending first)
  return filtered.sort((a, b) => {
    // Sort by status (pending first)
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    
    // Then by date
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return dateB - dateA;
  });
});

const clearFilters = () => {
  searchQuery.value = '';
  filterStatus.value = 'all';
};

const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return 'N/A';
  
  try {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  } catch (err) {
    return dateTimeStr;
  }
};

const formatSeats = (seats) => {
  if (!seats || !seats.length) return 'N/A';
  return seats.map(seat => `${seat.row}${seat.seat_number}`).join(', ');
};

const getMovieName = (reservation) => {
  return reservation.session?.movie_name || 'Unknown Movie';
};

const getHallName = (reservation) => {
  return reservation.session?.hall_name || 'Unknown Hall';
};

const getSessionStartTime = (reservation) => {
  return reservation.session?.start_time;
};

const getReservationPrice = (reservation) => {
  if (!reservation.session?.price || !reservation.seats?.length) return '0.00';
  const price = parseFloat(reservation.session.price) * reservation.seats.length;
  return price.toFixed(2);
};

const formatStatus = (status) => {
  switch (status) {
    case 'paid': return 'Paid';
    case 'pending': return 'Pending Payment';
    case 'cancelled': return 'Cancelled';
    default: return status;
  }
};

const getStatusClasses = (status) => {
  switch (status) {
    case 'paid': return 'px-3 py-1 bg-green-600 bg-opacity-20 text-green-500 text-xs rounded-full';
    case 'pending': return 'px-3 py-1 bg-yellow-600 bg-opacity-20 text-yellow-500 text-xs rounded-full';
    case 'cancelled': return 'px-3 py-1 bg-red-600 bg-opacity-20 text-red-500 text-xs rounded-full';
    default: return 'px-3 py-1 bg-gray-600 bg-opacity-20 text-gray-500 text-xs rounded-full';
  }
};

const isUpcoming = (reservation) => {
  if (!reservation.session?.start_time) return false;
  
  const sessionTime = new Date(reservation.session.start_time);
  const now = new Date();
  
  return sessionTime > now;
};

const confirmCancel = (reservation) => {
  reservationToCancel.value = reservation;
  showCancelModal.value = true;
};

const cancelReservation = async () => {
  if (!reservationToCancel.value) return;
  
  const id = reservationToCancel.value.id;
  cancellingId.value = id;
  showCancelModal.value = false;
  
  try {
    await api.cancelReservation(id);
    
    // Update local state
    const index = reservations.value.findIndex(r => r.id === id);
    if (index !== -1) {
      reservations.value[index].status = 'cancelled';
    }
    
    successMessage.value = 'Your reservation has been cancelled successfully.';
  } catch (err) {
    console.error('Error cancelling reservation:', err);
    error.value = 'Failed to cancel your reservation. Please try again.';
  } finally {
    cancellingId.value = null;
    reservationToCancel.value = null;
  }
};

const openPaymentLink = (reservation) => {
  // In a real app, we would fetch the payment link from the API
  // For demo, open a mock PayPal page
  window.open('https://www.paypal.com', '_blank');
};

const viewTicket = (reservation) => {
  // In a real app, we would navigate to a ticket view page or open a modal
  alert(`Showing ticket for reservation #${reservation.id}`);
};

// Fetch reservations on component mount
onMounted(() => {
  fetchReservations();
});
</script> 