import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../login/Login.vue'
import Layout from '../layout/Layout.vue'
import store from '@/store/index'

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
    redirect: to => {  // 重定向
      if(to.path === "/"){
        return store.state.current[0]
      }
    },
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
      {
        path: "/MapMeasure", // 多边形 测距 侧面
        name: "MapMeasure",
        component: () => import("../views/MapMeasure/MapMeasure.vue")
      },
      {
        path: '/test', // 测试
        name: 'test',
        component: () => import("../components/test.vue"),
      },
    ]
  },
]

// 创建路由并选择模式：hash模式(地址栏URL中的 # 符号，仅hash符号之前的内容会被包含在请求中)、history模式（前端的url必须和实际向后端发起请求的url 一致）
const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

//解决重复点menu导航，报错问题
const originalPush = VueRouter.prototype.push
  VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

/* 导航守卫 */
router.beforeEach((to, from, next) => {
  // 获取登录状态和是否跳转到登录
  if(sessionStorage.getItem('userInformation') || to.name === 'Login') {
    next()
  } else {
    next({ name: 'Login' })
  }
})

export default router
