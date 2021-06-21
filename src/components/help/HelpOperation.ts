import Vue from 'vue';

export const HelpOperation = Vue.component('help-operation', {
  components: {
  },
  methods: {
  },
  template: `
    <div class="help-operation" style="max-width: 1000px;">
       <h2>1、玩家扩（土豆用户限定）</h2>
       <div style="margin-bottom: .5em;">点击对应的图标，可以跳转到在线文档，查看规则说明。双公司的初始资金为两公司之和-42M€,其余资源效果等不变。同时使用Polyphemos（5M€买牌）和Terralabs Research（1M€买牌）会使买牌费用变为3M€</div>
       <div class="help-img"><img src="assets/qrcode/diy1.png" /></div><br>

       <h2>2、保存开局设置（土豆用户限定）</h2>
       <div style="margin-bottom: .5em;">下箭头可以将当前开局设置保存成json文件，下次开局时可以通过上箭头一键上传设置，可用于ban卡、ban公司等，避免每次重复输入</div>
       <div class="help-img"><img src="assets/qrcode/setting2.jpg" /></div><br>

       <h2>3、回合外回退（土豆用户限定）</h2>
       <div style="margin-bottom: .5em;">
       点击rollback按钮可以回合外回退，每天5次，每点1次都会回退一个回合（即一次玩家行动，不是整个时代）。如果你因为摸牌之后不能使用撤回功能，可以先结束回合，再点这里的rollback， 就可以退到你的回合。
       </div>
       <div class="help-img"><img src="assets/qrcode/rollback3.png" /></div><br>

       <h2>4、体退（土豆用户限定）</h2>
       <div style="margin-bottom: .5em;">满足图上所述条件就会出现体退按钮，点击之后延迟3秒再点击一次，就可以在本局游戏退出。体退后还能看到该玩家最后的面板，版图上的版块以及殖民地、动荡代表等都会保留，绿化版块依然可以给其它玩家的城市计分，可以视为中立玩家，但是不能被其它玩家攻击资源或产能</div>
       <div class="help-img"><img src="assets/qrcode/resign4.jpg" /></div><br>

       <h2>5、语音提示、坐下</h2>
       <div style="margin-bottom: .5em;">
        语音提示：开启之后，在其它玩家结束行动轮到你的回合时，会有简短的声音提示，其它时间不会有声音。 <br>
        坐下： 如果该名玩家的名称没有注册，已经注册的用户可以选择坐下，以绑定该位置的操作权限，其它用户将不能再操作该玩家。同时玩家名称会更改为用户的名称。
       </div>
       <div class="help-img"><img src="assets/qrcode/soundtip5.jpg" /></div><br>

       <h2>6、开放手牌展示</h2>
       <div style="margin-bottom: .5em;">如图所示，开启后其它玩家可以查看你的手牌，包括本局内的玩家。主要是方便其它人旁观学习。</div>
       <div class="help-img"><img src="assets/qrcode/showcards6.jpg" /></div><br>

    </div>
    `,
});
