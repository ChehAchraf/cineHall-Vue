<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { reservations } from '../../services/api';

const route = useRoute();
const router = useRouter();
const reservationId = route.params.id;
const reservation = ref(null);
const error = ref('');
const loading = ref(false);

onMounted(async () => {
    try {
        const response = await reservations.getById(reservationId);
        reservation.value = response.data;
    } catch (error) {
        console.error('Error loading reservation:', error);
        error.value = 'Failed to load reservation details';
    }
});

const processPayment = async () => {
    loading.value = true;
    try {
        const response = await reservations.processTransaction();
        // Redirect to PayPal payment page
        window.location.href = response.data.approval_url;
    } catch (error) {
        console.error('Error processing payment:', error);
        error.value = 'Failed to process payment. Please try again.';
        loading.value = false;
    }
};
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
            <div v-if="error" class="text-red-500 text-center">
                {{ error }}
            </div>

            <div v-if="reservation">
                <h2 class="text-3xl font-bold text-center mb-8">Payment Details</h2>
                
                <div class="space-y-4">
                    <div class="flex justify-between">
                        <span class="text-gray-600">Movie:</span>
                        <span class="font-semibold">{{ reservation.session.movie.title }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Hall:</span>
                        <span class="font-semibold">{{ reservation.session.hall.name }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Time:</span>
                        <span class="font-semibold">{{ reservation.session.start_time }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Seats:</span>
                        <span class="font-semibold">{{ reservation.seats.map(s => s.seat_number).join(', ') }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Total Price:</span>
                        <span class="text-2xl font-bold text-blue-600">${{ reservation.total_price }}</span>
                    </div>
                </div>

                <div class="mt-8">
                    <button
                        @click="processPayment"
                        :disabled="loading"
                        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <span v-if="loading">Processing...</span>
                        <span v-else>Pay with PayPal</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template> 