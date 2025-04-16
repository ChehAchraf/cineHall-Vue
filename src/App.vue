<script setup>
// Main App component
import DebugInfo from './components/DebugInfo.vue';
</script>

<template>
  <router-view />
  <DebugInfo />
</template>

<style>
/* Global styles */
body {
  font-family: 'Poppins', sans-serif;
  background-color: #121212;
  color: #F5F5F1;
  min-height: 100vh;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #1F1F1F;
}

::-webkit-scrollbar-thumb {
  background: #E50914;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #b70710;
}
</style>
