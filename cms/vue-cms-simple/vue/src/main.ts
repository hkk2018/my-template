import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import { mainData, User, AuthType } from './main-data';

Vue.config.productionTip = false;

let dataPreloadP = new Promise(res => {

  // createUser();
  mainData.users = GetFromLocalStorage('users');
  res();
});

dataPreloadP.then(() => {
  //init vue after loading data
  new Vue({
    render: (h) => h(App),
  }).$mount('#app');

})

function GetFromLocalStorage(key: string): any | null {
  return JSON.parse(localStorage.getItem(key) || 'null');
}

// 創建第一筆資料
function createUser() {
  let u: User = { accountName: 'root', password: 'a123456', auth: AuthType.root }
  let users = [u];
  localStorage.setItem('users', JSON.stringify(users));
}