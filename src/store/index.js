import Vue from 'vue'
import Vuex from 'vuex'
import StoreLogin from '@/store/login/login.js'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    StoreLogin,
  },
  strict: process.env.NODE_ENV,
  devtools: process.env.NODE_ENV,
  plugins: [
    
  ]
})
