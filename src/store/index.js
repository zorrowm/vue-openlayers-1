import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistedstate from 'vuex-persistedstate'  //vuex 持久化插件

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 用户信息
    user: { 
      username:null,
      password:null,
    },
    // 当前导航路径
    current: ['/MapControl'],
  },
  mutations: {
    // 通过 mutations 修改 state 值
    setState(state,payload){
      Object.keys(payload).forEach(key => {
        state[key] = payload[key]
      })
    },
  },
  actions: {
  },
  modules: {
    
  },
  strict: process.env.NODE_ENV,
  devtools: process.env.NODE_ENV,
  plugins: [
    VuexPersistedstate({ 
      // 默认存储到 localStorage 
      storage: window.sessionStorage,
      // 默认存储所有state  1、未给出任何路径，则保留完整状态。 2、如果paths:[...] 用于部分保留状态的任何路径的数组。3、如果paths 给定空数组，则不保留任何状态。
      paths: [ 
        'user',
        'current',
      ]
    })
  ]
})
