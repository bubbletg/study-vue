import Vue from "vue";
import App from "./App.vue";

Vue.config.productionTip = false;

/**
 * 异步组件，工厂函数方式
 */
Vue.component("HelloWorld", function (resolve, reject) {
  require(["./components/HelloWorld.vue"], function (res) {
    resolve(res);
  });
});

/**
 * 异步组件，Promise 方式
 */
 Vue.component("HelloWorld",()=>import('./components/HelloWorld.vue'));

 /**
  * 高级异步组件
  * @returns 
  */
 const AsyncComp = ()=>({
   component:import('./components/HelloWorld.vue'),
   loading:LoadingComp,
   error:ErrorComp,
   delay:200,
   timeout:1000
 })
 Vue.component("HelloWorld",AsyncComp);


new Vue({
  render: h => h(App)
}).$mount("#app");
