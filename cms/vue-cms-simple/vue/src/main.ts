import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import { mainData, User, AuthType, MachineConfig } from './main-data';
import { mainService, CreateType } from './main-service';

Vue.config.productionTip = false;

// localStorage..clear(); //方便但避免誤用所以多個點

let dataPreloadP = new Promise(res => {
  //空則幫創第一個，否則正常載入
  mainData.users = mainService.GetFromLocalStorage('users') || createRootUser();
  if (mainService.GetFromLocalStorage('machineConfigs') === null) createDefaultMachineConfig();
  mainService.loadDataInFromLS('machineConfigs');
  mainService.loadDataInFromLS('dataLogs');
  mainService.loadDataInFromLS('errLogs');
  res();
});

dataPreloadP.then(() => {
  //init vue after loading data
  mainService.vm = new Vue({
    render: (h) => h(App),
  }).$mount('#app') as any;
})


// 創建第一筆
function createRootUser() {
  let u: User = new User('admin', '123456', AuthType.root);
  u.lastLognT = new Date();
  let users = [u];
  mainService.saveDataToLS('users', users);
  return mainService.GetFromLocalStorage('users')
}

// 創建第一筆
function createDefaultMachineConfig() {
  let mc = mainService.createMachineConfig(CreateType.default);
  mainService.saveDataToLS('machineConfigs', [mc]);
}