<template>
  <div id="app">
    <transition mode="out-in" name="fade">
      <LoginVue v-if="!md.user" v-bind="{users:md.users}" />
      <MainVue
        v-else
        v-bind="{users:md.users,user:md.user,
        machineConfigs:md.machineConfigs,
        logs:md.logs,isSystemRunning:md.isSystemRunning,
        isVmzConnecting:md.isVmzConnecting,
        isSystemProcessStarted:md.isSystemProcessStarted}"
      />
    </transition>
    <ModalVue
      v-bind="{
      isShowModal:modalConfig.isShowModal,
      isConfirm:modalConfig.isConfirm,
      title:modalConfig.title,
      body:modalConfig.body,
      resFunc:modalConfig.resFunc
      }"
      @on-modal-close="onModalClose"
    />
    <transition mode="out-in" name="fade">
      <div v-if="informConfig.isInform" class="informBox">{{informConfig.msg}}</div>
    </transition>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mainData } from './main-data';
import LoginVue from './components/Login.vue';
import MainVue from './components/Main.vue';
import ModalVue from './components/elements/Modal.vue';

export default Vue.extend({
  name: 'App',
  components: {
    LoginVue,
    MainVue,
    ModalVue
  },
  data() {
    return {
      md: mainData,
      //因為login就要用到所以在最上的層級
      modalConfig: {
        isShowModal: false,
        isConfirm: false,
        title: null,
        body: null,
        isConfirmCancel:true,
        resFunc: null,
      },
      informConfig: {
        isInform: false,
        informP: Promise.resolve(),
        msg: ''
      }
    }
  },
  methods: {
    onModalClose() {
      this.modalConfig.isShowModal = false;
    },
    inform(str: string) {
      this.informConfig.msg = str;
      this.informConfig.informP = this.informConfig.informP.then(() => {
        return new Promise((res, rej) => {
          this.informConfig.isInform = true;
          setTimeout(() => {
            this.informConfig.isInform = false;
            setTimeout(res, 500);
          }, 1500);
        })
      })
    }
  },
});
</script>

<style lang="scss">
//唯一例外專屬於此層的class
.informBox {
  position: fixed;
  left: 0;
  bottom: 0;
  padding: 0.75rem 2rem;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  margin: 1rem;
  background-color: #dbf2e3;
  border-color: #cdedd8;
  color: #28623c;
  opacity: 0.9;
  font-size: 1.3rem;
}

:root {
  //hkk begin
  --main-deep-blue: #3c4b64;
  --border: #d8dbe0;
  --cyan: #17a2b8;
  --light-blue: #63c2de;
  --primary: #20a8d8;
  --info: #63c2de;
  --light: #f0f3f5;
  //hkk end
  --primary-legacy-theme: #321fdb;
  --secondary-legacy-theme: #ced2d8;
  --success-legacy-theme: #2eb85c;
  --info-legacy-theme: #39f;
  --warning-legacy-theme: #f9b115;
  --danger-legacy-theme: #e55353;
  --light-legacy-theme: #ebedef;
  --dark-legacy-theme: #636f83;
  --primary-dark-theme: #4638c2;
  --secondary-dark-theme: #4c4f54;
  --success-dark-theme: #45a164;
  --info-dark-theme: #4799eb;
  --warning-dark-theme: #e1a82d;
  --danger-dark-theme: #d16767;
  --light-dark-theme: #20202a;
  --dark-dark-theme: #181924;
  // --primary: #321fdb;
  --secondary: #ced2d8;
  --success: #2eb85c;
  --info: #39f;
  --warning: #f9b115;
  --danger: #e55353;
  // --light: #ebedef;
  --dark: #636f83;
  --breakpoint-xs: 0;
  --breakpoint-sm: 576px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 992px;
  --breakpoint-xl: 1200px;
  --font-family-sans-serif: -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif,
    "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  --font-family-monospace: SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
}

body {
  margin: 0;
  font-size: 0.9rem;
  color: #23282c;
  // color: var(--main-deep-blue);
  background-color: var(--light-legacy-theme);
}
#app {
  font-family: -apple-system, BlinkMacSystemFont, segoe ui, Roboto,
    helvetica neue, Arial, noto sans, sans-serif, apple color emoji,
    segoe ui emoji, segoe ui symbol, noto color emoji;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
}

%gernerlStyle {
  border: 1px solid var(--border);
  border-radius: 0.25rem;
  padding: 0.375rem 0.75rem;
}
input {
  @extend %gernerlStyle;
}
input[type="button"] {
  cursor: pointer;
}
select {
  @extend %gernerlStyle;
}
button {
  @extend %gernerlStyle;
  transition: 0.2s;
  cursor: pointer;
}
// margin collapse
.antiMC {
  border: 1px solid transparent;
}
.fullH {
  height: 99%; //prevent accidentally make parent produce vertical scroll bar
}
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}
.centerV {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
//為了讓子元素之一正確地以fullH填滿剩餘垂直空間
.splitV {
  display: flex;
  flex-direction: column;
}
.rightAlign {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.leftAlign {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.sidesAlign {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.noLeftRadius {
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
}
.noRightRadius {
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.primaryBut {
  // align-self: flex-end;
  color: white;
  border: 0;
  background-color: var(--primary);
}
.primaryBut:hover {
  background-color: #1985ac;
  border-color: #187da0;
}

.secondaryBut {
  color: #4f5d73;
  background-color: #ced2d8;
}
.secondaryBut:hover {
  filter: brightness(0.95);
}

// button
.butSpace {
  margin: 0 0.5rem;
}

.block {
  box-shadow: 0 1px 1px 0 rgba(60, 75, 100, 0.14),
    0 2px 1px -1px rgba(60, 75, 100, 0.12), 0 1px 3px 0 rgba(60, 75, 100, 0.2);
  background-color: white;
  .blockTitle {
    font-weight: bolder;
    color: var(--main-deep-blue);
    padding: 0.75rem 1.25rem;
    border-bottom: 1px solid;
    border-color: var(--border);
    background-color: var(--light);
  }
  .optionRow {
    border-bottom: 1px solid;
    border-color: var(--border);
    padding: 1rem;
    display: flex;
  }
  .bottomRow {
    display: flex;
    justify-content: center;
    padding: 1rem;
  }
  .optionName {
    display: flex;
    align-items: center;
    width: 6rem;
  }
  .optionItem {
    margin: auto 1rem;
  }
}

table {
  border: 1px solid var(--secondary);
  border-collapse: collapse;
}
th {
  border: 1px solid var(--secondary);
  border-bottom-width: 2px;
  padding: 0.5rem;
}
td {
  border: 1px solid var(--secondary);
  padding: 0.5rem;
}
</style>
