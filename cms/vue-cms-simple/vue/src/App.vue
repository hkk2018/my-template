<template>
  <div id="app">
    <LoginVue v-bind="{users:md.users}" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mainData } from './main-data';
import LoginVue from './components/Login.vue';

export default Vue.extend({
  name: 'App',
  components: {
    LoginVue,
  },
  data() {
    return {
      md: mainData
    }
  },
});
</script>

<style lang="scss">
:root {
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
  --primary: #321fdb;
  --secondary: #ced2d8;
  --success: #2eb85c;
  --info: #39f;
  --warning: #f9b115;
  --danger: #e55353;
  --light: #ebedef;
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
  font-size: 14px;
  color: #3c4b64;
}
#app {
  font-family: -apple-system, BlinkMacSystemFont, segoe ui, Roboto,
    helvetica neue, Arial, noto sans, sans-serif, apple color emoji,
    segoe ui emoji, segoe ui symbol, noto color emoji;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
}
input{
  border:1px solid #d8dbe0;
  border-radius: 0.25rem;
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
.noLeftRadius {
  border-top-left-radius: 0!important;
  border-bottom-left-radius: 0!important;
}
.noRightRadius {
  border-top-right-radius: 0!important;
  border-bottom-right-radius: 0!important;
}
</style>
