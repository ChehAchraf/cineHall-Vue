<script setup>
import { ref , onMounted } from 'vue';
import axios from 'axios';

const movies = ref([]);

onMounted(async () => {
    try{
        const response = await axios.get('http://localhost:8000/api/movies',{
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        movies.value = response.data;
        console.log(movies.value);
    }catch(error){
        console.log(error);
    }
} );
</script>

<template>
<section class="py-12 bg-gray-100">
    <h1 class="text-2xl font-bold text-center mb-8 underline">Movies</h1>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Search and Filter Section -->
    <div class="mb-8">
      <div class="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <input
          type="text"
          placeholder="Search movies..."
          class="px-4 py-2 border rounded-lg w-full sm:w-64"
        >
        <select
          class="px-4 py-2 border rounded-lg w-full sm:w-48"
        >
          <option value="all">All Genres</option>
          <option value="action">Action</option>
          <option value="drama">Drama</option>
          <option value="scifi">Sci-Fi</option>
          <option value="comedy">Comedy</option>
        </select>
      </div>
    </div>

    <!-- Movie Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Movie Card 1 -->
      <div v-for="movie in movies" class="bg-white rounded-lg shadow-lg overflow-hidden group relative">
        <img :src="movie.image" alt="Movie 1" class="w-full h-96 object-cover">
        <div class="p-4">
          <h3 class="text-xl font-semibold">{{ movie.title }}</h3>
          <p class="text-gray-600">Sci-Fi</p>
        </div>
        <div class="absolute inset-0 bg-black bg-opacity-75 text-white p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center">
          <h3 class="text-xl font-semibold mb-2">Inception</h3>
          <p class="text-sm mb-4">A thief who steals corporate secrets through dream-sharing technology.</p>
          <div class="flex items-center">
            <span class="text-yellow-400">★</span>
            <span class="ml-1">8.8/10</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>
</template>
