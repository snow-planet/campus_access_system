import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import UserHome from '../views/User/Home.vue'
import AdminLogin from '../views/Admin/Login.vue'
import AdminHome from '../views/Admin/AdminHome.vue'
import AdminApproval from '../views/Admin/Home.vue'
import AdminScreen from '../views/Admin/screen.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home  
  },
  {
    path: '/user/home',
    name: 'UserHome',
    component: UserHome
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin
  },
  {
    path: '/admin/home',
    name: 'AdminApproval',
    component: AdminApproval
  },
  {
    path: '/admin/adminhome',
    name: 'AdminHome',
    component: AdminHome
  },
  {
    path: '/admin/screen',
    name: 'AdminScreen',
    component: AdminScreen
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router