import Vue from 'vue';

export const Donate = Vue.component('donate', {
  methods: {
    goJump: function(eve:Event) {
      const app = (this.$root as any);
      if (app.oscreen !== 'empty') {
        app.screen = app.oscreen;
        app.oscreen = 'empty';
        eve.preventDefault();
      }
    },
  },
  template: `
        <div style="font-family: 'Microsoft YaHei'">
            <div id="mc"  >
                <span id="jump2" style=""><a title="继续访问殖民火星" href="/" @click="goJump">点此返回</a></span>
            </div>
            <div class="donate-screen">
                <h1></h1>
                <div class="donate-screen-links" title="不充钱你会变得更强吗" style="font-family: 'SF Mono','Segoe UI Mono','Roboto Mono';">
                    以下功能限土豆<img src="assets/qrcode/potato.png" style="height: 30px;vertical-align: middle;" />用户使用：<br>
                    <div style="margin-left: 20px;">
                      1、 对局回合外回退，每天5次<br>
                      2、 开局选项含非官方变体及玩家DIY(界限突破、双公司等)<br>
                      3、 开局频率无限制<br>
                      4、 保存开局设置，一键下载上传<br>
                      5、 不体面地退出游戏<br>
                      6、 后续推出的其他功能<br>
                    </div>
                    <a href="help" >&gt;&gt;&gt;点此查看功能指引&lt;&lt;&lt;</a> <br>
                    支援火星，点亮土豆专属标识。<br>
                    请扫码添加微信或者添加QQ：478487808<br>
                    30/半年; 50/一年; 200/永久<br>
                    <br>
                </div>
                <div  title="充钱你会变得更强">
                    扫描下方二维码添加微信进微信群 或者 进qq群切磋
                    <img src="assets/qrcode/imgwx.png " style="" />
                    <img src="assets/qrcode/imgqq.png " style="" />
                </div>
            </div>
        </div>
    `,
});
