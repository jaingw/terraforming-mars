<template>
  <div class="bg-mars-void flex justify-center p-4"
    :class="isMobileDevice ? 'items-start pt-8' : 'items-center'"
    style="flex: 1; min-height: 0; overflow-y: auto; background-image: radial-gradient(ellipse at 50% 30%, rgba(194,65,12,0.08) 0%, transparent 60%), linear-gradient(rgba(30,42,66,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(30,42,66,0.3) 1px, transparent 1px); background-size: 100% 100%, 40px 40px, 40px 40px;"
  >
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <a href="/" class="text-mars-rust hover:text-mars-ember transition-colors text-sm font-semibold uppercase tracking-widest" v-i18n>Terraforming Mars</a>
        <div class="mt-1" style="height:1px;background:linear-gradient(to right,transparent,rgba(194,65,12,0.4),transparent);"></div>
      </div>
      <div class="bg-mars-deep border border-mars-border p-6 shadow-xl shadow-black/40"
        style="clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));"
      >
        <h2 class="text-mars-text text-lg font-bold uppercase tracking-wider mb-6 text-center" v-i18n>Login</h2>
        <div class="space-y-4">
          <div>
            <label for="login-username" class="block text-xs text-mars-text-faint uppercase tracking-wider font-mono mb-1" v-i18n>Username</label>
            <input id="login-username" name="username" autocomplete="username" class="w-full bg-mars-surface border border-mars-border text-mars-text px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-mars-rust transition-colors" placeholder="Your Name" v-model="userName" />
          </div>
          <div>
            <label for="login-password" class="block text-xs text-mars-text-faint uppercase tracking-wider font-mono mb-1" v-i18n>Password</label>
            <input id="login-password" name="password" autocomplete="current-password" type="password" class="w-full bg-mars-surface border border-mars-border text-mars-text px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-mars-rust transition-colors" placeholder="Password" v-model="password" />
          </div>
        </div>
        <div class="mt-6 flex items-center justify-between gap-3">
          <button class="flex-1 px-4 py-2.5 bg-mars-rust hover:bg-mars-ember text-white font-medium text-sm transition-all"
            style="clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));"
            @click="login"
            v-i18n
          >Login</button>
          <a
            class="inline-flex items-center justify-center px-3 py-2 text-sm uppercase tracking-wider font-mono text-mars-cyan border border-mars-cyan/30 bg-mars-cyan/10 hover:bg-mars-cyan/15 rounded-sm transition-colors"
            href="/register"
            v-i18n
          >Register</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {showError, showSuccess, showWarning} from '../utils/showAlert';
import {authService} from '../services';
import {userStore} from '../stores';

export default defineComponent({
  name: 'Login',
  data() {
    return {
      userName: '',
      password: '',
      // This project uses a fixed desktop viewport, so mobile layout needs device-based detection here.
      isMobileDevice: false,
      _updateLoginLayout: undefined as undefined | (() => void),
    };
  },
  mounted() {
    // 这些处理都是为了让登录页在手机上整体往上移，而且不依赖当前项目里失效的响应式断点。
    // 固定 viewport 下，CSS 断点不会按真实手机宽度触发，这里改用设备短边判断是否走移动端布局。
    const updateLayout = () => {
      // 用屏幕短边识别手机设备，避免横竖屏切换时判断失真。
      const shortEdge = Math.min(window.screen.width || 0, window.screen.height || 0);
      this.isMobileDevice = shortEdge > 0 && shortEdge <= 820;
    };
    updateLayout();
    // 屏幕尺寸变化时同步更新布局状态。
    window.addEventListener('resize', updateLayout);
    this._updateLoginLayout = updateLayout;

    const query = new URLSearchParams(window.location.search);
    if (query.get('passwordReset') === 'success') {
      showSuccess('Password reset successful. Please login.');
      window.history.replaceState(null, '', '/login');
    }
  },
  beforeUnmount() {
    if (this._updateLoginLayout) {
      window.removeEventListener('resize', this._updateLoginLayout);
    }
  },
  methods: {
    async login() {
      if (this.userName === undefined || this.userName.length === 0) {
        showWarning('Please enter userName');
        return;
      }
      if (this.password === undefined || this.password.length <= 1) {
        showWarning('Please enter more than 1 characters for password');
        return;
      }

      try {
        const data = await authService.login(this.userName, this.password);
        userStore.setUser(data.id, data.name);
        window.location.href = '/mygames';
      } catch (err: any) {
        showError(err.body || 'Unexpected server response');
      }
    },
  },
});
</script>
