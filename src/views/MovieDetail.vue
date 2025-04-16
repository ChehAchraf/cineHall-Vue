<template>
  <div class="movie-detail-container">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading movie details...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <i class="fas fa-exclamation-circle error-icon"></i>
      <p>{{ error }}</p>
      <button @click="fetchMovie" class="retry-button">Try Again</button>
      <router-link to="/movies" class="back-button">
        <i class="fas fa-arrow-left"></i> Back to Movies
      </router-link>
    </div>
    
    <div v-else class="movie-content">
      <div class="movie-header" :style="{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url(${movie.poster_url})` }">
        <div class="movie-header-content">
          <div class="poster-container">
            <img :src="movie.poster_url" :alt="movie.title" class="movie-poster" />
          </div>
          
          <div class="movie-info">
            <h1 class="movie-title">{{ movie.title }}</h1>
            <div class="movie-meta">
              <span class="meta-item">
                <i class="fas fa-clock"></i> {{ movie.duration }} min
              </span>
              <span class="meta-item">
                <i class="fas fa-calendar"></i> {{ movie.release_year }}
              </span>
              <span class="meta-item">
                <i class="fas fa-star"></i> {{ movie.rating }}/10
              </span>
              <span class="meta-item genre-pill" v-for="genre in movie.genres" :key="genre">
                {{ genre }}
              </span>
            </div>
            
            <div class="movie-director">
              <strong>Director:</strong> {{ movie.director || 'Unknown' }}
            </div>
            
            <div class="movie-cast">
              <strong>Cast:</strong> {{ movie.cast ? movie.cast.join(', ') : 'Unknown' }}
            </div>
            
            <div class="action-buttons">
              <button class="book-button" @click="scrollToShowtimes">
                <i class="fas fa-ticket-alt"></i> Book Tickets
              </button>
              <button class="trailer-button" @click="openTrailer">
                <i class="fas fa-play"></i> Watch Trailer
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="movie-description-section">
        <h2 class="section-title">Synopsis</h2>
        <p class="movie-description">{{ movie.description }}</p>
      </div>
      
      <div id="showtimes-section" class="showtimes-section">
        <h2 class="section-title">Showtimes</h2>
        
        <div class="date-selector">
          <button 
            v-for="(date, index) in availableDates" 
            :key="date.value" 
            class="date-button" 
            :class="{ 'date-selected': selectedDateIndex === index }"
            @click="selectedDateIndex = index"
          >
            <span class="date-day">{{ date.day }}</span>
            <span class="date-date">{{ date.date }}</span>
          </button>
        </div>
        
        <div v-if="filteredShowtimes.length === 0" class="no-showtimes">
          No showtimes available for the selected date.
        </div>
        
        <div v-else class="showtimes-list">
          <div v-for="hall in filteredShowtimesByHall" :key="hall.id" class="hall-container">
            <div class="hall-header">
              <h3 class="hall-name">{{ hall.name }}</h3>
              <div class="hall-features">
                <span v-if="hall.features.includes('3D')" class="hall-feature">3D</span>
                <span v-if="hall.features.includes('IMAX')" class="hall-feature">IMAX</span>
                <span v-if="hall.features.includes('Dolby')" class="hall-feature">Dolby Atmos</span>
              </div>
            </div>
            
            <div class="showtimes-grid">
              <div 
                v-for="showtime in hall.showtimes" 
                :key="showtime.id" 
                class="showtime-item"
                :class="{ 'showtime-sold-out': showtime.available_seats === 0 }"
                @click="selectShowtime(showtime)"
              >
                <span class="showtime-time">{{ formatTime(showtime.time) }}</span>
                <span class="showtime-availability">{{ showtime.available_seats }} seats</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="related-movies-section" v-if="relatedMovies.length > 0">
        <h2 class="section-title">You Might Also Like</h2>
        <div class="related-movies-grid">
          <div 
            v-for="relatedMovie in relatedMovies" 
            :key="relatedMovie.id" 
            class="related-movie-card"
            @click="navigateToMovie(relatedMovie.id)"
          >
            <div class="related-movie-poster">
              <img :src="relatedMovie.poster_url" :alt="relatedMovie.title" />
            </div>
            <div class="related-movie-info">
              <h3 class="related-movie-title">{{ relatedMovie.title }}</h3>
              <div class="related-movie-meta">
                <span>{{ relatedMovie.release_year }}</span>
                <span>{{ relatedMovie.duration }} min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Trailer Modal -->
    <div v-if="showTrailer" class="trailer-modal">
      <div class="trailer-modal-content">
        <button class="close-trailer" @click="showTrailer = false">
          <i class="fas fa-times"></i>
        </button>
        <div class="trailer-container">
          <iframe 
            :src="trailerEmbedUrl" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
          ></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

const movie = ref({});
const loading = ref(true);
const error = ref(null);
const showTrailer = ref(false);

// Trailer embed URL with YouTube ID extracted from trailer_url
const trailerEmbedUrl = computed(() => {
  if (!movie.value || !movie.value.trailer_url) return '';
  
  // Extract YouTube ID from URL
  const match = movie.value.trailer_url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
  }
  return '';
});

// Generate available dates (today + next 6 days)
const availableDates = ref([]);

const selectedDateIndex = ref(0);

// Showtimes data from API
const showtimes = ref([]);

// Mock related movies - these will be fetched from API in real implementation
const relatedMovies = ref([]);

const fetchMovie = async () => {
  const movieId = route.params.id;
  loading.value = true;
  error.value = null;
  
  try {
    console.log(`Fetching movie details for ID: ${movieId}`);
    
    // Use the safe API client to get movie details
    const result = await api.safe.getMovie(movieId);
    
    if (result.success) {
      // Update movie data and ensure required properties exist
      movie.value = {
        ...result.data,
        cast: result.data.cast || [],
        genres: result.data.genres || [],
        poster_url: result.data.poster_url || result.data.image || 'https://via.placeholder.com/500x750?text=No+Image',
        release_year: result.data.release_year || new Date().getFullYear()
      };
      
      // Also fetch movie sessions
      await fetchMovieSessions();
      
      // Fetch related movies
      fetchRelatedMovies();
    } else {
      // If there was an API error but we have fallback data
      if (result.data) {
        movie.value = {
          ...result.data,
          cast: result.data.cast || [],
          genres: result.data.genres || [],
          poster_url: result.data.poster_url || result.data.image || 'https://via.placeholder.com/500x750?text=No+Image',
          release_year: result.data.release_year || new Date().getFullYear()
        };
        
        error.value = result.fallbackMessage || 'Using fallback data. API connection failed.';
        console.warn('API returned error:', result.error);
        
        // Still try to fetch sessions and related movies
        await fetchMovieSessions();
        fetchRelatedMovies();
      } else {
        // If no fallback data, show error
        throw new Error(result.error || 'Failed to load movie details');
      }
    }
  } catch (err) {
    console.error('Error fetching movie details:', err);
    error.value = 'Failed to load movie details. Please try again.';
    
    // Initialize with empty object to prevent null reference errors
    movie.value = {
      id: movieId,
      title: 'Error Loading Movie',
      description: 'Could not load movie details. Please try again later.',
      cast: [],
      genres: [],
      poster_url: 'https://via.placeholder.com/500x750?text=Error+Loading+Movie',
      release_year: new Date().getFullYear()
    };
  } finally {
    loading.value = false;
  }
};

const fetchMovieSessions = async () => {
  if (!movie.value || !movie.value.id) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    // Use the safe API client with proper endpoint
    const result = await api.safe.getMovieSessions(movie.value.id);
    
    if (result.success && Array.isArray(result.data)) {
      const sessionsData = result.data;
      
      // Transform sessions data to showtimes format
      const transformedShowtimes = sessionsData.map(session => {
        const sessionTime = new Date(session.start_time);
        
        // Generate hall features based on hall name
        const hallFeatures = generateHallFeatures(session.hall?.name || '');
        
        return {
          id: session.id,
          date: sessionTime.toISOString().split('T')[0],
          time: formatTime(sessionTime),
          start_time: session.start_time,
          hall_id: session.hall_id,
          hall_name: session.hall?.name || `Hall ${session.hall_id}`,
          price: session.price || (Math.floor(Math.random() * 5) + 10), // Fallback price if not provided
          features: hallFeatures,
          available_seats: session.available_seats || 0,
          total_seats: session.hall?.capacity || 0,
          is_full: session.available_seats === 0
        };
      });
      
      showtimes.value = transformedShowtimes;
      
      // Make sure we have the dates covered
      updateAvailableDates();
    } else {
      // If API failed but gave fallback data
      console.warn('Using fallback session data:', result.fallbackMessage);
      
      // Use the fallback data from the result
      if (result.data && Array.isArray(result.data)) {
        showtimes.value = result.data;
        updateAvailableDates();
      }
    }
  } catch (err) {
    console.error('Error fetching movie sessions:', err);
    error.value = 'Failed to load showtimes. Please try again later.';
  } finally {
    loading.value = false;
  }
};

// Helper function to generate hall features based on hall name
const generateHallFeatures = (hallName) => {
  const features = [];
  
  if (!hallName) return features;
  
  const normalizedName = hallName.toLowerCase();
  
  if (normalizedName.includes('imax')) features.push('IMAX');
  if (normalizedName.includes('3d') || normalizedName.includes('3 d')) features.push('3D');
  if (normalizedName.includes('vip')) features.push('VIP');
  if (normalizedName.includes('dolby') || normalizedName.includes('atmos')) features.push('Dolby');
  if (normalizedName.includes('premium')) features.push('Premium');
  
  return features;
};

// Format time from date string or Date object
const formatTime = (time) => {
  if (typeof time === 'string') {
    // Check if it's just a time string like "14:30"
    if (time.length <= 5 && time.includes(':')) {
      return time;
    }
    
    // Otherwise treat as datetime
    const date = new Date(time);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (time instanceof Date) {
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  return time; // Fallback if format unknown
};

// Update available dates based on showtimes
const updateAvailableDates = () => {
  // If no showtimes, generate at least the next 7 days
  if (!showtimes.value || showtimes.value.length === 0) {
    const nextWeek = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      nextWeek.push(date.toISOString().split('T')[0]);
    }
    
    availableDates.value = nextWeek.map((date, index) => {
      const dateObj = new Date(date);
      return {
        value: date,
        name: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
        day: dateObj.getDate(),
        month: dateObj.toLocaleDateString('en-US', { month: 'short' }),
        active: index === 0 // First date is active by default
      };
    });
    
    selectedDateIndex.value = 0;
    return;
  }
  
  // Get unique dates from showtimes
  const uniqueDates = [...new Set(showtimes.value
    .filter(st => st && st.date) // Filter out items without date
    .map(st => st.date))].sort();
  
  // If still no dates after filtering, generate default dates
  if (uniqueDates.length === 0) {
    updateAvailableDates(); // Recursively call with empty showtimes
    return;
  }
  
  // Transform dates to required format
  availableDates.value = uniqueDates.map((date, index) => {
    const dateObj = new Date(date);
    return {
      value: date,
      name: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
      day: dateObj.getDate(),
      month: dateObj.toLocaleDateString('en-US', { month: 'short' }),
      active: index === 0 // First date is active by default
    };
  });
  
  // Reset selected date to first available
  selectedDateIndex.value = 0;
};

const fetchRelatedMovies = async () => {
  // In a real app, this would call the API to get related movies
  // For demo, just set some sample data
  relatedMovies.value = [
    {
      id: 2,
      title: 'The Dark Knight',
      release_year: 2008,
      duration: 152,
      poster_url: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg'
    },
    {
      id: 3,
      title: 'Interstellar',
      release_year: 2014,
      duration: 169,
      poster_url: 'https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg'
    },
    {
      id: 4,
      title: 'The Matrix',
      release_year: 1999,
      duration: 136,
      poster_url: 'https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg'
    }
  ];
};

const openTrailer = () => {
  showTrailer.value = true;
};

const selectShowtime = (showtime) => {
  if (!showtime || showtime.available_seats === 0) {
    alert('Sorry, this showtime is sold out or invalid.');
    return;
  }
  
  if (!movie.value || !movie.value.title) {
    console.error('Movie data is missing when selecting showtime');
    return;
  }
  
  // Navigate to seat selection page with session ID
  router.push({
    name: 'seat-selection',
    params: { id: showtime.id },
    query: { 
      movie: movie.value.title,
      date: showtime.start_time ? new Date(showtime.start_time).toLocaleDateString() : 'Unknown date',
      time: formatTime(showtime.time || ''),
      hall: showtime.hall_name || `Hall ${showtime.hall_id || 'Unknown'}`,
      price: showtime.price || 0
    }
  });
};

const scrollToShowtimes = () => {
  document.getElementById('showtimes-section').scrollIntoView({ behavior: 'smooth' });
};

const navigateToMovie = (movieId) => {
  router.push({ name: 'movie-detail', params: { id: movieId } });
  // Scroll to top on navigation
  window.scrollTo(0, 0);
};

const filteredShowtimes = computed(() => {
  // Check if availableDates is empty or undefined
  if (!availableDates.value || availableDates.value.length === 0) {
    return [];
  }
  
  // Make sure selectedDateIndex is valid
  const index = selectedDateIndex.value < availableDates.value.length ? 
                selectedDateIndex.value : 0;
                
  const selectedDate = availableDates.value[index].value;
  
  // Filter showtimes by the selected date
  return showtimes.value.filter(showtime => showtime.date === selectedDate);
});

const filteredShowtimesByHall = computed(() => {
  // Group showtimes by hall
  const hallMap = new Map();
  
  for (const showtime of filteredShowtimes.value) {
    if (!hallMap.has(showtime.hall_id)) {
      hallMap.set(showtime.hall_id, {
        id: showtime.hall_id,
        name: showtime.hall_name || `Hall ${showtime.hall_id}`,
        features: showtime.features || [],
        showtimes: []
      });
    }
    
    hallMap.get(showtime.hall_id).showtimes.push(showtime);
  }
  
  // Convert map to array and sort showtimes by time
  return Array.from(hallMap.values()).map(hall => {
    // Safe sort that handles undefined or missing time values
    hall.showtimes.sort((a, b) => {
      // Handle cases where time might be undefined
      const timeA = a.time || '';
      const timeB = b.time || '';
      return timeA.localeCompare(timeB);
    });
    return hall;
  });
});

onMounted(() => {
  fetchMovie();
});
</script>

<style scoped>
.movie-detail-container {
  position: relative;
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
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3498db;
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
  color: #e74c3c;
  margin-bottom: 20px;
}

.retry-button, .back-button {
  background-color: #3498db;
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

.movie-header {
  background-size: cover;
  background-position: center;
  padding: 60px 20px;
  color: white;
}

.movie-header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 30px;
}

.poster-container {
  flex-shrink: 0;
}

.movie-poster {
  width: 300px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
}

.movie-info {
  flex: 1;
}

.movie-title {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 15px;
}

.movie-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.genre-pill {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 14px;
}

.movie-director, .movie-cast {
  margin-bottom: 15px;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.book-button, .trailer-button {
  padding: 12px 24px;
  border-radius: 4px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border: none;
}

.book-button {
  background-color: #e74c3c;
  color: white;
}

.trailer-button {
  background-color: transparent;
  color: white;
  border: 1px solid white;
}

.book-button:hover {
  background-color: #c0392b;
}

.trailer-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.movie-description-section, .showtimes-section, .related-movies-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.movie-description-section {
  border-bottom: 1px solid #eee;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.movie-description {
  font-size: 16px;
  line-height: 1.6;
  color: #555;
}

.date-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.date-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  min-width: 70px;
  background-color: white;
}

.date-selected {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.date-day {
  font-size: 14px;
  margin-bottom: 5px;
}

.date-date {
  font-size: 18px;
  font-weight: bold;
}

.no-showtimes {
  text-align: center;
  padding: 40px;
  color: #666;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.hall-container {
  margin-bottom: 30px;
}

.hall-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.hall-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.hall-features {
  display: flex;
  gap: 10px;
}

.hall-feature {
  background-color: #f1f8ff;
  color: #3498db;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.showtimes-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.showtime-item {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px 15px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100px;
}

.showtime-item:hover {
  background-color: #f9f9f9;
  border-color: #ccc;
}

.showtime-sold-out {
  background-color: #f9f9f9;
  color: #999;
  cursor: not-allowed;
  text-decoration: line-through;
}

.showtime-time {
  font-weight: bold;
  font-size: 16px;
}

.showtime-availability {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.related-movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.related-movie-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.related-movie-card:hover {
  transform: translateY(-5px);
}

.related-movie-poster img {
  width: 100%;
  aspect-ratio: 2/3;
  object-fit: cover;
}

.related-movie-info {
  padding: 15px;
}

.related-movie-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

.related-movie-meta {
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 14px;
}

/* Trailer Modal */
.trailer-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.trailer-modal-content {
  position: relative;
  width: 90%;
  max-width: 900px;
}

.close-trailer {
  position: absolute;
  top: -40px;
  right: 0;
  background: transparent;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}

.trailer-container {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
}

.trailer-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .movie-header-content {
    flex-direction: column;
  }
  
  .poster-container {
    margin: 0 auto;
    margin-bottom: 20px;
  }
  
  .movie-poster {
    width: 200px;
  }
  
  .movie-title {
    font-size: 28px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style> 