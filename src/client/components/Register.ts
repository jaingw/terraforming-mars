
import Vue from 'vue';
import {$t} from '@/client/directives/i18n';
import {showError, showWarning} from '../utils/showAlert';
import {authService} from '../services';

export const Register = Vue.component('register', {
  data: function() {
    return {
      userName: '',
      password: '',
    };
  },
  methods: {
    async register() {
      if (this.userName === undefined || this.userName.length <=1) {
        showWarning($t('Please enter at least 2 characters for userName'));
        return;
      }
      if (this.password === undefined || this.password.length <=2) {
        showWarning($t('Please enter at least 3 characters for password'));
        return;
      }

      try {
        await authService.register(this.userName, this.password);
        window.location.href = '/login';
      } catch (err: any) {
        showError($t(err.body) || 'Unexpected server response');
      }
    },
  },
  template: `
    <div class="bg-mars-void flex items-center justify-center p-4"
      style="flex: 1; min-height: 0; overflow-y: auto; background-image: radial-gradient(ellipse at 50% 30%, rgba(194,65,12,0.08) 0%, transparent 60%), linear-gradient(rgba(30,42,66,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(30,42,66,0.3) 1px, transparent 1px); background-size: 100% 100%, 40px 40px, 40px 40px;">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <a href="/" class="text-mars-rust hover:text-mars-ember transition-colors text-sm font-semibold uppercase tracking-widest" v-i18n>Terraforming Mars</a>
          <div class="mt-1" style="height:1px;background:linear-gradient(to right,transparent,rgba(194,65,12,0.4),transparent);"></div>
        </div>
        <div class="bg-mars-deep border border-mars-border p-6 shadow-xl shadow-black/40"
          style="clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));">
          <h2 class="text-mars-text text-lg font-bold uppercase tracking-wider mb-6 text-center" v-i18n>Register</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-xs text-mars-text-faint uppercase tracking-wider font-mono mb-1" v-i18n>Username</label>
              <input class="w-full bg-mars-surface border border-mars-border text-mars-text px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-mars-rust transition-colors" placeholder="Your Name" v-model="userName" />
            </div>
            <div>
              <label class="block text-xs text-mars-text-faint uppercase tracking-wider font-mono mb-1" v-i18n>Password</label>
              <input type="password" class="w-full bg-mars-surface border border-mars-border text-mars-text px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-mars-rust transition-colors" placeholder="Password" v-model="password" />
            </div>
          </div>
          <div class="mt-6 flex items-center justify-between gap-3">
            <button class="flex-1 px-4 py-2.5 bg-mars-rust hover:bg-mars-ember text-white font-medium text-sm transition-all"
              style="clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));"
              v-on:click="register" v-i18n>Register</button>
            <a class="text-mars-cyan hover:text-mars-cyan text-xs uppercase tracking-wider font-mono hover:underline" href="/login" v-i18n>Login</a>
          </div>
        </div>
      </div>
    </div>
  `,
});

