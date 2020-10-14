import Vue from 'vue'
import Vuex from 'vuex'


Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user:{
      username:null,
      password:null,
    }
  },
  mutations: {
    setState(state,payload){
      Object.keys(payload).forEach(key => {
        state[key] = payload[key]
      })
      console.log(state);
    },
  },
  actions: {
  },
  modules: {
    
  },
  strict: process.env.NODE_ENV,
  devtools: process.env.NODE_ENV,
  plugins: [
    
  ]
})
