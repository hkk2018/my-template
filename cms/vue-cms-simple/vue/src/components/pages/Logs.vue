<template>
  <div class="block fullH leftAlign">
    <div class="leftControlPanel">
      <div>
        <br />
        <br />
        <br />
        <br />
        <div>
          <div
            class="controlBut auto"
            :class="{disabled:isDisabled}"
            v-if="!isSystemRunning"
            :disabled="isDisabled"
            @click="clickAuto"
          >AUTO</div>
          <div
            class="controlBut stop"
            :class="{disabled:isDisabled}"
            v-else
            :disabled="isDisabled"
            @click="clickStop"
          >STOP</div>
        </div>
        <br />
        <br />
        <div
          class="controlBut init"
          :class="{disabled:isDisabled||isSystemRunning}"
          :disabled="isDisabled&&isSystemRunning"
          @click="clickInit"
        >INITIAL</div>
      </div>
      <div class="connectionTip" :class="{connecting:isVmzConnecting}">VMZ Connection</div>
    </div>
    <div class="fullH splitV" style="flex-grow:1">
      <div class="switcher">
        <div
          class="switherElement noRightRadius"
          @click="isDataLog=!isDataLog"
          :class="{selected:isDataLog}"
        >Log</div>
        <div
          class="switherElement noLeftRadius"
          @click="isErrLog=!isErrLog"
          :class="{selected:isErrLog}"
        >Err</div>
      </div>
      <div class="logBoxWrapper center">
        <div class="logBox">
          <div
            class="textLine"
            v-for="(logObj, index) in logs"
            :key="index"
            v-show="(logObj.isErr&&isErrLog)||(!logObj.isErr&&isDataLog)"
          >
            <span>{{logObj.receivedT}}</span>
            &nbsp;
            {{logObj.logMsg}}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { socketLib } from '../../socket';

export default Vue.extend({
  name: 'Logs',
  props: {
    logs: Array, isSystemRunning: Boolean, isVmzConnecting: Boolean
  },
  data() {
    return {
      isErrLog: true,
      isDataLog: true,
      isDisabled: false
    }
  },
  methods: {
    clickAuto() {
      this.isDisabled = true;
      socketLib.emitEvent('AUTO');
      setTimeout(() => {
        this.isDisabled = false;
      }, 2000);
    },
    clickInit() {
      this.isDisabled = true;
      socketLib.emitEvent('INIT');
      setTimeout(() => {
        this.isDisabled = false;
      }, 2000);
    },
    clickStop() {
      this.isDisabled = true;
      socketLib.emitEvent('STOP');
      setTimeout(() => {
        this.isDisabled = false;
      }, 2000);
    },
  },

});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.rootBox {
  display: flex;
  width: 100%;
}
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
  margin: 1rem 0 0 2rem;
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
.leftControlPanel {
  padding: 2rem;
  padding-right: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  box-sizing: border-box;
}
.controlBut {
  font-size: 2rem;
  text-align: center;
  border-radius: 1rem;
  padding: 0.5rem;
  border-style: solid;
  border-width: 1px;
  cursor: pointer;
}
.controlBut:hover {
  filter: brightness(110%);
}
.controlBut.disabled {
  opacity: 0.5;
}
.controlBut.auto {
  background-color: greenyellow;
}
.controlBut.stop {
  background-color: pink;
}

.controlBut.init {
  background-color: darkturquoise;
}
.controlBut.disabled {
  opacity: 0.5;
}
.connectionTip {
  background-color: greenyellow;
  font-size: 1.2rem;
  padding: 1rem;
  opacity: 0.5;
}
.connectionTip.connecting {
  opacity: 1;
}
</style>
