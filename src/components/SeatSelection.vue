<template>
  <div class="seat-selection-container">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading seating plan...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <i class="fas fa-exclamation-circle error-icon"></i>
      <p>{{ error }}</p>
      <button @click="fetchSeats" class="retry-button">Try Again</button>
      <router-link :to="{ name: 'movie-detail', params: { id: movieId } }" class="back-button">
        <i class="fas fa-arrow-left"></i> Back to Movie
      </router-link>
    </div>
    
    <div v-else class="seat-selection-content">
      <div class="booking-info">
        <div class="movie-info">
          <h1>{{ movieName }}</h1>
          <div class="screening-info">
            <div class="info-item">
              <i class="fas fa-calendar"></i>
              <span>{{ formatDate(screeningDate) }}</span>
            </div>
            <div class="info-item">
              <i class="fas fa-clock"></i>
              <span>{{ formatTime(screeningTime) }}</span>
            </div>
            <div class="info-item">
              <i class="fas fa-film"></i>
              <span>{{ hallName }}</span>
            </div>
          </div>
        </div>
        
        <div class="selected-seats-summary">
          <h3>Selected Seats: <span>{{ selectedSeats.length }}</span></h3>
          <div class="seats-list">
            <span v-for="seat in selectedSeats" :key="`${seat.id}`" class="seat-tag">
              {{ seat.row }}{{ seat.number }}
              <button @click="deselectSeat(seat)" class="remove-seat">×</button>
            </span>
          </div>
          <div class="pricing-summary">
            <div class="price-row">
              <span>Regular ({{ selectedSeats.length }} × ${{ TICKET_PRICE.toFixed(2) }})</span>
              <span>${{ (selectedSeats.length * TICKET_PRICE).toFixed(2) }}</span>
            </div>
            <div class="price-row">
              <span>Booking Fee</span>
              <span>${{ BOOKING_FEE.toFixed(2) }}</span>
            </div>
            <div class="price-row total">
              <span>Total</span>
              <span>${{ totalPrice.toFixed(2) }}</span>
            </div>
          </div>
          <button 
            class="proceed-button" 
            :disabled="selectedSeats.length === 0" 
            @click="proceedToCheckout"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
      
      <div class="seating-plan-container">
        <div class="screen-container">
          <div class="screen"></div>
          <p class="screen-label">SCREEN</p>
        </div>
        
        <div class="seating-legend">
          <div class="legend-item">
            <div class="seat-demo available"></div>
            <span>Available</span>
          </div>
          <div class="legend-item">
            <div class="seat-demo selected"></div>
            <span>Selected</span>
          </div>
          <div class="legend-item">
            <div class="seat-demo occupied"></div>
            <span>Occupied</span>
          </div>
          <div class="legend-item">
            <div class="seat-demo not-available"></div>
            <span>Not Available</span>
          </div>
        </div>
        
        <div class="seats-container">
          <!-- Simple 10-seat hall layout -->
          <div class="small-hall-layout">
            <div v-for="(row, rowIndex) in seatingPlan" :key="`row-${rowIndex}`" class="seat-row">
              <div class="row-label left">{{ row.label }}</div>
              
              <div class="seating-area">
                <template v-for="(seat, seatIndex) in row.seats" :key="`seat-${rowIndex}-${seatIndex}`">
                  <!-- Add aisle space -->
                  <div v-if="seat.isAisle" class="aisle-space"></div>
                  
                  <!-- Regular seat -->
                  <div v-else class="seat-wrapper">
                    <div 
                      class="seat" 
                      :class="{
                        'seat-available': seat.status === 'available',
                        'seat-selected': isSeatSelected(row.label, seat.number),
                        'seat-occupied': seat.status === 'occupied',
                        'seat-disabled': seat.status === 'disabled'
                      }"
                      @click="toggleSeat(row.label, seat)"
                    >
                      <div class="seat-back"></div>
                      <div class="seat-bottom">
                        <span class="seat-number">{{ seat.number }}</span>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
              
              <div class="row-label right">{{ row.label }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Seat info tooltip -->
      <div class="seat-info">
        <p><i class="fas fa-info-circle"></i> Hall {{ route.query.hall_id || 1 }} has 10 seats in a single row.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// Constants
const MAX_SELECTABLE_SEATS = 10;
const TICKET_PRICE = 12.99;
const BOOKING_FEE = 1.50;

// State
const loading = ref(true);
const error = ref(null);
const movieId = ref(null);
const movieName = ref('');
const screeningDate = ref('');
const screeningTime = ref('');
const hallName = ref('');
const showtimeId = ref(null);
const selectedSeats = ref([]);
const seatingPlan = ref([]);

// Computed
const totalPrice = computed(() => {
  return (selectedSeats.value.length * TICKET_PRICE) + BOOKING_FEE;
});

// Methods
const fetchSeats = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // Get the showtime ID from the route params
    showtimeId.value = route.params.id;
    
    // Get movie info from query params
    movieId.value = route.query.movieId || 1;
    movieName.value = route.query.movie || 'Game of Thrones';
    screeningDate.value = route.query.date || '2025-03-26';
    screeningTime.value = route.query.time || '19:00';
    hallName.value = route.query.hall || 'Hall 1';
    
    // Fetch seats from API based on hall_id
    // For now, we'll simulate this with the hall data we can see
    const hallId = parseInt(route.query.hall_id) || 1;
    
    // Generate seating plan based on the actual database
    generateRealSeatingPlan(hallId);
    
    loading.value = false;
  } catch (err) {
    console.error('Error fetching seating plan:', err);
    error.value = 'Failed to load seating plan. Please try again.';
    loading.value = false;
  }
};

const generateRealSeatingPlan = (hallId) => {
  // Based on the database screenshot, hall_id 1 has 10 seats
  if (hallId === 1) {
    // Create a single row labeled 'A' with 10 seats
    seatingPlan.value = [{
      label: 'A',
      seats: Array.from({ length: 10 }, (_, i) => {
        // Add spacing between seats for better visuals (aisle after every 5 seats)
        if ((i + 1) % 5 === 0) {
          return { isAisle: true };
        }
        
        return {
          number: i + 1,
          status: 'available', // All seats start as available (matches DB)
          isAisle: false,
          id: i + 1, // Actual seat ID from the database
          hall_id: 1
        };
      }),
      isWalkway: false
    }];
  } else {
    // Generic fallback for other halls
    seatingPlan.value = [{
      label: 'A',
      seats: Array.from({ length: 10 }, (_, i) => {
        if ((i + 1) % 5 === 0) {
          return { isAisle: true };
        }
        
        return {
          number: i + 1,
          status: 'available',
          isAisle: false,
          id: i + 1,
          hall_id: hallId
        };
      }),
      isWalkway: false
    }];
  }
};

const getRandomSeatStatus = () => {
  return 'available'; // All seats are available by default
};

const toggleSeat = (rowLabel, seat) => {
  if (seat.status !== 'available') return;
  
  const seatObj = { 
    row: rowLabel, 
    number: seat.number, 
    id: seat.id,
    hall_id: seat.hall_id
  };
  
  const index = selectedSeats.value.findIndex(s => s.id === seat.id);
  
  if (index === -1) {
    // If not already selected, select it (if under max limit)
    if (selectedSeats.value.length < MAX_SELECTABLE_SEATS) {
      selectedSeats.value.push(seatObj);
    } else {
      alert(`You can select a maximum of ${MAX_SELECTABLE_SEATS} seats.`);
    }
  } else {
    // If already selected, deselect it
    deselectSeat(seatObj);
  }
};

const deselectSeat = (seat) => {
  const index = selectedSeats.value.findIndex(s => s.id === seat.id);
  if (index !== -1) {
    selectedSeats.value.splice(index, 1);
  }
};

const isSeatSelected = (row, number) => {
  return selectedSeats.value.some(seat => seat.row === row && seat.number === number);
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatTime = (timeStr) => {
  // Convert 24h to 12h format
  const [hours, minutes] = timeStr.split(':');
  let h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${minutes} ${ampm}`;
};

const proceedToCheckout = () => {
  if (selectedSeats.value.length === 0) {
    return;
  }
  
  // In a real app, you would navigate to checkout with the selected seats
  router.push({
    name: 'checkout',
    params: { showtimeId: showtimeId.value },
    query: {
      seats: selectedSeats.value.map(seat => `${seat.id}`).join(','), // Use actual seat IDs
      seat_numbers: selectedSeats.value.map(seat => `${seat.row}${seat.number}`).join(','), // Human-readable format
      movie: movieName.value,
      date: screeningDate.value,
      time: screeningTime.value,
      hall: hallName.value,
      hall_id: selectedSeats.value[0].hall_id,
      price: totalPrice.value.toFixed(2)
    }
  });
};

// Lifecycle hooks
onMounted(() => {
  fetchSeats();
});
</script>

<style scoped>
.seat-selection-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #121212;
  color: #f5f5f1;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 40px;
  text-align: center;
}

.spinner {
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid #e50914;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 48px;
  color: #e50914;
  margin-bottom: 20px;
}

.retry-button, .back-button {
  background-color: #e50914;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;
  font-weight: bold;
  text-decoration: none;
  display: inline-block;
  margin: 10px;
}

.seat-selection-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.booking-info {
  background-color: #1f1f1f;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
}

.movie-info {
  flex: 2;
  min-width: 300px;
}

.movie-info h1 {
  font-size: 24px;
  margin-bottom: 10px;
  color: #fff;
}

.screening-info {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ccc;
}

.selected-seats-summary {
  flex: 1;
  min-width: 250px;
  background-color: #292929;
  border-radius: 8px;
  padding: 15px;
}

.selected-seats-summary h3 {
  font-size: 16px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-seats-summary h3 span {
  background-color: #e50914;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.seats-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
  min-height: 30px;
}

.seat-tag {
  background-color: rgba(229, 9, 20, 0.2);
  color: #e50914;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.remove-seat {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0 2px;
  font-size: 16px;
  line-height: 1;
}

.remove-seat:hover {
  color: #e50914;
}

.pricing-summary {
  border-top: 1px solid #444;
  padding-top: 15px;
  margin-top: 15px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #ccc;
}

.price-row.total {
  font-weight: bold;
  color: white;
  font-size: 16px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #444;
}

.proceed-button {
  width: 100%;
  padding: 12px;
  background-color: #e50914;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  margin-top: 15px;
  cursor: pointer;
}

.proceed-button:disabled {
  background-color: #555;
  cursor: not-allowed;
}

.proceed-button:hover:not(:disabled) {
  background-color: #b70710;
}

.seating-plan-container {
  background-color: #1f1f1f;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  padding: 30px 20px;
}

.screen-container {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}

.screen {
  height: 15px;
  background: linear-gradient(to bottom, #999, #fff);
  border-radius: 50%;
  width: 80%;
  max-width: 600px;
  margin: 0 auto;
  transform: perspective(200px) rotateX(-5deg);
  box-shadow: 0 0 20px rgba(229, 9, 20, 0.5);
}

.screen-label {
  margin-top: 10px;
  color: #ccc;
  font-size: 12px;
  letter-spacing: 1px;
}

.seating-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #ccc;
}

.seat-demo {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.seat-demo.available {
  background-color: #2c2c2c;
  border: 1px solid #555;
}

.seat-demo.selected {
  background-color: #e50914;
  border: 1px solid #e50914;
}

.seat-demo.occupied {
  background-color: #444;
  border: 1px solid #555;
}

.seat-demo.not-available {
  background-color: transparent;
  border: 1px dashed #555;
}

.seats-container {
  display: flex;
  justify-content: center;
}

.small-hall-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.seat-row {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.row-label {
  width: 30px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #ccc;
}

.row-label.left {
  margin-right: 10px;
}

.row-label.right {
  margin-left: 10px;
}

.seating-area {
  display: flex;
  gap: 8px;
}

.seat-wrapper {
  margin: 0 2px;
  position: relative;
}

.aisle-space {
  width: 20px;
}

.seat {
  width: 40px;
  height: 40px;
  position: relative;
  cursor: pointer;
  perspective: 100px;
  margin: 6px 2px;
}

.seat-back {
  position: absolute;
  top: 0;
  left: 5px;
  right: 5px;
  height: 15px;
  background-color: #2c2c2c;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  transform: rotateX(20deg);
  transform-origin: bottom;
  transition: all 0.2s;
}

.seat-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30px;
  background-color: #2c2c2c;
  border: 1px solid #555;
  border-top: none;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 12px;
  transition: all 0.2s;
}

.seat-number {
  font-size: 11px;
  user-select: none;
}

/* Available seat */
.seat-available:hover .seat-back,
.seat-available:hover .seat-bottom {
  background-color: #444;
}

/* Selected seat */
.seat-selected .seat-back,
.seat-selected .seat-bottom {
  background-color: #e50914;
  border-color: #e50914;
  color: white;
}

/* Occupied seat */
.seat-occupied .seat-back,
.seat-occupied .seat-bottom {
  background-color: #444;
  border-color: #555;
  color: #777;
  cursor: not-allowed;
}

/* Disabled seat */
.seat-disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.seat-info {
  text-align: center;
  margin-top: 20px;
  color: #999;
  font-size: 14px;
}

.seat-info i {
  color: #e50914;
  margin-right: 5px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .booking-info {
    flex-direction: column;
  }
  
  .seat {
    width: 30px;
    height: 35px;
    margin: 4px 1px;
  }
  
  .seat-back {
    height: 12px;
  }
  
  .seat-bottom {
    height: 25px;
  }
  
  .row-label {
    height: 42px;
  }
  
  .aisle-space {
    width: 10px;
  }
}
</style> 