<template>
  <div class="min-h-screen bg-dark text-white">
    <Navbar />
    
    <div class="pt-24 pb-16">
      <!-- Loading State -->
      <div v-if="loading" class="container mx-auto px-4 flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="container mx-auto px-4 bg-red-500 bg-opacity-20 text-red-100 p-4 rounded-lg text-center my-8">
        {{ error }}
        <button @click="fetchSessionDetails" class="underline mt-2 text-white hover:text-red-200">Try again</button>
      </div>
      
      <!-- Booking Content -->
      <div v-else class="container mx-auto px-4">
        <!-- Back Button -->
        <div class="mb-6">
          <router-link :to="{ name: 'movie-detail', params: { id: session.movie_id } }" class="inline-flex items-center text-gray-400 hover:text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            Back to Movie
          </router-link>
        </div>
        
        <!-- Booking Header -->
        <div class="bg-dark-light rounded-xl p-6 mb-8 text-center md:text-left">
          <h1 class="text-2xl md:text-3xl font-display font-bold mb-4">Select Your Seats</h1>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center md:text-left">
            <div>
              <h3 class="text-gray-400 text-sm mb-1">Movie</h3>
              <p class="text-lg font-semibold">{{ session.movie_name || 'Unknown Movie' }}</p>
            </div>
            
            <div>
              <h3 class="text-gray-400 text-sm mb-1">Date & Time</h3>
              <p class="text-lg font-semibold">{{ formatDateTime(session.start_time) }}</p>
            </div>
            
            <div>
              <h3 class="text-gray-400 text-sm mb-1">Type</h3>
              <p class="text-lg font-semibold">{{ session.type || 'Standard' }}</p>
            </div>
            
            <div>
              <h3 class="text-gray-400 text-sm mb-1">Hall</h3>
              <p class="text-lg font-semibold">{{ session.hall_name || 'Unknown Hall' }}</p>
            </div>
          </div>

          <div class="mt-4 text-sm text-gray-400">
            <span class="bg-dark-darker px-2 py-1 rounded">{{ session.language || 'EN' }}</span>
          </div>
        </div>
        
        <!-- Seat Selection -->
        <div class="mb-12">
          <!-- Screen -->
          <div class="w-full bg-dark-lighter rounded-lg h-8 mb-8 relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-b from-primary-darker to-transparent opacity-20"></div>
            <p class="text-center text-xs text-gray-400 pt-1.5">SCREEN</p>
          </div>
          
          <!-- Seat Layout -->
          <div class="mb-8 overflow-x-auto" style="max-width: 100%;">
            <div class="flex flex-col items-center space-y-2 min-w-max">
              <div v-for="(row, rowIndex) in seatLayout" :key="rowIndex" class="flex space-x-2">
                <div class="w-8 h-8 flex items-center justify-center text-gray-400">
                  {{ String.fromCharCode(65 + rowIndex) }}
                </div>
                
                <div v-for="(seat, seatIndex) in row" :key="`${rowIndex}-${seatIndex}`" class="flex space-x-2">
                  <button 
                    class="w-8 h-8 rounded-t-lg flex items-center justify-center text-xs transition-colors duration-200"
                    :class="{
                      'bg-gray-700 text-gray-400 cursor-not-allowed': seat.status === 'reserved',
                      'bg-primary text-white': isSeatSelected(seat.id),
                      'bg-dark-lighter text-white hover:bg-primary-darker': seat.status === 'available'
                    }"
                    @click="toggleSeat(seat)"
                    :disabled="seat.status === 'reserved'"
                  >
                    {{ seatIndex + 1 }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Seat Legend -->
          <div class="flex justify-center space-x-8 mb-8">
            <div class="flex items-center">
              <div class="w-4 h-4 rounded bg-dark-lighter mr-2"></div>
              <span class="text-sm text-gray-400">Available</span>
            </div>
            
            <div class="flex items-center">
              <div class="w-4 h-4 rounded bg-primary mr-2"></div>
              <span class="text-sm text-gray-400">Selected</span>
            </div>
            
            <div class="flex items-center">
              <div class="w-4 h-4 rounded bg-gray-700 mr-2"></div>
              <span class="text-sm text-gray-400">Reserved</span>
            </div>
          </div>
          
          <!-- Selected Seats Summary -->
          <div class="bg-dark-light rounded-xl p-6 mb-8">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h3 class="text-lg font-semibold mb-2">Selected Seats</h3>
                <p v-if="selectedSeatsArray.length === 0" class="text-gray-400">
                  No seats selected
                </p>
                <div v-else class="flex flex-wrap gap-2">
                  <span 
                    v-for="seat in selectedSeatsArray" 
                    :key="seat.id" 
                    class="px-2 py-1 bg-primary text-white text-xs rounded flex items-center"
                  >
                    {{ formatSeatId(seat.id) }}
                    <button @click="toggleSeat(seat)" class="ml-1 text-white hover:text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </span>
                </div>
              </div>
              
              <div class="mt-4 md:mt-0 w-full md:w-auto">
                <div class="flex flex-col items-end">
                  <div class="text-gray-400 text-sm mb-1">Total Price</div>
                  <div class="text-2xl font-bold">${{ calculateTotalPrice().toFixed(2) }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex justify-end">
            <button 
              @click="confirmBooking"
              class="bg-primary hover:bg-red-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-300"
              :disabled="selectedSeatsArray.length === 0 || processing"
              :class="{ 'opacity-50 cursor-not-allowed': selectedSeatsArray.length === 0 || processing }"
            >
              <span v-if="processing">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
              <span v-else>Confirm Booking</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import api from '../services/api';

const router = useRouter();
const route = useRoute();
const sessionId = computed(() => route.params.id);

const loading = ref(true);
const error = ref('');
const session = ref({});
const seats = ref([]);
const selectedSeats = ref(new Set());
const seatPrice = ref(15.00); // Default price per seat
const bookingFee = ref(3.50);
const processing = ref(false);

// Computed properties
const selectedSeatsArray = computed(() => {
  return Array.from(selectedSeats.value).map(seatId => {
    return seats.value.find(seat => seat.id === seatId) || { id: seatId };
  });
});

// Generate seat layout based on available/reserved seats
const seatLayout = computed(() => {
  if (seats.value.length === 0) return [];
  
  // Group seats by row
  const rowMap = new Map();
  
  // Loop through all seats and organize them by row
  seats.value.forEach(seat => {
    const rowName = seat.row || seat.row_number;
    if (!rowMap.has(rowName)) {
      rowMap.set(rowName, []);
    }
    rowMap.get(rowName).push(seat);
  });
  
  // Convert to array format sorted by row
  const layout = [];
  
  // Sort rows alphabetically
  const sortedRows = Array.from(rowMap.keys()).sort();
  
  sortedRows.forEach(rowName => {
    const seats = rowMap.get(rowName);
    // Sort seats by seat number within row
    seats.sort((a, b) => (a.seat_number || a.number) - (b.seat_number || b.number));
    layout.push(seats);
  });
  
  return layout;
});

// Methods
const fetchSessionDetails = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    // Fetch session details
    const sessionResponse = await api.getSession(sessionId.value);
    session.value = sessionResponse.data;
    
    // Fetch seats for this session
    const seatsResponse = await api.getSessionSeats(sessionId.value);
    seats.value = seatsResponse.data.map(seat => ({
      ...seat,
      status: seat.is_reserved ? 'reserved' : 'available'
    }));
    
    if (session.value.price) {
      seatPrice.value = parseFloat(session.value.price);
    }
    
  } catch (err) {
    console.error('Error fetching session details:', err);
    error.value = 'Failed to load session details. Please try again.';
    
    // For demo, generate mock data if API fails
    generateMockData();
  } finally {
    loading.value = false;
  }
};

const generateMockData = () => {
  // Mock session data
  session.value = {
    id: sessionId.value,
    movie_id: 1,
    movie_name: "Inception",
    hall_name: "Hall A1",
    start_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    language: "EN",
    type: "standard",
    price: 15.00
  };
  
  // Generate mock seat layout (8 rows, 10 seats per row)
  const rows = 8;
  const seatsPerRow = 10;
  const mockSeats = [];
  
  for (let i = 0; i < rows; i++) {
    const rowName = String.fromCharCode(65 + i); // 'A' to 'H'
    
    for (let j = 1; j <= seatsPerRow; j++) {
      mockSeats.push({
        id: (i * seatsPerRow) + j,
        row: rowName,
        seat_number: j,
        status: Math.random() > 0.3 ? 'available' : 'reserved', // 30% chance of being reserved
        hall_id: 1
      });
    }
  }
  
  seats.value = mockSeats;
};

const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return 'TBD';
  
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

const formatSeatId = (seatId) => {
  const seat = seats.value.find(s => s.id === seatId);
  if (!seat) return `Seat ${seatId}`;
  return `${seat.row}${seat.seat_number}`;
};

const toggleSeat = (seat) => {
  if (seat.status === 'reserved') return;
  
  if (selectedSeats.value.has(seat.id)) {
    selectedSeats.value.delete(seat.id);
  } else {
    // Limit to 10 seats per booking
    if (selectedSeats.value.size < 10) {
      selectedSeats.value.add(seat.id);
    } else {
      alert('You can select a maximum of 10 seats per booking.');
    }
  }
};

const isSeatSelected = (seatId) => {
  return selectedSeats.value.has(seatId);
};

const calculateTotalPrice = () => {
  return (selectedSeatsArray.value.length * seatPrice.value) + bookingFee.value;
};

const confirmBooking = async () => {
  if (selectedSeatsArray.value.length === 0) return;
  
  processing.value = true;
  
  try {
    // Convert selected seats to comma-separated IDs
    const seatIds = selectedSeatsArray.value.map(seat => seat.id).join(',');
    
    // Create reservation
    const response = await api.createReservation(sessionId.value, seatIds);
    
    // Redirect to checkout with PayPal link
    if (response.data && response.data.payment_link) {
      // Open PayPal in new window
      window.open(response.data.payment_link, '_blank');
      
      // Navigate to reservations page
      router.push({
        name: 'reservations',
        query: { 
          success: true,
          message: 'Your reservation has been created. Please complete payment to confirm your tickets.'
        }
      });
    } else {
      // If no payment link, redirect to checkout
      router.push({
        name: 'checkout',
        params: { showtimeId: sessionId.value },
        query: {
          reservationId: response.data.data.id,
          seats: seatIds,
          totalAmount: calculateTotalPrice().toFixed(2)
        }
      });
    }
  } catch (err) {
    console.error('Error creating reservation:', err);
    error.value = 'Failed to create reservation. Please try again.';
    processing.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  fetchSessionDetails();
});
</script>

<style scoped>
/* Add any component-specific styles here */
</style> 