<template>
  <div class="mainBox">
    <div class="headerBox">
      <div class="logoBox">HHC Auto Co.,Ltd</div>
      <div class="headerRightBox">
        <div>{{user.accountName}}</div>
        <input type="button" value="登出" class="butSpace" @click="logout" />
      </div>
    </div>
    <div class="bodyBox">
      <div class="sideBox">
        <div
          class="sideOption"
          v-for="(fName, index) in featureNames"
          :key="index"
          @click="currFeature=featureEnum[fName]"
          :class="{selected:currFeature===featureEnum[fName]}"
          v-show="!('帳戶管理'===fName&&user.auth!==authEnum.root)"
        >{{fName}}</div>
      </div>
      <div class="pageBox">
        <transition name="fade" mode="out-in">
          <PageVue v-if="featureEnum['儀表板']===currFeature" />
          <MachineConfigVue
            v-else-if="featureEnum['系統配置']===currFeature"
            v-bind="{machineConfigs:machineConfigs}"
          />
          <LogsVue
            v-else-if="featureEnum['主頁面']===currFeature"
            v-bind="{logs:logs,isSystemRunning:isSystemRunning,isVmzConnecting:isVmzConnecting,isSystemProcessStarted:isSystemProcessStarted}"
          />
          <AccountsVue v-else-if="featureEnum['帳戶管理']===currFeature" v-bind="{users:users}" />
          <VmzSettingVue v-else-if="featureEnum['VMZ設定']===currFeature" v-bind="{users:users}" />
          <!-- VMZ設定 -->
        </transition>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import PageVue from './pages/Page.vue';
import MachineConfigVue from './pages/MachineConfig.vue';
import { mainData, AuthType } from '../main-data';
import LogsVue from './pages/Logs.vue';
import AccountsVue from './pages/Accounts.vue';
import VmzSettingVue from './pages/VmzSetting.vue';

enum Feature {
  // 儀表板,
  // 系統配置,
  主頁面,
  帳戶管理,
  // VMZ設定
}

function getFeatureNameArr() {
  let arr = [];
  for (let member in Feature) if (isNaN(parseInt(member, 10))) arr.push(member);
  return arr;
}

export default Vue.extend({
  name: 'Main',
  components: {
    PageVue,
    MachineConfigVue,
    LogsVue,
    AccountsVue,
    VmzSettingVue
  },
  props: {
    user: Object,
    users: Array,
    machineConfigs: Array,
    logs: Array,
    isSystemRunning:Boolean,
    isVmzConnecting:Boolean,
    isSystemProcessStarted:Boolean,
  }, data() {
    return {
      currFeature: Feature.主頁面,
      featureNames: getFeatureNameArr(),
      featureEnum: Feature,
      authEnum:AuthType
    }
  }, mounted() {
    // setInterval(() => {
    //   this.a =! this.a;
    console.log(this)
    // }, 2000)
  },
  methods: {
    logout() {
      mainData.user = null;
    }
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.headerBox {
  height: 7vh;
  background-color: white;
  box-shadow: 0 2px 2px 0 rgba(60, 75, 100, 0.14),
    0 3px 1px -2px rgba(60, 75, 100, 0.12), 0 1px 5px 0 rgba(60, 75, 100, 0.2);
  display: flex;
}
.logoBox {
  display:flex;
  align-items: center;;
  height: 100%;
  padding-left: 1rem;
}
.headerRightBox {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.bodyBox {
  height: 93vh;
  display: flex;
}
.sideBox {
  background-color: #2f353a;
  width: 10rem;
  height: 100%;
}
.sideOption {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  padding: 1rem;
  transition: 0.3s;
  cursor: pointer;
}

.sideOption.selected {
  background: #3a4248;
}
.sideOption:hover {
  color: white;
  background: var(--primary);
}
.pageBox {
  width: 100%;
  padding: 2rem;
  overflow: auto;
}
</style>
