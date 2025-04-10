import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/Home.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../components/Loginpage/Index.vue')
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('../components/Registerpage/Index.vue')
    },
    {
        path: '/payment/:id',
        name: 'Payment',
        component: () => import('../components/Payment/Index.vue'),
        meta: { requiresAuth: true }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    
    if (to.meta.requiresAuth && !token) {
        next({ name: 'Login', query: { redirected: 'true' } });
    } else {
        next();
    }
});

export default router; 