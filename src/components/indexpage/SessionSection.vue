<script setup>
import { ref, onMounted } from 'vue';
import { sessions, seats, reservations } from '../../services/api';
import { useRouter } from 'vue-router';

const router = useRouter();
const currentSession = ref(null);
const availableSeats = ref([]);
const selectedSeats = ref([]);
const error = ref('');
const loading = ref(true);

onMounted(async () => {
    try {
        const response = await sessions.getAll();
        if (response.data && response.data.length > 0) {
            currentSession.value = response.data[0];
            console.log(currentSession.value);
            await loadSeats();
        } else {
            error.value = 'No movie sessions available';
        }
    } catch (error) {
        console.error('Error loading sessions:', error);
        error.value = 'Failed to load movie sessions';
    } finally {
        loading.value = false;
    }
});

const loadSeats = async () => {
    if (!currentSession.value) return;
    
    try {
        const response = await seats.getBySession(currentSession.value.id);
        availableSeats.value = response.data;
    } catch (error) {
        console.error('Error loading seats:', error);
        error.value = 'Failed to load available seats';
    }
};

const toggleSeat = (seat) => {
    if (seat.is_reserved) return;
    const index = selectedSeats.value.findIndex(s => s.id === seat.id);
    if (index === -1) {
        selectedSeats.value.push(seat);
    } else {
        selectedSeats.value.splice(index, 1);
    }
};

const isSeatSelected = (seat) => {
    return selectedSeats.value.some(s => s.id === seat.id);
};

const bookSeats = async () => {
    if (selectedSeats.value.length === 0) {
        error.value = 'Please select at least one seat';
        return;
    }

    try {
        const seatIds = selectedSeats.value.map(seat => seat.id).join(',');
        const response = await reservations.create(currentSession.value.id, seatIds);
        
        // Redirect to payment page
        router.push(`/payment/${response.data.id}`);
    } catch (error) {
        console.error('Error booking seats:', error);
        error.value = 'Failed to book seats. Please try again.';
    }
};
</script>

<template>
    <section class="py-12 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-bold text-center mb-8">Latest Movie Session</h2>
            
            <div v-if="error" class="text-red-500 text-center mb-4">
                {{ error }}
            </div>

            <div v-if="loading" class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p class="mt-2 text-gray-600">Loading movie session...</p>
            </div>

            <div v-else-if="currentSession" class="bg-white p-8 rounded-lg shadow-lg">
                <div class="mb-8">
                    <h3 class="text-2xl font-semibold mb-2">{{ currentSession.movie_name || 'Movie Title' }}</h3>
                    <p class="text-gray-600">{{ currentSession.start_time }} • {{ currentSession.hall_name || 'Hall' }}</p>
                </div>

                <!-- Screen -->
                <div class="w-full h-8 bg-gray-300 rounded-lg mb-12 text-center text-sm text-gray-600 flex items-center justify-center">
                    SCREEN
                </div>

                <!-- Seats Layout -->
                <div class="grid grid-cols-10 gap-2 max-w-3xl mx-auto mb-8">
                    <div v-for="seat in availableSeats" 
                        :key="seat.id"
                        @click="toggleSeat(seat)"
                        :class="[
                            'w-8 h-8 rounded-t-lg cursor-pointer flex items-center justify-center text-sm',
                            isSeatSelected(seat) ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-blue-500 hover:text-white',
                            seat.is_reserved ? 'bg-gray-400 cursor-not-allowed' : ''
                        ]"
                        :disabled="seat.is_reserved">
                        {{ seat.seat_number }}
                    </div>
                </div>

                <!-- Seat Legend -->
                <div class="flex justify-center gap-8 text-sm">
                    <div class="flex items-center">
                        <div class="w-6 h-6 bg-gray-200 rounded-t-lg mr-2"></div>
                        <span>Available</span>
                    </div>
                    <div class="flex items-center">
                        <div class="w-6 h-6 bg-blue-500 rounded-t-lg mr-2"></div>
                        <span>Selected</span>
                    </div>
                    <div class="flex items-center">
                        <div class="w-6 h-6 bg-gray-400 rounded-t-lg mr-2"></div>
                        <span>Occupied</span>
                    </div>
                </div>

                <!-- Session Info -->
                <div class="mt-8 p-4 bg-gray-50 rounded-lg">
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="font-semibold">Price per seat</p>
                            <p class="text-2xl font-bold text-blue-600">${{ currentSession.price || '0.00' }}</p>
                        </div>
                        <button 
                            @click="bookSeats"
                            class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            :disabled="selectedSeats.length === 0">
                            Book Seats ({{ selectedSeats.length }})
                        </button>
                    </div>
                </div>
            </div>

            <div v-else class="text-center text-gray-600">
                No movie sessions available at the moment.
            </div>
        </div>
    </section>
</template>
