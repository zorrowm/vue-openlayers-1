import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: "/MapHeat",
    name: "MapHeat",
    component: () => import("../views/MapHeat.vue")
  },
  {
    path: "/MapDraw",
    name: "MapDraw",
    component: () => import("../views/MapDraw.vue")
  },

]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
