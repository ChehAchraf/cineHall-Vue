<template>
  <div class="min-h-screen bg-dark text-white">
    <Navbar />
    
    <!-- Hero Section -->
    <section class="relative pt-24 lg:pt-28 pb-20 lg:pb-28">
      <!-- Background Pattern -->
      <div class="absolute inset-0 bg-cinema-pattern opacity-5 z-0"></div>
      
      <!-- Gradient Overlay -->
      <div class="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-dark to-transparent z-0"></div>
      
      <div class="container mx-auto px-4 relative z-10">
        <div class="flex flex-col lg:flex-row items-center max-w-6xl mx-auto">
          <div class="w-full lg:w-1/2 text-center lg:text-left lg:pr-10">
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold mb-6 leading-tight">
              Experience Movies Like <span class="text-primary">Never Before</span>
            </h1>
            <p class="text-lg md:text-xl text-gray-300 mb-8 max-w-lg mx-auto lg:mx-0">
              Your premier destination for the ultimate cinema experience. Book tickets, reserve seats, and enjoy the best movies in town.
            </p>
            
            <div v-if="!isLoggedIn" class="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <router-link to="/login" class="bg-primary hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-button transition-all duration-300 hover:translate-y-0.5 inline-flex items-center justify-center">
                <span>Login</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </router-link>
              <router-link to="/register" class="border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold py-3 px-8 rounded-full transition-all duration-300 hover:translate-y-0.5 inline-flex items-center justify-center">
                Create Account
              </router-link>
            </div>
            
            <div v-else class="bg-dark-light bg-opacity-70 rounded-xl p-6 shadow-lg backdrop-blur-sm border border-dark-lighter max-w-lg mx-auto lg:mx-0">
              <h3 class="text-2xl font-display font-bold mb-4">Welcome back, {{ userName }}!</h3>
              <p class="text-gray-300 mb-6">Ready to enjoy the latest blockbusters? Check out what's playing now.</p>
              <router-link to="/movies" class="bg-primary hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-button transition-all duration-300 hover:translate-y-0.5 w-full inline-block text-center">
                Browse Movies
              </router-link>
            </div>
          </div>
          
          <div class="w-full lg:w-1/2 mt-10 lg:mt-0">
            <div class="relative">
              <!-- Decorative Elements -->
              <div class="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-primary opacity-20 blur-xl"></div>
              <div class="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-accent opacity-20 blur-xl"></div>
              
              <!-- Main Image -->
              <div class="relative z-10 overflow-hidden rounded-2xl shadow-xl border-4 border-dark-lighter transform transition-transform hover:scale-[1.01] duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1485095329183-d0797cdc5676?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
                  alt="Cinema Experience" 
                  class="w-full h-auto object-cover"
                >
                <div class="absolute inset-0 bg-gradient-to-t from-dark to-transparent opacity-80"></div>
                <div class="absolute bottom-0 left-0 w-full p-6">
                  <div class="flex items-center space-x-2">
                    <span class="px-2 py-1 bg-primary text-white text-xs font-bold rounded">New</span>
                    <span class="text-white text-sm">Now Showing</span>
                  </div>
                  <h3 class="text-2xl font-bold text-white mt-2">Exclusive Screenings</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Features Section -->
    <section class="py-16 bg-dark-light">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl md:text-4xl font-display font-bold text-center mb-12">Why Choose <span class="text-primary">CineHall</span>?</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="bg-dark p-6 rounded-xl shadow-card hover:shadow-lg transition-shadow duration-300 border border-dark-lighter">
            <div class="w-14 h-14 bg-primary bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-2">Easy Booking</h3>
            <p class="text-gray-400">Book your tickets online with just a few clicks. No more waiting in line!</p>
          </div>
          
          <!-- Feature 2 -->
          <div class="bg-dark p-6 rounded-xl shadow-card hover:shadow-lg transition-shadow duration-300 border border-dark-lighter">
            <div class="w-14 h-14 bg-primary bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-2">Seat Selection</h3>
            <p class="text-gray-400">Choose your preferred seats ahead of time for the best viewing experience.</p>
          </div>
          
          <!-- Feature 3 -->
          <div class="bg-dark p-6 rounded-xl shadow-card hover:shadow-lg transition-shadow duration-300 border border-dark-lighter">
            <div class="w-14 h-14 bg-primary bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-2">Premium Experience</h3>
            <p class="text-gray-400">Enjoy high-quality screenings in our state-of-the-art cinema halls.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import Navbar from '../components/Navbar.vue';

const isLoggedIn = ref(false);
const user = ref(null);

onMounted(() => {
  // Check if user is logged in
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  if (token && userData) {
    isLoggedIn.value = true;
    try {
      user.value = JSON.parse(userData);
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  }
});

const userName = computed(() => {
  return user.value?.name || 'User';
});
</script> 