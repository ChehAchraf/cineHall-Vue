import { createRouter, createWebHistory } from 'vue-router'
import Home from '../src/components/indexpage/HeroSection.vue'
import Login from '../views/Login.vue'
const routes = [
    {
        path: '/',
        name: 'home',
        component: () => import('../views/Home.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/about',
        name: 'about',
        component: () => import('../views/About.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const isLoggedIn = !!localStorage.getItem('token') // ولا token ولا Vuex

    if (to.meta.requiresAuth && !isLoggedIn) {
        next(
            {
                path: '/login',
                query: { redirected: 'true' }
            }
        )
    } else {
        next()
    }
})
export default router
