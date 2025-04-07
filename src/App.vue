<script setup>
</script>

<template>
  <nav class="bg-black shadow-lg">
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <div class="flex space-x-7">
          <div class="flex items-center">
            <span class="text-2xl font-semibold text-red-600">CinemaVue</span>
          </div>
          <div class="hidden md:flex items-center space-x-4">
            <router-link to="/" class="py-4 px-2 text-white hover:text-red-600 transition duration-300">Home</router-link>
            <router-link to="/about" class="py-4 px-2 text-white hover:text-red-600 transition duration-300">About</router-link>
          </div>
        </div>
      </div>
    </div>
  </nav>
  <router-view />
</template>

<style scoped>
</style>
