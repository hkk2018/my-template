import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import { mainData, User, AuthType } from './main-data';
import { mainService } from './main-service';

Vue.config.productionTip = false;


let dataPreloadP = new Promise(res => {

  //空則幫創第一個，否則正常載入
  mainData.users = mainService.GetFromLocalStorage('users') || createUser();
  mainService.loadDataIn('machineConfigs');
  mainService.loadDataIn('dataLogs');
  mainService.loadDataIn('errLogs');
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
  let u: User = { accountName: 'user', password: '123456', auth: AuthType.root }
  let users = [u];
  localStorage.setItem('users', JSON.stringify(users));
  return mainService.GetFromLocalStorage('users')
}