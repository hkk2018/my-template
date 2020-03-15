import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import { mainData, User, AuthType } from './main-data';
import { mainService } from './main-service';

Vue.config.productionTip = false;

let dataPreloadP = new Promise(res => {

  //空則幫創第一個，否則正常載入
  mainData.users = mainService.GetFromLocalStorage('users') || createUser();
  mainData.machineConfigs = mainService.GetFromLocalStorage('machineConfigs') || mainData.machineConfigs;//返回預設值:[]
  res();
});

dataPreloadP.then(() => {
  //init vue after loading data
  new Vue({
    render: (h) => h(App),
  }).$mount('#app');
})


// 創建第一筆資料
function createUser() {
  let u: User = { accountName: 'root', password: 'a123456', auth: AuthType.root }
  let users = [u];
  localStorage.setItem('users', JSON.stringify(users));
  return mainService.GetFromLocalStorage('users')
}