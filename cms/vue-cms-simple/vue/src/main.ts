import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import { mainData, User, AuthType } from './main-data';
import { mainService } from './main-service';

Vue.config.productionTip = false;



let dataPreloadP = new Promise(res => {

  //空則幫創第一個，否則正常載入
  mainData.users = mainService.GetFromLocalStorage('users') || createRootUser();
  mainService.loadDataInFromLS('machineConfigs');
  mainService.loadDataInFromLS('dataLogs');
  mainService.loadDataInFromLS('errLogs');
  res();
});

dataPreloadP.then(() => {
  //init vue after loading data
  new Vue({
    render: (h) => h(App),
  }).$mount('#app');
})


// 創建第一筆
function createRootUser() {
  let u: User = new User('admin', '123456', AuthType.root);
  u.lastLognT = new Date();
  let users = [u];
  mainService.saveDataToLS('users',users);
  return mainService.GetFromLocalStorage('users')
}