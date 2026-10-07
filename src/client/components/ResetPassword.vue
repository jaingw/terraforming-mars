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
        <h2 class="text-mars-text text-lg font-bold uppercase tracking-wider mb-6 text-center" v-i18n>Reset Password</h2>
        <div v-if="isTokenError" class="mb-4 p-3 text-sm text-red-300 bg-red-900/30 border border-red-700/50 rounded-sm">
          {{ $t(tokenErrorMessage) }}
        </div>
        <div class="space-y-4">
          <div>
            <label for="reset-username" class="block text-xs text-mars-text-faint uppercase tracking-wider font-mono mb-1" v-i18n>Username</label>
            <input id="reset-username" name="username" autocomplete="username" readonly class="w-full bg-mars-surface border border-mars-border text-mars-text px-3 py-2.5 text-sm rounded-sm focus:outline-none" v-model="userName" />
          </div>
          <div>
            <label for="reset-password" class="block text-xs text-mars-text-faint uppercase tracking-wider font-mono mb-1" v-i18n>Password</label>
            <input id="reset-password" name="password" autocomplete="new-password" type="password" class="w-full bg-mars-surface border border-mars-border text-mars-text px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-mars-rust transition-colors" :placeholder="$t('New Password')" v-model="password" />
          </div>
          <div>
            <label for="reset-confirm-password" class="block text-xs text-mars-text-faint uppercase tracking-wider font-mono mb-1" v-i18n>Confirm Password</label>
            <input id="reset-confirm-password" autocomplete="new-password" type="password" class="w-full bg-mars-surface border border-mars-border text-mars-text px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-mars-rust transition-colors" :placeholder="$t('Confirm Password')" v-model="confirmPassword" />
          </div>
        </div>
        <div class="mt-6 flex items-center justify-between gap-3">
          <button class="flex-1 px-4 py-2.5 bg-mars-rust hover:bg-mars-ember text-white font-medium text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            style="clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));"
            :disabled="isSubmitting || isTokenError"
            @click="resetPassword"
          >{{ $t(isSubmitting ? 'Submitting' : 'Reset Password') }}</button>
          <a
            class="inline-flex items-center justify-center px-3 py-2 text-sm uppercase tracking-wider font-mono text-mars-cyan border border-mars-cyan/30 bg-mars-cyan/10 hover:bg-mars-cyan/15 rounded-sm transition-colors"
            href="/login"
            v-i18n
          >Login</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {$t} from '@/client/directives/i18n';
import {RequestError} from '@/client/utils/request';
import {showError, showWarning} from '../utils/showAlert';
import {authService} from '../services';

function getErrorMessage(err: unknown): string {
  if (err instanceof RequestError) {
    try {
      const body = JSON.parse(err.body) as {error?: string};
      return body.error ?? err.body;
    } catch {
      return err.body;
    }
  }
  return err instanceof Error ? err.message : 'Unexpected server response';
}

function isTokenExpiredError(err: unknown): boolean {
  return getErrorMessage(err).toLowerCase().includes('expired');
}

export default defineComponent({
  name: 'ResetPassword',
  data() {
    return {
      userName: '',
      token: '',
      password: '',
      confirmPassword: '',
      isSubmitting: false,
      isTokenError: false,
      tokenErrorMessage: '',
      isMobileDevice: false,
      _updateResetLayout: undefined as undefined | (() => void),
    };
  },
  mounted() {
    const query = new URLSearchParams(window.location.search);
    this.userName = query.get('userName') ?? '';
    this.token = query.get('token') ?? '';

    if (this.userName.length > 0 && this.token.length > 0) {
      authService.checkResetToken(this.userName, this.token).catch((err) => {
        this.isTokenError = true;
        this.tokenErrorMessage = isTokenExpiredError(err)
          ? 'Reset link has expired. Please request a new one.'
          : 'Reset link is invalid. Please request a new one.';
      });
    }

    const updateLayout = () => {
      const shortEdge = Math.min(window.screen.width || 0, window.screen.height || 0);
      this.isMobileDevice = shortEdge > 0 && shortEdge <= 820;
    };
    updateLayout();
    window.addEventListener('resize', updateLayout);
    this._updateResetLayout = updateLayout;
  },
  beforeUnmount() {
    if (this._updateResetLayout) {
      window.removeEventListener('resize', this._updateResetLayout);
    }
  },
  methods: {
    async resetPassword() {
      if (this.userName.length === 0 || this.token.length === 0 || this.isTokenError) {
        showWarning('Reset link is invalid');
        return;
      }
      if (this.password.length <= 2) {
        showWarning($t('Please enter at least 3 characters for password'));
        return;
      }
      if (this.password !== this.confirmPassword) {
        showWarning('Passwords do not match');
        return;
      }

      this.isSubmitting = true;
      try {
        await authService.resetPassword(this.userName, this.token, this.password);
        window.location.href = '/login?passwordReset=success';
      } catch (err: unknown) {
        showError(getErrorMessage(err));
      } finally {
        this.isSubmitting = false;
      }
    },
  },
});
</script>
