import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

//引入的插件
import "./plugins/antd"; // ant-design-vue

//创建vue实例并挂载到App
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
