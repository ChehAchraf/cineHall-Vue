<template>
  <div v-if="showDebug" class="debug-panel">
    <div class="debug-header">
      <h3>API Debug Info</h3>
      <button @click="toggleDebug" class="close-button">&times;</button>
    </div>
    
    <div class="debug-content">
      <div class="debug-section">
        <h4>API Status</h4>
        <div class="status-indicator" :class="apiStatusClass">
          {{ apiStatus }}
        </div>
        <button @click="testApiConnection" class="debug-button">
          <span v-if="!testing">Test Connection</span>
          <span v-else>Testing...</span>
        </button>
      </div>
      
      <div class="debug-section">
        <h4>Auth Token</h4>
        <div class="token-display">
          {{ tokenShort }}
        </div>
      </div>
      
      <div class="debug-section" v-if="latestError">
        <h4>Latest Error</h4>
        <div class="error-box">
          <p><strong>Message:</strong> {{ latestError.message }}</p>
          <p v-if="latestError.status"><strong>Status:</strong> {{ latestError.status }}</p>
          <p v-if="latestError.url"><strong>URL:</strong> {{ latestError.url }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import api from '../services/api';

const showDebug = ref(false);
const apiStatus = ref('Unknown');
const latestError = ref(null);
const token = ref('');
const testing = ref(false);

// Display only the first and last few characters of the token
const tokenShort = computed(() => {
  if (!token.value) return 'No token found';
  if (token.value.length < 15) return token.value;
  return `${token.value.substring(0, 10)}...${token.value.substring(token.value.length - 10)}`;
});

// Change the color of the status indicator based on the API status
const apiStatusClass = computed(() => {
  if (apiStatus.value === 'Connected') return 'status-success';
  if (apiStatus.value === 'Disconnected') return 'status-error';
  return 'status-unknown';
});

// Toggle the debug panel visibility
const toggleDebug = () => {
  showDebug.value = !showDebug.value;
  if (showDebug.value) {
    // Refresh data when panel is opened
    refreshToken();
    testApiConnection();
  }
};

// Refresh the auth token display
const refreshToken = () => {
  token.value = localStorage.getItem('token') || '';
};

// Test the API connection
const testApiConnection = async () => {
  testing.value = true;
  try {
    // Get the current auth token
    refreshToken();
    
    // Attempt to make a simple request to the API using our API service
    const response = await api.getMovies();
    apiStatus.value = 'Connected';
    latestError.value = null;
  } catch (error) {
    apiStatus.value = 'Disconnected';
    latestError.value = {
      message: error.message || 'API request failed',
      status: error.response?.status,
      url: error.config?.url
    };
    
    // Log detailed error info
    console.error('API connection test failed:', error);
  } finally {
    testing.value = false;
  }
};

// Listen for Ctrl+Shift+D to toggle the debug panel
const handleKeyDown = (event) => {
  if (event.ctrlKey && event.shiftKey && event.key === 'D') {
    event.preventDefault();
    toggleDebug();
  }
};

onMounted(() => {
  // Add keyboard shortcut listener
  window.addEventListener('keydown', handleKeyDown);
  
  // Check if we're in development mode
  if (import.meta.env.DEV) {
    // Auto-test API on page load in development
    testApiConnection();
  }
  
  // Clean up when component is destroyed
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
});
</script>

<style scoped>
.debug-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 350px;
  background-color: #1e1e1e;
  border: 1px solid #444;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  color: #f0f0f0;
  z-index: 9999;
  font-family: monospace;
  font-size: 12px;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #333;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.debug-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: bold;
}

.close-button {
  background: none;
  border: none;
  color: #ccc;
  font-size: 20px;
  cursor: pointer;
  padding: 0 5px;
}

.close-button:hover {
  color: white;
}

.debug-content {
  padding: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.debug-section {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #444;
}

.debug-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.debug-section h4 {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #aaa;
}

.status-indicator {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
  font-weight: bold;
}

.status-success {
  background-color: rgba(0, 128, 0, 0.2);
  color: #4caf50;
}

.status-error {
  background-color: rgba(255, 0, 0, 0.2);
  color: #f44336;
}

.status-unknown {
  background-color: rgba(255, 165, 0, 0.2);
  color: #ff9800;
}

.token-display {
  background-color: #2a2a2a;
  padding: 8px;
  border-radius: 4px;
  word-break: break-all;
}

.error-box {
  background-color: rgba(255, 0, 0, 0.1);
  padding: 8px;
  border-radius: 4px;
  color: #f44336;
}

.error-box p {
  margin: 4px 0;
}

.debug-button {
  background-color: #444;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.debug-button:hover {
  background-color: #555;
}
</style> 