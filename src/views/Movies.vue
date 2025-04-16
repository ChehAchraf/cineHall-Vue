<template>
  <div class="min-h-screen bg-dark text-white">
    <Navbar />
    
    <div class="pt-24 pb-16">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row items-start justify-between mb-12">
          <div>
            <h1 class="text-3xl md:text-4xl font-display font-bold mb-2">Discover Movies</h1>
            <p class="text-gray-400">Browse our collection of the latest and greatest films</p>
          </div>
          
          <!-- Search and Filter -->
          <div class="mt-6 md:mt-0 w-full md:w-auto">
            <div class="relative">
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Search movies..." 
                class="w-full md:w-64 bg-dark-lighter text-white rounded-full px-5 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-primary"
              >
              <div class="absolute left-3 top-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-500 bg-opacity-20 text-red-100 p-4 rounded-lg text-center my-8">
          {{ error }}
          <button @click="fetchMovies" class="underline mt-2 text-white hover:text-red-200">Try again</button>
        </div>
        
        <!-- No Movies Found -->
        <div v-else-if="filteredMovies.length === 0" class="text-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
          <h3 class="text-xl font-medium text-gray-400">No movies found</h3>
          <p v-if="searchQuery" class="text-gray-500 mt-2">
            No results found for "{{ searchQuery }}". Try a different search term.
          </p>
        </div>
        
        <!-- Movies Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <div 
            v-for="movie in filteredMovies" 
            :key="movie.id" 
            class="bg-dark-light rounded-xl overflow-hidden shadow-card group hover:shadow-lg transition-all duration-300 border border-dark-lighter"
          >
            <div class="relative overflow-hidden">
              <img 
                :src="movie.image || 'https://via.placeholder.com/300x450/121212/E50914?text=CineHall'" 
                :alt="movie.title" 
                class="w-full h-64 object-cover object-center transform group-hover:scale-105 transition-transform duration-300"
              >
              <div class="absolute inset-0 bg-gradient-to-t from-dark to-transparent opacity-70"></div>
              <div class="absolute bottom-0 left-0 w-full p-4">
                <div class="flex items-center space-x-2 mb-2">
                  <span class="px-2 py-1 bg-primary text-white text-xs font-bold rounded">{{ movie.genre || 'Drama' }}</span>
                  <span class="text-xs text-gray-300">{{ formatDuration(movie.duration) }}</span>
                </div>
                <h3 class="text-lg font-bold text-white truncate">{{ movie.title }}</h3>
              </div>
            </div>
            
            <div class="p-4">
              <p class="text-gray-400 text-sm line-clamp-3 h-16">{{ movie.description }}</p>
              
              <div class="mt-4 flex justify-between items-center">
                <span class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span class="ml-1 text-gray-300">{{ movie.rating || '8.5' }}</span>
                </span>
                
                <router-link 
                  :to="{ name: 'movie-detail', params: { id: movie.id } }" 
                  class="bg-primary hover:bg-red-700 text-white font-medium py-1.5 px-4 rounded-lg transition-colors duration-300 text-sm"
                >
                  Details
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Navbar from '../components/Navbar.vue';
import api from '../services/api';

const movies = ref([]);
const loading = ref(true);
const error = ref('');
const searchQuery = ref('');

// Fetch all movies
const fetchMovies = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    console.log('Fetching all movies...');
    
    // Use the safe API client that handles errors and provides fallbacks
    const result = await api.safe.getMovies();
    
    // We always have data here because of fallback mechanism
    movies.value = result.data;
    
    if (!result.success) {
      // If there was an API error, show a message but still display fallback data
      console.warn('API returned error:', result.error);
      error.value = result.fallbackMessage || 'Using fallback data. API connection failed.';
    } else {
      console.log(`Successfully loaded ${movies.value.length} movies`);
    }
  } catch (err) {
    // This should rarely happen because errors are handled in safeApiCall
    console.error('Unexpected error in fetchMovies:', err);
    error.value = `Unexpected error: ${err.message}`;
    
    // If we don't have any movies, use fallback data
    if (movies.value.length === 0) {
      movies.value = [
        {
          id: 1,
          title: "Inception",
          description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
          genre: "Sci-Fi",
          duration: 148,
          rating: 8.8,
          image: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg"
        },
        {
          id: 2,
          title: "The Dark Knight",
          description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
          genre: "Action",
          duration: 152,
          rating: 9.0,
          image: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg"
        }
      ];
      error.value = 'Using sample data. Unexpected error occurred.';
    }
  } finally {
    loading.value = false;
  }
};

// Format duration from minutes to hours and minutes
const formatDuration = (minutes) => {
  if (!minutes) return '2h 15m';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

// Filter movies based on search query
const filteredMovies = computed(() => {
  if (!searchQuery.value) return movies.value;
  
  const query = searchQuery.value.toLowerCase();
  return movies.value.filter(movie => 
    movie.title.toLowerCase().includes(query) || 
    (movie.description && movie.description.toLowerCase().includes(query)) ||
    (movie.genre && movie.genre.toLowerCase().includes(query))
  );
});

onMounted(() => {
  fetchMovies();
});
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 