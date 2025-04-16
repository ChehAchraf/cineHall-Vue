<template>
  <div class="min-h-screen bg-dark flex flex-col">
    <Navbar />
    
    <div class="flex-grow flex items-center justify-center px-4 pt-10 pb-20">
      <div class="w-full max-w-md">
        <!-- Decorative Elements -->
        <div class="relative">
          <div class="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-primary opacity-10 blur-xl"></div>
          <div class="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-accent opacity-10 blur-xl"></div>
        
          <!-- Login Card -->
          <div class="relative z-10 bg-dark-light rounded-2xl shadow-card overflow-hidden backdrop-blur-sm border border-dark-lighter">
            <!-- Header -->
            <div class="bg-primary py-5 px-6">
              <h2 class="text-center text-2xl font-display font-bold text-white">Welcome Back</h2>
            </div>
            
            <!-- Form -->
            <form @submit.prevent="login" class="py-8 px-6 md:px-8">
              <div v-if="error" class="mb-6 bg-red-100 bg-opacity-20 backdrop-blur-sm border border-red-400 text-red-200 px-4 py-3 rounded relative">
                {{ error }}
              </div>
              
              <div class="mb-6">
                <label for="email" class="block mb-2 text-sm font-medium text-gray-300">Email Address</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input 
                    type="email" 
                    id="email" 
                    v-model="form.email" 
                    required
                    class="bg-dark-lighter border border-dark-lighter text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-3 placeholder-gray-500"
                    placeholder="your@email.com"
                  >
                </div>
              </div>
              
              <div class="mb-6">
                <label for="password" class="block mb-2 text-sm font-medium text-gray-300">Password</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <input 
                    type="password" 
                    id="password" 
                    v-model="form.password" 
                    required
                    class="bg-dark-lighter border border-dark-lighter text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-3 placeholder-gray-500"
                    placeholder="••••••••"
                  >
                </div>
              </div>
              
              <div class="mb-6">
                <button 
                  type="submit" 
                  class="w-full bg-primary hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark-light transition-all duration-300 flex items-center justify-center shadow-button"
                  :disabled="loading"
                >
                  <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ loading ? 'Signing in...' : 'Sign In' }}
                </button>
              </div>
              
              <div class="text-center text-sm mt-8">
                <p class="text-gray-400 mb-3">Don't have an account?</p>
                <router-link to="/register" class="text-primary hover:text-red-400 font-semibold transition-colors duration-300">
                  Create Account
                </router-link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import Navbar from '../components/Navbar.vue';

const router = useRouter();
const error = ref('');
const loading = ref(false);

const form = reactive({
  email: '',
  password: ''
});

const login = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const response = await api.login(form);
    
    if (response.data.status) {
      // Store token in localStorage
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirect to home page
      router.push('/');
    } else {
      error.value = 'Login failed. Please check your credentials.';
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'An error occurred during login.';
  } finally {
    loading.value = false;
  }
};
</script> 