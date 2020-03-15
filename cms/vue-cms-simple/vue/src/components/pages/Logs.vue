<template>
  <div class="block">
    <div class="center" style="  margin:0 auto;">
      <div class="logBox">
        <div v-for="(log, index) in dataLogs" :key="index">{{log}}</div>
      </div>
      <div class="logBox">
        <div v-for="(log, index) in errLogs" :key="index">{{log}}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'Logs',
  props: {
    dataLogs: Array, errLogs: Array
  }, data() {
    return {

    }
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.logBox {
  height: 70vh;
  width: 30vw;
  overflow: auto;
  border:var(--border) 1px solid;
  padding:1rem;
}
</style>
