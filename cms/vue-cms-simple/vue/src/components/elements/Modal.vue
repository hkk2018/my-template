<template>
  <div class="modalMask" v-if="isShowModal">
    <div class="modalBox">
      <div class="modalHeader">{{title}}</div>
      <div class="modalBody">{{body}}</div>
      <div class="modalFooter rightAlign">
        <button class="butSpace primaryBut" @click="clickBut(true)">{{isConfirmCancel?'確定':'是'}}</button>
        <button
          class="butSpace secondaryBut"
          v-if="isConfirm"
          @click="clickBut(false)"
        >{{isConfirmCancel?'取消':'否'}}</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'Modal',
  props: {
    title: String,
    body: String,
    isShowModal: Boolean,
    isConfirm: Boolean,
    isConfirmCancel: Boolean,
    resFunc: Function
  },
  data() {
    return {}
  },
  methods: {
    clickBut(isConfirm: boolean) {
      this.$emit('on-modal-close');
      this.resFunc(isConfirm);
    }
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.modalMask {
  position: fixed;
  background-color: rgba($color: #000000, $alpha: 0.5);
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
}
.modalHeader {
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  line-height: 1.5;
  font-size: 1.3125rem;
  font-weight: 600;
}
.modalBox {
  max-width: 500px;
  background-color: white;
  opacity: 1;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 0.3rem;
  margin: 1.75rem auto;
}
.modalBody {
  width: 100%;
  padding: 1rem;
}
.modalFooter {
  padding: 1rem;
  border-top: 1px solid var(--border);
}
</style>
