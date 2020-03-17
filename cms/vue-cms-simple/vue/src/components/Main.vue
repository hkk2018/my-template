<template>
  <div class="mainBox">
    <div class="headerBox">
      <div class="logoBox centerV">CompanyImg</div>
      <div class="headerRightBox">
        <div>{{user.accountName}}</div>
        <input type="button" value="登出" class="butSpace" @click="logout" />
      </div>
    </div>
    <div class="bodyBox">
      <div class="sideBox">
        <div
          class="sideOption"
          v-for="(ft, index) in features"
          :key="index"
          @click="currFeture=featureEnum[ft]"
          :class="{selected:currFeture===featureEnum[ft]}"
        >{{ft}}</div>
      </div>
      <div class="pageBox">
        <transition name="fade" mode="out-in">
          <PageVue v-if="featureEnum['儀表板']===currFeture" />
          <MachineConfigVue
            v-else-if="featureEnum['系統配置']===currFeture"
            v-bind="{machineConfigs:machineConfigs}"
          />
          <LogsVue
            v-else-if="featureEnum['系統訊息']===currFeture"
            v-bind="{dataLogs:dataLogs,errLogs:errLogs}"
          />
          <AccountsVue v-else-if="featureEnum['帳戶管理']===currFeture" v-bind="{users:users}" />
          <VmzSettingVue v-else-if="featureEnum['VMZ設定']===currFeture" v-bind="{users:users}" />
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
import { mainData } from '../main-data';
import LogsVue from './pages/Logs.vue';
import AccountsVue from './pages/Accounts.vue';
import VmzSettingVue from './pages/VmzSetting.vue';

enum Feature {
  儀表板,
  系統配置,
  系統訊息,
  帳戶管理,
  VMZ設定
}

function getFeatureArr() {
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
    dataLogs: Array,
    errLogs: Array
  }, data() {
    return {
      currFeture: Feature.系統配置,
      features: getFeatureArr(),
      featureEnum: Feature
    }
  }, mounted() {
    // setInterval(() => {
    //   this.a =! this.a;

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
  width: 5rem;
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
