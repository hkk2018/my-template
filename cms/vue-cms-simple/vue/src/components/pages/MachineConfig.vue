<template>
  <div class>
    <div class="block">
      <div class="blockTitle">
        系統配置
        <select name id style="margin-left:2rem" :disabled="isEdit" v-model="currConfigIndex">
          <option
            v-for="(mc, index) in machineConfigs"
            :key="index"
            :value="index"
          >{{mc.settingName}}</option>
        </select>
        <button class="butSpace secondaryBut" @click="clickAdd" v-if="!isEdit">新增</button>
      </div>
      <div class="optionRow">
        <div class="optionName">Recipe名稱</div>
        <div class="optionItem">
          <input
            type="text"
            placeholder="請輸入設定名"
            v-model="currMachineConfig.settingName"
            :disabled="!isEdit"
          />
        </div>
      </div>
      <div class="optionRow">
        <div class="optionName">手臂速度</div>
        <div class="optionItem">
          <input
            type="text"
            placeholder="請輸入手臂速度：1~5"
            v-model.number="currMachineConfig.armSpeed"
            :disabled="!isEdit"
          />
        </div>
      </div>
      <div
        class="optionRow"
        v-for="(partConfig, index) in currMachineConfig.partConfigs"
        :key="index"
      >
        <div class="optionName">{{partConfig.partName}}</div>
        <div class="optionItem">
          <span>順序：</span>
          <select name id v-model="partConfig.operationOrder" :disabled="!isEdit">
            <option v-for="(int, index1) in 5" :key="index1" :value="int">{{int}}</option>
          </select>
        </div>
        <div class="optionItem">
          <input
            type="text"
            placeholder="X：1~5"
            class="narrow"
            v-model.number="partConfig.axisInfo.x"
            :disabled="!isEdit"
          />
        </div>
        <div class="optionItem">
          <input
            type="text"
            placeholder="Y：1~5"
            class="narrow"
            v-model.number="partConfig.axisInfo.y"
            :disabled="!isEdit"
          />
        </div>
        <div class="optionItem">
          <input
            type="text"
            placeholder="Z：1~5"
            class="narrow"
            v-model.number="partConfig.axisInfo.z"
            :disabled="!isEdit"
          />
        </div>
      </div>
      <div class="bottomRow" v-if="isEdit">
        <button class="primaryBut butSpace" @click="confirmEdit(isUpdate)">確定</button>
        <button class="secondaryBut butSpace" @click="isEdit=false;isUpdate=false">取消</button>
      </div>
      <div class="bottomRow" v-else>
        <button
          class="primaryBut butSpace"
          v-if="!currMachineConfig.isUsing"
          @click="setAsDeafult()"
        >設為預設</button>
        <button class="secondaryBut butSpace" @click="clickEdit()">編輯</button>
        <button class="secondaryBut butSpace" v-if="!currMachineConfig.isUsing" @click="deleteConfig()">刪除</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mainService } from '../../main-service';
import { MachineConfig, PartConfig, AxisInfo } from '../../main-data';

// issues
// https://github.com/vuejs/vue/issues/9873

enum editType {
  add,
  update,
  onlyView
}

export default Vue.extend({
  name: 'MachineConfig',
  props: {
    machineConfigs: Array,
  },
  data(): any {
    return {
      isEdit: false,
      isUpdate: false,
      currConfigIndex: 0,
      tempMachineConfig: null
    }
  },
  mounted() {
    console.log(this)
  },
  methods: {
    createNewConfigData(): any {
      let partNames = ['VMZ', 'ORC', 'P1', 'P2', 'P3'];
      let pcArr = [];
      for (let i = 0; i < partNames.length; i++) {
        pcArr.push(new PartConfig(partNames[i], new AxisInfo(), i + 1));
      };
      return new MachineConfig(undefined, undefined, pcArr)
    },
    clickAdd() {
      this.tempMachineConfig = this.createNewConfigData();
      this.isEdit = true;
    },
    clickEdit() {
      this.tempMachineConfig = JSON.parse(JSON.stringify(this.currMachineConfig));
      this.isEdit = true;
      this.isUpdate = true
    },
    confirmEdit(isToUpdate: Boolean = false) {
      let currMC: MachineConfig = this.currMachineConfig;//此時是temp
      let beforeEditMc: MachineConfig = this.indexedMachineConfig;
      let mcs: MachineConfig[] = this.machineConfigs;
      let armSpeedRange = {
        max: 5,
        min: 1
      }
      let axisRange = {
        max: 5,
        min: 1
      }
      if (!currMC.settingName) {
        mainService.alert('名稱未輸入');
        return
      }
      //若是更新且跟原本同名，則不進行同名檢查
      if (((isToUpdate && beforeEditMc.settingName === currMC.settingName)) ? false : mcs.some(mc => mc.settingName === currMC.settingName)) {
        mainService.alert('名稱重複');
        return;
      }
      if (typeof currMC.armSpeed != 'number' || currMC.armSpeed > armSpeedRange.max || currMC.armSpeed < armSpeedRange.min) {
        mainService.alert(`手臂速度請輸入數字`);
        return;
      }
      let orders = [1, 2, 3, 4, 5];
      currMC.partConfigs.forEach(pc => {
        let i = orders.indexOf(pc.operationOrder);
        if (i != -1) orders.splice(i, 1)
      });

      if (orders.length != 0) {
        mainService.alert(`順序重複`);
        return
      };

      for (let index in currMC.partConfigs) {
        let pc = currMC.partConfigs[index];
        for (let key in pc.axisInfo) {
          let axisAmount: number = (pc.axisInfo as any)[key];
          if (typeof axisAmount != 'number' || axisAmount > axisRange.max || axisAmount < axisRange.min) {
            mainService.alert(`${pc.partName}參數不能為空白，且需為數字`);
            return
          }
        }
      }
      let copyMCs: MachineConfig[] = JSON.parse(JSON.stringify(this.machineConfigs));
      if (isToUpdate) {
        let index = copyMCs.findIndex(mc => mc.id === currMC.id);
        copyMCs.splice(index, 1, currMC);
      }
      else copyMCs.push(currMC);

      localStorage.setItem('machineConfigs', JSON.stringify(copyMCs));
      mainService.loadDataIn('machineConfigs');
      this.isEdit = false;
      this.isUpdate = false;
      mainService.alert('成功');
    },
    deleteConfig() {
      let isToDel = mainService.confirm('確定刪除?');
      let currMC: MachineConfig = this.currMachineConfig;
      let copyMCs: MachineConfig[] = JSON.parse(JSON.stringify(this.machineConfigs));
      let index = copyMCs.findIndex(mc => mc.id === currMC.id);
      copyMCs.splice(index, 1);
      localStorage.setItem('machineConfigs', JSON.stringify(copyMCs));
      mainService.loadDataIn('machineConfigs');
      this.currConfigIndex = 0;
    },
    setAsDeafult() {
      let currMC: MachineConfig = this.currMachineConfig;
      let copyMCs: MachineConfig[] = JSON.parse(JSON.stringify(this.machineConfigs));
      let index = copyMCs.findIndex(mc => mc.id === currMC.id);
      copyMCs.forEach(mc => mc.isUsing = false);
      copyMCs[index].isUsing = true;
      mainService.socketEmitP('SET_AS_DEFAULT_MACHINESEETING', currMC).then(() => {
        localStorage.setItem('machineConfigs', JSON.stringify(copyMCs));
        mainService.loadDataIn('machineConfigs');
        this.currConfigIndex = 0;
        mainService.alert('成功');
      })
    },
  },
  computed: {
    indexedMachineConfig(): MachineConfig {
      return (this.machineConfigs[this.currConfigIndex] || {});
    },
    currMachineConfig(): MachineConfig {
      return this.isEdit ? this.tempMachineConfig : this.indexedMachineConfig;
    }
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

.narrow {
  width: 5rem;
}
</style>
