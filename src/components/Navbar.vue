<template>
  <header class="bg-dark-light bg-opacity-90 backdrop-blur-sm fixed w-full top-0 left-0 z-50 shadow-lg">
    <div class="container mx-auto px-4 py-3 flex justify-between items-center">
      <h1 class="text-3xl font-display font-bold">
        <router-link to="/" class="text-white flex items-center space-x-2 group">
          <span class="bg-primary p-1 rounded text-white transform group-hover:scale-110 transition duration-300">
            Cine<span class="text-accent">Hall</span>
          </span>
        </router-link>
      </h1>
      
      <nav>
        <ul class="hidden md:flex items-center space-x-8">
          <li>
            <router-link to="/" class="text-secondary hover:text-primary transition-colors duration-300 font-medium relative after:absolute after:bottom-0 after:left-0 after:bg-primary after:h-0.5 after:w-0 hover:after:w-full after:transition-all after:duration-300">
              Home
            </router-link>
          </li>
          
          <!-- Show these links if user is not logged in -->
          <template v-if="!isLoggedIn">
            <li>
              <router-link to="/login" class="text-secondary hover:text-primary transition-colors duration-300 font-medium relative after:absolute after:bottom-0 after:left-0 after:bg-primary after:h-0.5 after:w-0 hover:after:w-full after:transition-all after:duration-300">
                Login
              </router-link>
            </li>
            <li>
              <router-link to="/register" class="bg-primary hover:bg-opacity-90 text-white font-semibold py-2 px-5 rounded-full shadow-button transition-all duration-300 hover:translate-y-0.5">
                Sign Up
              </router-link>
            </li>
          </template>
          
          <!-- Show these links if user is logged in -->
          <template v-else>
            <li>
              <router-link to="/movies" class="text-secondary hover:text-primary transition-colors duration-300 font-medium relative after:absolute after:bottom-0 after:left-0 after:bg-primary after:h-0.5 after:w-0 hover:after:w-full after:transition-all after:duration-300">
                Movies
              </router-link>
            </li>
            <li class="relative group">
              <button class="flex items-center space-x-2 text-secondary hover:text-primary transition-colors duration-300 font-medium">
                <span>{{ userName }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div class="absolute right-0 mt-2 w-48 bg-dark-light rounded-md shadow-lg overflow-hidden z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                <router-link to="/profile" class="block px-4 py-3 text-sm text-secondary hover:bg-dark-lighter hover:text-primary transition-colors duration-300">
                  My Profile
                </router-link>
                <button @click="logout" class="w-full text-left px-4 py-3 text-sm text-secondary hover:bg-dark-lighter hover:text-primary transition-colors duration-300">
                  Logout
                </button>
              </div>
            </li>
          </template>
        </ul>

        <!-- Mobile Menu Button -->
        <button @click="toggleMobileMenu" class="md:hidden text-white focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path v-if="mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>
    </div>

    <!-- Mobile Menu -->
    <div v-if="mobileMenuOpen" class="md:hidden bg-dark-light absolute w-full shadow-lg">
      <nav class="container mx-auto px-4 py-4">
        <ul class="flex flex-col space-y-4">
          <li>
            <router-link to="/" class="block text-secondary hover:text-primary transition-colors duration-300 font-medium py-2" @click="closeMobileMenu">
              Home
            </router-link>
          </li>
          
          <!-- Show these links if user is not logged in -->
          <template v-if="!isLoggedIn">
            <li>
              <router-link to="/login" class="block text-secondary hover:text-primary transition-colors duration-300 font-medium py-2" @click="closeMobileMenu">
                Login
              </router-link>
            </li>
            <li>
              <router-link to="/register" class="block text-secondary hover:text-primary transition-colors duration-300 font-medium py-2" @click="closeMobileMenu">
                Sign Up
              </router-link>
            </li>
          </template>
          
          <!-- Show these links if user is logged in -->
          <template v-else>
            <li>
              <router-link to="/movies" class="block text-secondary hover:text-primary transition-colors duration-300 font-medium py-2" @click="closeMobileMenu">
                Movies
              </router-link>
            </li>
            <li>
              <router-link to="/profile" class="block text-secondary hover:text-primary transition-colors duration-300 font-medium py-2" @click="closeMobileMenu">
                My Profile
              </router-link>
            </li>
            <li>
              <button @click="logoutMobile" class="block w-full text-left text-secondary hover:text-primary transition-colors duration-300 font-medium py-2">
                Logout
              </button>
            </li>
          </template>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const isLoggedIn = ref(false);
const mobileMenuOpen = ref(false);
const user = ref(null);

onMounted(() => {
  // Check if user is logged in
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  if (token) {
    isLoggedIn.value = true;
    
    if (userData) {
      try {
        user.value = JSON.parse(userData);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }
});

const userName = computed(() => {
  return user.value?.name || 'User';
});

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};

const logout = async () => {
  try {
    await api.logout();
    handleLogout();
  } catch (error) {
    console.error('Logout failed:', error);
    handleLogout();
  }
};

const logoutMobile = async () => {
  closeMobileMenu();
  await logout();
};

const handleLogout = () => {
  // Clear local storage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Update state
  isLoggedIn.value = false;
  user.value = null;
  
  // Redirect to home page
  router.push('/');
};
</script> 