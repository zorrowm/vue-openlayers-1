import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import Login from '../login/Login.vue'
import Layout from '../layout/Layout.vue'

Vue.use(VueRouter)

//解决重复点menu导航，报错问题
const originalPush = VueRouter.prototype.push
  VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

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
    redirect: '/MapControl',
    children: [
      {
        path: '/MapControl', // 地图控件
        name: "MapControl",
        component: () => import("../views/MapControl/MapControl.vue")
      },
      {
        path: '/MapOperation', // 地图操作
        name: "MapOperation",
        component: () => import("../views/MapOperation/MapOperation.vue")
      },
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
  {
    path: '/index', // 热力图
    name: 'index',
    component: () => import('../components/index.vue')
  },

]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

/* 导航守卫 */
router.beforeEach((to, from, next) => {
  // 获取登录状态和是否跳转到登录
  if(sessionStorage.getItem('userInformation')) {
    next()
  } else {
    next({ name: 'Login' })
  }
})

export default router
