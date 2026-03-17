import Vue from 'vue';

export const QrCode = Vue.component('qrcode', {
  data: function() {
    return {
      showModal: false,
      activeQr: 'wx' as 'wx' | 'qq',
    };
  },
  methods: {
    openModal: function(type: 'wx' | 'qq') {
      this.activeQr = type;
      this.showModal = true;
    },
    closeModal: function() {
      this.showModal = false;
    },
    selectQr: function(type: 'wx' | 'qq') {
      this.activeQr = type;
    },
  },
  template: `
    <span class="qr-inline">
      <span class="qr-inline__text" v-i18n>or scan</span>
      <button class="qr-inline__btn qr-inline__btn--wx" @click="openModal('wx')" title="WeChat">
        <i class="fab fa-weixin"></i>
      </button>
      <button class="qr-inline__btn qr-inline__btn--qq" @click="openModal('qq')" title="QQ">
        <i class="fab fa-qq"></i>
      </button>
      <transition name="qr-modal">
        <div v-if="showModal" class="qr-modal" @click.self="closeModal">
          <div class="qr-modal__content">
            <button class="qr-modal__close" @click="closeModal">
              <i class="fas fa-times"></i>
            </button>
            <div class="qr-modal__tabs">
              <button 
                class="qr-modal__tab" 
                :class="{'qr-modal__tab--active': activeQr === 'wx'}"
                @click="selectQr('wx')">
                <i class="fab fa-weixin"></i>
                <span>WeChat</span>
              </button>
              <button 
                class="qr-modal__tab" 
                :class="{'qr-modal__tab--active': activeQr === 'qq'}"
                @click="selectQr('qq')">
                <i class="fab fa-qq"></i>
                <span>QQ</span>
              </button>
            </div>
            <div class="qr-modal__body">
              <transition name="qr-switch" mode="out-in">
                <div v-if="activeQr === 'wx'" key="wx" class="qr-modal__panel">
                  <div class="qr-modal__header">
                    <i class="fab fa-weixin"></i>
                    <span>WeChat QR Code</span>
                  </div>
                  <img class="qr-modal__img" src="assets/qrcode/qr_imgwx.png" alt="WeChat QR">
                </div>
                <div v-else key="qq" class="qr-modal__panel">
                  <div class="qr-modal__header">
                    <i class="fab fa-qq"></i>
                    <span>QQ QR Code</span>
                  </div>
                  <img class="qr-modal__img" src="assets/qrcode/qr_imgqq.png" alt="QQ QR">
                </div>
              </transition>
            </div>
          </div>
        </div>
      </transition>
    </span>
  `,
});
