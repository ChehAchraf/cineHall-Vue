import { createRouter, createWebHistory } from 'vue-router'
import Home from '../src/components/indexpage/HeroSection.vue'
const routes = [
    {
        path: '/',
        name: 'home',
        component: () => import('../views/Home.vue')
    },
    {
        path: '/about',
        name: 'about',
        component: () => import('../views/About.vue')
    }
]

const router = createRouter({ 
    history: createWebHistory(),
    routes
})

export default router
