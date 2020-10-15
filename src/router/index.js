import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../login/Login.vue'
import Layout from '../layout/Layout.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/Login', // 登录页
    name: 'Login',
    component: Login,
  },
  {
    path: "/", // 页面布局
    name: "Layout",
    component: Layout,
    children: [
      {
        path: "/MapDraw", // 画点线圆
        name: "MapDraw",
        component: () => import("../views/MapDraw/MapDraw.vue")
      },
      {
        path: '/MapHeat', // 热力图
        name: 'MapHeat',
        component: () => import('../views/MapHeat/MapHeat.vue')
      },
      
    ]
  },
  

]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
