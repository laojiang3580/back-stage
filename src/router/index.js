import { createRouter, createWebHistory } from 'vue-router'
const routes = [
  // {
  //   path: '/about',
  //   name: 'About',
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  // }
  {
    path: '/login',
    name: 'Login',
    component: () => import('../components/login/login.vue')
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/home.vue'),
    redirect: '/welcome',
    children: [
      {
        path:'/welcome',
        component: () => import('../components/welcome/welcome.vue')
      },{
        path:'/users',
        component: () => import('../components/user/user.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  if(to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr) return next('/login')
  next()
})

export default router
