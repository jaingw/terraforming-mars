import Vue from 'vue';

export const Donate = Vue.component('donate', {
  methods: {
    goJump: function() {
      const app = (this.$root as any);
      app.screen = app.oscreen;
      app.oscreen = 'empty';
    },
  },
  template: `
        <div style="font-family: 'Microsoft YaHei'">
            <div id="mc" v-if="this.$root.oscreen  !== 'empty'">
                <span id="jump2" style=""><a title="继续访问殖民火星" href="#" @click="goJump">点此返回</a></span>
            </div>
            <div class="donate-screen">
                <h1></h1>
                <div class="donate-screen-links" title="充钱你会变得更强" style="font-family: 'SF Mono','Segoe UI Mono','Roboto Mono';">
                    全新土豆功能上线。以下功能为土豆<img src="assets/potato.png" style="height: 30px;vertical-align: middle;" />用户尊享：<br>
                    1、 对局回合外回退，每天5次<br>
                    2、 开局选项含非官方变体及玩家DIY(界限突破、双公司等)<br>
                    3、 开局频率无限制<br>
                    4、 本页面不再弹出<br>
                    5、 不体面地退出游戏<br>
                    6、 即将推出的很多很多功能<br>
                    <a href="help" >&gt;&gt;&gt;点此查看功能指引&lt;&lt;&lt;</a> <br>
                    由于火星服务器费用日渐增长，土豆用户需赞助获得，<br>
                    !!!只需要赞助火星开发30R,就可以收获半年土豆!!!<br>
                    赞助所得用来服务器日常运营，支付时请务必备注本站注册用户名。<br>
                    <br> 
                </div>
                <div  title="充钱你会变得更强">
                    <img src="assets/donatewx.jpg " style="" />
                    <img src="assets/donatezfb.jpg " style="" />
                </div>
            </div>
        </div>
    `,
});
