import { createRouter, createWebHistory } from 'vue-router';

// Import the view components (we'll create these next)
const Home = () => import('./views/Home.vue');
const Login = () => import('./views/Login.vue');
const Register = () => import('./views/Register.vue');
const Movies = () => import('./views/Movies.vue');
const MovieDetail = () => import('./views/MovieDetail.vue');
const SeatSelection = () => import('./components/SeatSelection.vue');
const Checkout = () => import('./views/Checkout.vue');
const Profile = () => import('./views/Profile.vue');
const UserReservations = () => import('./views/UserReservations.vue');

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
  },
  {
    path: '/movies',
    name: 'movies',
    component: Movies,
    meta: { requiresAuth: true }
  },
  {
    path: '/movies/:id',
    name: 'movie-detail',
    component: MovieDetail,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/seat-selection/:id',
    name: 'seat-selection',
    component: SeatSelection,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/checkout/:showtimeId',
    name: 'checkout',
    component: Checkout,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/reservations',
    name: 'reservations',
    component: UserReservations,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard to check for authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token');
  
  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    // If route requires auth and user is not authenticated, redirect to login
    next({ name: 'login' });
  } else {
    next();
  }
});

export default router; 