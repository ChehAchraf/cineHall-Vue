<template>
  <div class="profile-container">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading profile information...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <i class="fas fa-exclamation-circle error-icon"></i>
      <p>{{ error }}</p>
      <button @click="fetchUserProfile" class="retry-button">Try Again</button>
    </div>
    
    <div v-else class="profile-content">
      <div class="profile-header">
        <div class="avatar-container">
          <i class="fas fa-user avatar-icon"></i>
        </div>
        <div class="user-info">
          <h1>{{ user.name }}</h1>
          <p class="email">{{ user.email }}</p>
          <p class="member-since">Member since {{ formatDate(user.createdAt) }}</p>
        </div>
      </div>

      <div class="profile-actions">
        <router-link to="/reservations" class="action-card">
          <i class="fas fa-ticket-alt action-icon"></i>
          <div class="action-text">
            <h3>My Reservations</h3>
            <p>View and manage your bookings</p>
          </div>
          <i class="fas fa-chevron-right chevron"></i>
        </router-link>
        
        <div class="action-card" @click="editProfile">
          <i class="fas fa-user-edit action-icon"></i>
          <div class="action-text">
            <h3>Edit Profile</h3>
            <p>Update your personal information</p>
          </div>
          <i class="fas fa-chevron-right chevron"></i>
        </div>
        
        <div class="action-card" @click="changePassword">
          <i class="fas fa-lock action-icon"></i>
          <div class="action-text">
            <h3>Change Password</h3>
            <p>Update your password</p>
          </div>
          <i class="fas fa-chevron-right chevron"></i>
        </div>
        
        <div class="action-card logout" @click="logout">
          <i class="fas fa-sign-out-alt action-icon"></i>
          <div class="action-text">
            <h3>Logout</h3>
            <p>Sign out of your account</p>
          </div>
          <i class="fas fa-chevron-right chevron"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const user = ref({});
const loading = ref(true);
const error = ref(null);

const fetchUserProfile = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // In a real app, we would get the user ID from auth state or localStorage
    // For now, we'll use a mock response
    // const response = await getUserProfile(userId);
    // user.value = response.data;
    
    // Mock user data for demonstration
    setTimeout(() => {
      user.value = {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        createdAt: '2023-01-15T10:30:00Z'
      };
      loading.value = false;
    }, 800);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    error.value = 'Failed to load profile information. Please try again.';
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

const editProfile = () => {
  // Will implement this in the future
  alert('Edit profile functionality will be available soon!');
};

const changePassword = () => {
  // Will implement this in the future
  alert('Change password functionality will be available soon!');
};

const logout = async () => {
  try {
    await api.logout();
    localStorage.removeItem('token');
    router.push('/login');
  } catch (err) {
    console.error('Error during logout:', err);
    // Fallback logout even if API fails
    localStorage.removeItem('token');
    router.push('/login');
  }
};

onMounted(() => {
  fetchUserProfile();
});
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 30px auto;
  padding: 20px;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
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
  color: #e74c3c;
  font-size: 40px;
  margin-bottom: 20px;
}

.retry-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;
  font-weight: bold;
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.avatar-container {
  width: 80px;
  height: 80px;
  background-color: #3498db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.avatar-icon {
  color: white;
  font-size: 40px;
}

.user-info h1 {
  margin: 0 0 10px 0;
  font-size: 24px;
}

.email {
  color: #666;
  margin: 0 0 5px 0;
}

.member-since {
  color: #999;
  font-size: 14px;
  margin: 0;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.action-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none;
  color: inherit;
}

.action-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.action-icon {
  font-size: 24px;
  color: #3498db;
  width: 40px;
  text-align: center;
  margin-right: 15px;
}

.action-text {
  flex: 1;
}

.action-text h3 {
  margin: 0 0 5px 0;
}

.action-text p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.chevron {
  color: #999;
}

.logout .action-icon {
  color: #e74c3c;
}
</style> 