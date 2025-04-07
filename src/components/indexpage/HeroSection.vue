<script setup>

</script>

<template>
    <!-- Hero Section -->
    <div class="relative bg-black h-screen flex items-center justify-center">
        <div class="absolute inset-0 bg-[url('https://images.pexels.com/photos/3379934/pexels-photo-3379934.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] bg-cover bg-center bg-no-repeat">
            <!-- Overlay for better text visibility -->
            <div class="absolute inset-0 bg-black opacity-50"></div>
        </div>
        <div class="relative z-10 max-w-6xl mx-auto px-4 text-center">
            <h1 class="text-6xl font-bold text-white mb-6">
                Welcome to <span class="text-red-600">CinemaVue</span>
            </h1>
            <p class="text-xl text-gray-300 mb-8">
                Your ultimate destination for movie information and reviews
            </p>
            <button class="bg-red-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-red-700 transition duration-300">
                Explore Movies
            </button>
        </div>
    </div>
</template>
