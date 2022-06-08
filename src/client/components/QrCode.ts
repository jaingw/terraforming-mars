import Vue from 'vue';

export const QrCode = Vue.component('qrcode', {
  data: function() {
    return {
      wxmouseenter: -1,
      qqmouseenter: -1,
    };
  },
  methods: {
    fadeIn: function(e:string) {
      if ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        return;
      }
      e === 'wx' ? this.wxmouseenter = 1 : this.qqmouseenter = 1;
    },
    fadeOut: function(e:string) {
      e === 'wx' ? this.wxmouseenter = 0 : this.qqmouseenter = 0;
    },
    qrclick: function(e:string) {
      if (e === 'wx') {
        this.wxmouseenter === 1 ? this.wxmouseenter = 0 : this.wxmouseenter = 1;
      } else {
        this.qqmouseenter === 1 ? this.qqmouseenter = 0 : this.qqmouseenter = 1;
      }
    },
  },
  template: `
    <div class="bottom_tools" style="bottom: 40px;">
      <div class="qr_wx" @mouseover="fadeIn('wx')" @mouseout="fadeOut('wx')" @click="qrclick('wx')">二维码</div>
      <div class="qr_qq" @mouseover="fadeIn('qq')" @mouseout="fadeOut('qq')" @click="qrclick('qq')">二维码</div>
      <img class="qr_imgwx" src="assets/qrcode/qr_imgwx.png" :class="wxmouseenter==1?'qrshow':wxmouseenter==0?'qrhide':'hide'">
      <img class="qr_imgqq" src="assets/qrcode/qr_imgqq.png" :class="qqmouseenter==1?'qrshow':qqmouseenter==0?'qrhide':'hide'">
    </div>
    `,
});
