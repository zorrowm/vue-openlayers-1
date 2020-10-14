// import Vue from 'vue'

const  state = {
  
}
const getters = {
}
const mutations = {
  setState(state,payload){
    Object.keys(payload).forEach(key => {
      state[key] = payload[key]
    })
  }
}
const actions = {
}
const modules = {
}


export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}