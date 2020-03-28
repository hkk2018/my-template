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
            :class="{disabled:isDisabled}"
            v-if="!isSystemRunning"
            :disabled="isDisabled"
            @click="clickAuto"
            type="button"
            class="controlBut auto"
          >AUTO</div>
          <div
            :class="{disabled:isDisabled}"
            v-else
            :disabled="isDisabled"
            @click="clickStop"
            type="button"
            class="controlBut stop"
          >STOP</div>
        </div>
        <br />
        <div
          :class="{disabled:isDisabled||isSystemRunning}"
          :disabled="isDisabled||isSystemRunning"
          @click="clickInit"
          type="button"
          class="controlBut init"
        >INITIAL</div>
      </div>
      <div class="connectionTip" :class="{connecting:isVmzConnecting}">VMZ Connection</div>
    </div>
    <div class="fullH splitV" style="flex-grow:1;height:100%">
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
            <div class="receivedTBox">{{logObj.receivedT}}</div>

            <span>{{logObj.logMsg}}</span>
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
      this.isDisabled = true;
      socketLib.emitEvent('AUTO', null, () => {
        this.isDisabled = false;
        mainData.isSystemRunning = true;
      });

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
      if (this.isDisabled|| mainData.isSystemRunning) return
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
  width: 100%;
  box-sizing: border-box;
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
  // white-space:pre; //會造成不換行
  user-select: none;
  margin-bottom: 1rem;
  word-break: break-all; // https://stackoverflow.com/questions/22369140/html-css-force-wrap-number-displayed-in-chrome
}
.receivedTBox {
  display: inline-block;
  margin-right: 1rem;
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
  user-select: none;
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
  align-items: center;
  justify-content: space-between;
  height: 100%;
  box-sizing: border-box;
  flex: 0 0 13rem;
  // flex-grow: 1;
}

// .ctrlBut {
//   font-size: 1.5rem;
//   margin: 0 auto;
//   display: block;
// }
// .ctrlBut:hover {
//   // filter: brightness(105%);
// }
// .ctrlBut.disabled {
//   opacity: 0.5;
// }

.controlBut {
  // font-size: 2rem;
  text-align: center;
  // border-radius: 1rem;
  // padding: 0.5rem;
  // border-style: solid;
  // border-width: 1px;
  width: 5.5rem;
  cursor: pointer;
  user-select: none;
  border: 1px solid var(--border);
  border-radius: 0.25rem;
  padding: 0.5rem 0.75rem;
}
.controlBut:hover {
  filter: brightness(110%);
}
.controlBut.disabled {
  opacity: 0.5;
}
.controlBut.auto {
  background-color: rgb(32, 201, 151);
}
.controlBut.stop {
  background-color: rgb(248, 108, 107);
}

.controlBut.init {
  background-color: rgb(99, 194, 222);
}
.controlBut.disabled {
  opacity: 0.5;
}
.connectionTip {
  background-color: rgb(248, 108, 107);
  // font-size: 1.2rem;
  // padding: 1rem;
  // text-align: center;

    width: 7rem;
  cursor: pointer;
  user-select: none;
  border: 1px solid var(--border);
  // border-radius: 0.25rem;
  padding: 0.375rem 0.75rem;
}
.connectionTip.connecting {
  opacity: 1;
  background-color: greenyellow;
}
</style>
