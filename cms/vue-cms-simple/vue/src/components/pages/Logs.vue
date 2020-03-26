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
          :disabled="isDisabled||isSystemRunning"
          @click="clickInit"
        >INITIAL</div>
      </div>
      <div class="connectionTip" :class="{connecting:isVmzConnecting}">VMZ Connection</div>
    </div>
    <div class="fullH splitV" style="flex-grow:1">
      <div class="switcherRow">
        <div>
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

        <input type="button" value="Save" style="margin-right:2rem" @click="downLoadLogs" />
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
import { mainData, LogObj } from '../../main-data';
import { mainService } from '../../main-service';

export default Vue.extend({
  name: 'Logs',
  props: {
    logs: Array, isSystemRunning: Boolean, isVmzConnecting: Boolean, isSystemProcessStarted: Boolean
  },
  data() {
    return {
      isErrLog: true,
      isDataLog: true,
      isDisabled: false
    }
  },
  methods: {
    //啟動鈕可以按的時候，基本上機器都處於暫停狀態(未開始or發生錯誤or人為停止)，只是觸發繼續的程序，所以這個isSystemRunning基本上就是實況
    clickAuto() {
      if (this.isDisabled) return;
      if (socketLib.socket.disconnected) {
        //雖然發送時有檢查，但由於有些未跟系統確認就寫定的邏輯，遇到未連線的系統行為會異常，所以還是先於任何按鈕邏輯作檢查
        mainService.alert('尚未連線至系統');
        return;
      }
      socketLib.emitEvent('AUTO');
      mainData.isSystemRunning = true;
      this.isDisabled = true;
      setTimeout(() => {
        this.isDisabled = false;
      }, 2000);

      // 沒有要從上一步開始就不用使用到 isSystemProcessStarted
      // if (this.isSystemProcessStarted) {
      //   let isPrevStep = mainService.confirm('是否從上一步重新開始?', undefined, false);
      //   socketLib.emitEvent('AUTO', isPrevStep);
      // }
      // else {
      //   socketLib.emitEvent('AUTO');
      // }
    },
    clickInit() {
      if (this.isDisabled) return
      if (socketLib.socket.disconnected) {
        //雖然發送時有檢查，但由於有些未跟系統確認就寫定的邏輯，遇到未連線的系統行為會異常，所以還是先於任何按鈕邏輯作檢查
        mainService.alert('尚未連線至系統');
        return;
      }
      this.isDisabled = true;
      socketLib.emitEvent('INIT', null, (res: RespObj) => {
        mainService.handleLogs((res.isErr ? 'ERR: ' : '') + res.msg, res.isErr);
        this.isDisabled = false;
      });
    },
    //要等機械確實停止才可以變換狀態，否則馬上按auto就會發生同時執行兩個命令的情況
    clickStop() {
      if (this.isDisabled) return
      if (socketLib.socket.disconnected) {
        //雖然發送時有檢查，但由於有些未跟系統確認就寫定的邏輯，遇到未連線的系統行為會異常，所以還是先於任何按鈕邏輯作檢查
        mainService.alert('尚未連線至系統');
        return;
      }
      this.isDisabled = true;
      socketLib.emitEvent('STOP', null, () => {
        this.isDisabled = false;
        mainData.isSystemRunning = false;
      });
    },
    downLoadLogs() {
      let logs: LogObj[] = this.logs as any;
      let str = '';
      for (let i = 0; i < logs.length; i++) {
        str += logs[i].receivedT + ' ' + logs[i].logMsg + '\n\r';
      }
      mainService.download(str);
    }

  },
  watch: {
    //遠端回報暫停狀態時才解除按鈕鎖定
    isSystemRunning(nv: boolean) {
      if (nv === false) this.isDisabled = false;
    }
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
  padding-top: 1rem;
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
  word-break: break-all; // https://stackoverflow.com/questions/22369140/html-css-force-wrap-number-displayed-in-chrome
}
.switcherRow {
  margin: 1rem 0 0 2rem;
  display: flex;
  justify-content: space-between;
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
  user-select: none;
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
