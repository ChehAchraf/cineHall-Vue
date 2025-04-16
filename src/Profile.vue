import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const user = ref({});
const loading = ref(true);
const error = ref(null);

// ... rest of the script remains unchanged 