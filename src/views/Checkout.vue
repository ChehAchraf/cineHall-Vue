<template>
  <div class="checkout-container">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Preparing checkout...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <i class="fas fa-exclamation-circle error-icon"></i>
      <p>{{ error }}</p>
      <button @click="goBack" class="back-button">
        <i class="fas fa-arrow-left"></i> Back to Seat Selection
      </button>
    </div>
    
    <div v-else-if="bookingComplete" class="confirmation-container">
      <div class="confirmation-card">
        <i class="fas fa-check-circle confirmation-icon"></i>
        <h2>Booking Confirmed!</h2>
        <p>Thank you for your purchase. Your booking reference number is:</p>
        <div class="booking-reference">{{ bookingReference }}</div>
        
        <div class="booking-details">
          <div class="ticket-info">
            <h3>Movie</h3>
            <p>{{ movieName }}</p>
          </div>
          
          <div class="ticket-info">
            <h3>Date & Time</h3>
            <p>{{ formatDate(screeningDate) }}, {{ formatTime(screeningTime) }}</p>
          </div>
          
          <div class="ticket-info">
            <h3>Hall</h3>
            <p>{{ hallName }}</p>
          </div>
          
          <div class="ticket-info">
            <h3>Seats</h3>
            <p>{{ seatsList }}</p>
          </div>
          
          <div class="ticket-info">
            <h3>Amount Paid</h3>
            <p>${{ totalAmount }}</p>
          </div>
        </div>
        
        <div class="actions">
          <button class="action-button" @click="downloadTicket">
            <i class="fas fa-download"></i> Download Ticket
          </button>
          <button class="action-button" @click="sendEmail">
            <i class="fas fa-envelope"></i> Email Ticket
          </button>
          <router-link :to="{ name: 'home' }" class="action-button">
            <i class="fas fa-home"></i> Back to Home
          </router-link>
        </div>
      </div>
    </div>
    
    <div v-else class="checkout-content">
      <div class="checkout-summary">
        <div class="checkout-header">
          <h1>Complete Your Purchase</h1>
          <button @click="goBack" class="back-link">
            <i class="fas fa-arrow-left"></i> Back to Seat Selection
          </button>
        </div>
        
        <div class="order-summary">
          <h2>Order Summary</h2>
          
          <div class="movie-summary">
            <img :src="moviePoster || 'https://via.placeholder.com/120x180'" class="movie-poster" alt="Movie Poster">
            <div class="movie-details">
              <h3>{{ movieName }}</h3>
              <div class="movie-info-item">
                <i class="fas fa-calendar"></i>
                <span>{{ formatDate(screeningDate) }}</span>
              </div>
              <div class="movie-info-item">
                <i class="fas fa-clock"></i>
                <span>{{ formatTime(screeningTime) }}</span>
              </div>
              <div class="movie-info-item">
                <i class="fas fa-film"></i>
                <span>{{ hallName }}</span>
              </div>
              <div class="movie-info-item">
                <i class="fas fa-couch"></i>
                <span>{{ seatsList }}</span>
              </div>
            </div>
          </div>
          
          <div class="pricing-summary">
            <div class="price-row">
              <span>Regular Tickets ({{ seats.length }} × ${{ TICKET_PRICE.toFixed(2) }})</span>
              <span>${{ (seats.length * TICKET_PRICE).toFixed(2) }}</span>
            </div>
            <div class="price-row">
              <span>Booking Fee</span>
              <span>${{ BOOKING_FEE.toFixed(2) }}</span>
            </div>
            <div class="price-row total">
              <span>Total</span>
              <span>${{ totalAmount }}</span>
            </div>
          </div>
        </div>
        
        <div class="payment-timer" v-if="timeRemaining > 0">
          <i class="fas fa-clock"></i>
          <span>Time remaining to complete your order: {{ formatTimeRemaining }}</span>
        </div>
      </div>
      
      <div class="payment-section">
        <h2>Payment Details</h2>
        
        <div class="payment-methods">
          <div class="payment-method-tabs">
            <button 
              v-for="method in paymentMethods" 
              :key="method.id" 
              @click="selectedPaymentMethod = method.id"
              :class="{ active: selectedPaymentMethod === method.id }"
              class="payment-method-tab"
            >
              <i :class="method.icon"></i>
              {{ method.name }}
            </button>
          </div>
          
          <!-- Credit Card Form -->
          <form v-if="selectedPaymentMethod === 'credit-card'" class="payment-form" @submit.prevent="processPayment">
            <div class="form-row">
              <label for="cardName">Cardholder Name</label>
              <input type="text" id="cardName" v-model="paymentInfo.cardName" placeholder="John Doe" required :class="{ 'error': formErrors.cardName }">
              <div v-if="formErrors.cardName" class="error-message">{{ formErrors.cardName }}</div>
            </div>
            
            <div class="form-row">
              <label for="cardNumber">Card Number</label>
              <div class="card-number-input">
                <input type="text" id="cardNumber" v-model="paymentInfo.cardNumber" placeholder="1234 5678 9012 3456" required maxlength="19" @input="formatCardNumber" :class="{ 'error': formErrors.cardNumber }">
                <div class="card-icons">
                  <i class="fab fa-cc-visa"></i>
                  <i class="fab fa-cc-mastercard"></i>
                  <i class="fab fa-cc-amex"></i>
                </div>
              </div>
              <div v-if="formErrors.cardNumber" class="error-message">{{ formErrors.cardNumber }}</div>
            </div>
            
            <div class="form-row split">
              <div class="form-column">
                <label for="expiry">Expiry Date</label>
                <input type="text" id="expiry" v-model="paymentInfo.expiry" placeholder="MM/YY" required maxlength="5" @input="formatExpiryDate" :class="{ 'error': formErrors.expiry }">
                <div v-if="formErrors.expiry" class="error-message">{{ formErrors.expiry }}</div>
              </div>
              <div class="form-column">
                <label for="cvv">CVV</label>
                <input type="text" id="cvv" v-model="paymentInfo.cvv" placeholder="123" required maxlength="4" :class="{ 'error': formErrors.cvv }">
                <div v-if="formErrors.cvv" class="error-message">{{ formErrors.cvv }}</div>
              </div>
            </div>
            
            <div class="form-row checkbox">
              <input type="checkbox" id="saveCard" v-model="paymentInfo.saveCard">
              <label for="saveCard">Save card details for future purchases</label>
            </div>
            
            <button type="submit" class="pay-button" :disabled="processing">
              <span v-if="!processing">Pay ${{ totalAmount }}</span>
              <span v-else><i class="fas fa-circle-notch fa-spin"></i> Processing...</span>
            </button>
          </form>
          
          <!-- PayPal Form -->
          <div v-else-if="selectedPaymentMethod === 'paypal'" class="payment-form">
            <p class="payment-redirect-text">Click the button below to proceed to PayPal for secure payment.</p>
            <button class="pay-button paypal-button" :disabled="processing" @click="processPayment">
              <span v-if="!processing"><i class="fab fa-paypal"></i> Pay with PayPal</span>
              <span v-else><i class="fas fa-circle-notch fa-spin"></i> Redirecting...</span>
            </button>
          </div>
          
          <!-- Mobile Payment Form -->
          <div v-else-if="selectedPaymentMethod === 'mobile-payment'" class="payment-form">
            <div class="qr-code-container">
              <img src="https://via.placeholder.com/200x200?text=QR+Code" alt="Payment QR Code" class="qr-code">
              <p>Scan this QR code with your mobile payment app to complete the purchase.</p>
            </div>
            <div class="payment-status">
              <button class="pay-button" @click="checkPaymentStatus">
                <span v-if="!processing">I've completed the payment</span>
                <span v-else><i class="fas fa-circle-notch fa-spin"></i> Verifying...</span>
              </button>
            </div>
          </div>
        </div>
        
        <div class="secure-payment-notice">
          <i class="fas fa-lock"></i>
          <span>Secure Payment. All payment information is encrypted and securely processed.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// Constants
const TICKET_PRICE = 12.99;
const BOOKING_FEE = 1.50;
const PAYMENT_TIMEOUT = 15 * 60; // 15 minutes in seconds

// State
const loading = ref(true);
const error = ref(null);
const processing = ref(false);
const bookingComplete = ref(false);
const bookingReference = ref('');
const timeRemaining = ref(PAYMENT_TIMEOUT);
const timerInterval = ref(null);

const movieName = ref('');
const screeningDate = ref('');
const screeningTime = ref('');
const hallName = ref('');
const seats = ref([]);
const moviePoster = ref('');
const showtimeId = ref(null);

const selectedPaymentMethod = ref('credit-card');
const paymentInfo = ref({
  cardName: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
  saveCard: false
});

// Form validation 
const formErrors = ref({
  cardName: '',
  cardNumber: '',
  expiry: '',
  cvv: ''
});

// Computed
const totalAmount = computed(() => {
  return ((seats.value.length * TICKET_PRICE) + BOOKING_FEE).toFixed(2);
});

const seatsList = computed(() => {
  return seats.value.join(', ');
});

const formatTimeRemaining = computed(() => {
  const minutes = Math.floor(timeRemaining.value / 60);
  const seconds = timeRemaining.value % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

const isFormValid = computed(() => {
  if (selectedPaymentMethod.value !== 'credit-card') return true;
  
  return !formErrors.value.cardName && 
         !formErrors.value.cardNumber && 
         !formErrors.value.expiry && 
         !formErrors.value.cvv &&
         paymentInfo.value.cardName &&
         paymentInfo.value.cardNumber &&
         paymentInfo.value.expiry &&
         paymentInfo.value.cvv;
});

// Payment methods available
const paymentMethods = [
  { id: 'credit-card', name: 'Credit / Debit Card', icon: 'fas fa-credit-card' },
  { id: 'paypal', name: 'PayPal', icon: 'fab fa-paypal' },
  { id: 'mobile-payment', name: 'Mobile Payment', icon: 'fas fa-mobile-alt' }
];

// Methods
const loadOrderDetails = () => {
  loading.value = true;
  
  try {
    // In a real app, you would fetch the order details from the API
    // or get them from the route params/query
    
    showtimeId.value = route.params.showtimeId;
    movieName.value = route.query.movie || 'Inception';
    screeningDate.value = route.query.date || '2023-12-15';
    screeningTime.value = route.query.time || '19:00';
    hallName.value = route.query.hall || 'IMAX Hall';
    
    // Parse seats from comma-separated list
    if (route.query.seats) {
      seats.value = route.query.seats.split(',');
    } else {
      seats.value = ['A1', 'A2']; // Default for demo
    }
    
    // Mock movie poster
    moviePoster.value = 'https://via.placeholder.com/120x180';
    
    loading.value = false;
    
    // Start the countdown timer
    startCountdownTimer();
  } catch (err) {
    console.error('Error loading order details:', err);
    error.value = 'Failed to load order details. Please try again.';
    loading.value = false;
  }
};

const startCountdownTimer = () => {
  timerInterval.value = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--;
    } else {
      clearInterval(timerInterval.value);
      // Session expired - go back to movie selection
      router.push({ name: 'movie-detail', params: { id: route.query.movieId || 1 } });
      alert('Your booking session has expired. Please try again.');
    }
  }, 1000);
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

const goBack = () => {
  router.go(-1);
};

const processPayment = async () => {
  // Reset errors
  Object.keys(formErrors.value).forEach(key => {
    formErrors.value[key] = '';
  });
  
  // Validate form if credit card payment
  if (selectedPaymentMethod.value === 'credit-card') {
    validateCreditCardForm();
    
    if (!isFormValid.value) {
      return; // Don't proceed if form is invalid
    }
  }
  
  processing.value = true;
  
  try {
    // In a real app, you would call your payment API here
    // const response = await api.processPayment({
    //   showtimeId: showtimeId.value,
    //   seats: seats.value,
    //   paymentMethod: selectedPaymentMethod.value,
    //   paymentDetails: selectedPaymentMethod.value === 'credit-card' ? paymentInfo.value : null
    // });
    
    // For demo purposes, simulate a payment processing delay
    setTimeout(() => {
      // Randomly simulate payment failure for testing (10% chance)
      if (Math.random() < 0.1) {
        throw new Error('Payment declined by bank. Please try a different payment method.');
      }
      
      // Generate a booking reference
      bookingReference.value = 'CIN' + Math.floor(100000 + Math.random() * 900000);
      
      // Clear the countdown timer
      clearInterval(timerInterval.value);
      
      // Show success page
      bookingComplete.value = true;
      processing.value = false;
      
      // In a real app, you would also save the booking to the user's history
    }, 2000);
  } catch (err) {
    console.error('Payment error:', err);
    error.value = err.message || 'Payment failed. Please try again.';
    processing.value = false;
  }
};

const validateCreditCardForm = () => {
  // Card name validation
  if (!paymentInfo.value.cardName.trim()) {
    formErrors.value.cardName = 'Cardholder name is required';
  } else if (paymentInfo.value.cardName.length < 3) {
    formErrors.value.cardName = 'Please enter a valid name';
  }
  
  // Card number validation
  const cardNumberClean = paymentInfo.value.cardNumber.replace(/\s/g, '');
  if (!cardNumberClean) {
    formErrors.value.cardNumber = 'Card number is required';
  } else if (!/^\d{15,16}$/.test(cardNumberClean)) {
    formErrors.value.cardNumber = 'Please enter a valid card number';
  }
  
  // Expiry validation
  if (!paymentInfo.value.expiry) {
    formErrors.value.expiry = 'Expiry date is required';
  } else if (!/^\d{2}\/\d{2}$/.test(paymentInfo.value.expiry)) {
    formErrors.value.expiry = 'Use MM/YY format';
  } else {
    const [month, year] = paymentInfo.value.expiry.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    if (parseInt(month) < 1 || parseInt(month) > 12) {
      formErrors.value.expiry = 'Invalid month';
    } else if (
      (parseInt(year) < currentYear) || 
      (parseInt(year) === currentYear && parseInt(month) < currentMonth)
    ) {
      formErrors.value.expiry = 'Card has expired';
    }
  }
  
  // CVV validation
  if (!paymentInfo.value.cvv) {
    formErrors.value.cvv = 'CVV is required';
  } else if (!/^\d{3,4}$/.test(paymentInfo.value.cvv)) {
    formErrors.value.cvv = 'Invalid CVV';
  }
};

const formatCardNumber = () => {
  // Format card number with spaces after every 4 digits
  let val = paymentInfo.value.cardNumber.replace(/\s/g, '');
  paymentInfo.value.cardNumber = val.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
};

const formatExpiryDate = () => {
  // Auto-format expiry date as MM/YY
  let val = paymentInfo.value.expiry.replace(/\D/g, '');
  
  if (val.length > 0) {
    // Get month and automatically add leading zero if needed
    let month = val.substring(0, 2);
    if (month.length === 1 && parseInt(month) > 1) {
      month = '0' + month;
    } else if (month.length === 2 && parseInt(month) > 12) {
      month = '12';
    }
    
    // Add year if available
    if (val.length > 2) {
      paymentInfo.value.expiry = month + '/' + val.substring(2, 4);
    } else {
      paymentInfo.value.expiry = month;
    }
  }
};

const checkPaymentStatus = async () => {
  processing.value = true;
  
  try {
    // In a real app, you would check the payment status with the API
    // const response = await api.checkPaymentStatus(showtimeId.value);
    
    // For demo purposes, simulate a payment check delay
    setTimeout(() => {
      // Simulate payment success
      bookingReference.value = 'CIN' + Math.floor(100000 + Math.random() * 900000);
      
      // Clear the countdown timer
      clearInterval(timerInterval.value);
      
      // Show success message
      bookingComplete.value = true;
      processing.value = false;
    }, 1500);
  } catch (err) {
    console.error('Payment verification error:', err);
    error.value = 'Payment verification failed. Please try again.';
    processing.value = false;
  }
};

const downloadTicket = () => {
  // In a real app, this would generate and download a PDF ticket
  console.log('Downloading ticket...');
  alert('Ticket download started. Check your downloads folder.');
};

const sendEmail = () => {
  // In a real app, this would send the ticket via email
  console.log('Sending email...');
  alert('Ticket sent to your email address.');
};

// Lifecycle hooks
onMounted(() => {
  loadOrderDetails();
});

onBeforeUnmount(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
  }
});
</script>

<style scoped>
.checkout-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.loading-container, .error-container, .booking-complete {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.loading-container i, .error-container i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
}

.error-container i {
  color: var(--error-color);
}

.success-icon {
  font-size: 5rem;
  color: #4CAF50;
  margin-bottom: 1rem;
}

.booking-actions, .after-booking {
  margin-top: 2rem;
}

.booking-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.after-booking {
  border-top: 1px solid #eee;
  padding-top: 2rem;
  margin-top: 2rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

.checkout-content h1 {
  margin-bottom: 2rem;
  text-align: center;
}

.checkout-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 2rem;
}

.order-summary, .payment-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.movie-info {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.movie-poster {
  width: 100px;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
}

.movie-details h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.movie-details p {
  margin: 0.3rem 0;
  color: #666;
}

.movie-details i {
  width: 1.2rem;
  color: var(--primary-color);
}

.price-summary {
  margin-top: 1.5rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.price-row.total {
  font-weight: bold;
  font-size: 1.2rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.payment-methods {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.payment-method {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-method:hover {
  border-color: var(--primary-color);
}

.payment-method.selected {
  border-color: var(--primary-color);
  background-color: rgba(var(--primary-rgb), 0.05);
}

.payment-method i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  display: block;
}

.payment-form {
  margin-top: 1.5rem;
}

.form-row {
  margin-bottom: 1.5rem;
}

.form-row label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-row input[type="text"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

/* Add styles for error state inputs */
.form-row input.error {
  border-color: var(--error-color);
  background-color: rgba(255, 0, 0, 0.02);
}

/* Add styles for error messages */
.error-message {
  color: var(--error-color);
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.form-row.split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input {
  margin: 0;
}

.card-number-input {
  position: relative;
}

.card-icons {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 5px;
}

.card-icons i {
  font-size: 1.2rem;
  color: #aaa;
}

.payment-info {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background-color: #f9f9f9;
  border-radius: 6px;
  text-align: center;
}

.paypal-logo {
  font-size: 3rem;
  color: #003087;
  margin-top: 1rem;
}

.mobile-payment-options {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
}

.payment-option {
  text-align: center;
}

.payment-option i {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  display: block;
}

.payment-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.checkout-timer {
  margin-bottom: 2rem;
  text-align: center;
}

.checkout-timer p {
  margin-bottom: 0.5rem;
}

.time-remaining {
  font-weight: bold;
  color: var(--primary-color);
}

.progress-bar {
  height: 6px;
  background-color: #eee;
  border-radius: 3px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: var(--primary-color);
  transition: width 1s linear;
}

@media (max-width: 768px) {
  .checkout-grid {
    grid-template-columns: 1fr;
  }
  
  .payment-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .payment-actions button {
    width: 100%;
  }
  
  .payment-methods {
    flex-direction: column;
  }
}
</style> 