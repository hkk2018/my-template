<template>
  <div class="block fullH splitV">
    <div class="switcher">
      <div class="switherElement noRightRadius" @click="isErr=false" :class="{selected:!isErr}">Log</div>
      <div class="switherElement noLeftRadius" @click="isErr=true" :class="{selected:isErr}">Err</div>
    </div>

    <div class="logBoxWrapper center">
      <div class="logBox" v-if="!isErr">
        <div class="textLine" v-for="(log, index) in dataLogs" :key="index">{{log}}</div>
      </div>
      <div class="logBox" v-else>
        <div class="textLine" v-for="(log, index) in errLogs" :key="index">{{log}}</div>
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
      isErr: false

    }
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
// .tagBox{
// height: 2rem;
// width: 10rem;
//   background-color: var(--light-legacy-theme);
// }
.logBoxWrapper {
  height: 100%;
  border: 1px transparent; //prevent margin collapse
  padding: 2rem;
  overflow: hidden;
}
.logBox {
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  // margin: 2rem;
  overflow: auto;
  border: var(--border) 1px solid;
  padding: 1rem;
  background-color: #272822;
  color: white;
}
.textLine {
  margin-bottom: 1rem;
}
.switcher {
  margin: 1rem 0 0 1rem;
}
.switherElement {
  display: inline-block;
  margin: 0.1rem;
  width: 4rem;
  height: 1.5rem;
  color: #999a96;
  background-color: #b1cfd9;
  padding: 0.375rem;
  border-radius: 0.75rem;
  text-align: center;
  transition: 0.3s;
  cursor: pointer;
}
.switherElement.selected {
  background-color: #25acd9;
  color: white;
}
</style>
