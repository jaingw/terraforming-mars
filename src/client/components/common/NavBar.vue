<template>
  <div class="tfm-navbar-wrapper">
    <nav class="tfm-navbar">
      <div class="tfm-navbar__inner">
        <!-- Left: Back button + Brand -->
        <div class="tfm-navbar__left">
          <button
            class="tfm-navbar__back"
            @click="goBack"
            :title="$t('Go back')"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <a href="/" class="tfm-navbar__brand">
            <span class="tfm-navbar__brand-text" v-i18n>TFM</span>
            <span class="tfm-navbar__brand-dot"></span>
          </a>
        </div>

        <!-- Center: Navigation links (desktop) -->
        <div class="tfm-navbar__links">
          <a
            v-for="link in navLinks"
            :key="link.path"
            :href="link.path"
            class="tfm-navbar__link"
            :class="{ 'tfm-navbar__link--active': isActive(link.path) }"
            @click.prevent="navigate(link.path)"
          >
            <span class="tfm-navbar__link-icon"><tfm-icon :name="link.icon" :size="16" /></span>
            <span class="tfm-navbar__link-label" v-i18n>{{ link.label }}</span>
          </a>
        </div>

        <!-- Right: User area + hamburger -->
        <div class="tfm-navbar__right">
          <template v-if="userName">
          <a href="/me" class="tfm-navbar__user" @click.prevent="navigate('/me')">
            <span class="tfm-navbar__avatar">{{ avatarLetter }}</span>
            <span class="tfm-navbar__username">{{ userName }}</span>
          </a>
          </template>
          <template v-else>
            <a href="/login" class="tfm-navbar__login" @click.prevent="navigate('/login')" v-i18n>Sign In</a>
          </template>

          <!-- Hamburger toggle (mobile only) -->
          <button class="tfm-navbar__hamburger" @click="toggleMobileMenu" :class="{'tfm-navbar__hamburger--open': mobileMenuOpen}">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile overlay modal — placed OUTSIDE nav to avoid stacking context issues -->
    <transition name="tfm-overlay">
      <div v-if="mobileMenuOpen" class="tfm-navbar__overlay" @click.self="mobileMenuOpen = false">
        <div class="tfm-navbar__modal">
          <!-- Modal header -->
          <div class="tfm-navbar__modal-header">
            <span class="tfm-navbar__brand-text" style="font-size:18px;" v-i18n>TFM</span>
            <button class="tfm-navbar__modal-close" @click="mobileMenuOpen = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Navigation links -->
          <div class="tfm-navbar__modal-links">
            <a
              v-for="link in navLinks"
              :key="'m-' + link.path"
              :href="link.path"
              class="tfm-navbar__modal-link"
              :class="{ 'tfm-navbar__modal-link--active': isActive(link.path) }"
              @click.prevent="navigateMobile(link.path)"
            >
              <span class="tfm-navbar__modal-link-icon"><tfm-icon :name="link.icon" :size="18" /></span>
              <span v-i18n>{{ link.label }}</span>
            </a>
          </div>

          <!-- User section in modal -->
          <div class="tfm-navbar__modal-footer">
            <template v-if="userName">
              <a href="/me" class="tfm-navbar__modal-user" @click.prevent="navigateMobile('/me')">
                <span class="tfm-navbar__avatar" style="width:36px;height:36px;font-size:14px;">{{ avatarLetter }}</span>
                <span class="tfm-navbar__modal-user-name">{{ userName }}</span>
              </a>
            </template>
            <template v-else>
              <a href="/login" class="tfm-navbar__modal-signin" @click.prevent="navigateMobile('/login')" v-i18n>Sign In</a>
            </template>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {userStore} from '@/client/stores';
import TfmIcon from '@/client/components/common/TfmIcon.vue';

export default Vue.extend({
  name: 'NavBar',
  components: {
    TfmIcon,
  },
  data() {
    return {
      userName: '' as string,
      currentPath: '' as string,
      mobileMenuOpen: false,
      unsubscribe: null as (() => void) | null,
    };
  },
  computed: {
    avatarLetter(): string {
      return userStore.avatarLetter;
    },
    navLinks(): Array<{ path: string; label: string; icon: string }> {
      return [
        {path: '/', label: 'Home', icon: 'home'},
        {path: '/lobby', label: 'Lobby', icon: 'lobby'},
        {path: '/me', label: 'Me', icon: 'user'},
        {path: '/ranks', label: 'Ranks', icon: 'trophy'},
        {path: '/cards', label: 'Cards', icon: 'cards'},
      ];
    },
  },
  mounted() {
    this.userName = userStore.userName;
    this.currentPath = window.location.pathname;
    window.addEventListener('popstate', this.updateCurrentPath);
    this.unsubscribe = userStore.subscribe((state) => {
      this.userName = state.userName;
    });
  },
  watch: {
    mobileMenuOpen(val: boolean) {
      document.body.style.overflow = val ? 'hidden' : '';
    },
  },
  beforeDestroy() {
    document.body.style.overflow = '';
    window.removeEventListener('popstate', this.updateCurrentPath);
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  },
  methods: {
    navigate(path: string) {
      if (window.location.pathname !== path) {
        window.history.pushState({}, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    },
    navigateMobile(path: string) {
      this.mobileMenuOpen = false;
      this.navigate(path);
    },
    goBack() {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/';
      }
    },
    isActive(path: string): boolean {
      if (path === '/') {
        return this.currentPath === '/' || this.currentPath === '';
      }
      return this.currentPath.startsWith(path);
    },
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    },
    updateCurrentPath() {
      this.currentPath = window.location.pathname;
    },
  },
});
</script>

<style scoped>
/* Wrapper to hold both nav and overlay as siblings */
.tfm-navbar-wrapper {
  position: sticky;
  top: 0;
  z-index: 100;
}

.tfm-navbar {
  background: rgba(10, 14, 26, 0.88);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(38, 48, 80, 0.6);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(226, 82, 14, 0.08);
}

.tfm-navbar__inner {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 52px;
  gap: 12px;
}

/* Left section */
.tfm-navbar__left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.tfm-navbar__back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid rgba(38, 48, 80, 0.7);
  background: rgba(26, 37, 64, 0.5);
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
}
.tfm-navbar__back:hover {
  border-color: rgba(226, 82, 14, 0.5);
  color: #f1f5f9;
  background: rgba(226, 82, 14, 0.1);
  box-shadow: 0 0 10px rgba(226, 82, 14, 0.15);
}

.tfm-navbar__brand {
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
}

.tfm-navbar__brand-text {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  background: linear-gradient(135deg, #e2520e, #f97316, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tfm-navbar__brand-dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #2dd4bf;
  box-shadow: 0 0 6px rgba(45, 212, 191, 0.6);
  animation: navDotPulse 3s ease-in-out infinite;
}

@keyframes navDotPulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 6px rgba(45, 212, 191, 0.6); }
  50% { opacity: 0.4; box-shadow: 0 0 2px rgba(45, 212, 191, 0.3); }
}

/* Center navigation links */
.tfm-navbar__links {
  display: flex;
  align-items: center;
  gap: 2px;
}

.tfm-navbar__link {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
  transition: all 0.2s ease;
  position: relative;
  white-space: nowrap;
}

.tfm-navbar__link:hover {
  color: #f1f5f9;
  background: rgba(26, 37, 64, 0.6);
}

.tfm-navbar__link--active {
  color: #f1f5f9;
  background: rgba(226, 82, 14, 0.1);
}

.tfm-navbar__link--active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: linear-gradient(to right, transparent, #e2520e, transparent);
  border-radius: 1px;
}

.tfm-navbar__link-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  opacity: 0.7;
}

.tfm-navbar__link--active .tfm-navbar__link-icon {
  opacity: 1;
  color: #e2520e;
}

/* Right section */
.tfm-navbar__right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.tfm-navbar__user {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  padding: 4px 10px 4px 4px;
  border-radius: 20px;
  border: 1px solid rgba(38, 48, 80, 0.5);
  background: rgba(26, 37, 64, 0.4);
  transition: all 0.2s ease;
}

.tfm-navbar__user:hover {
  border-color: rgba(34, 211, 238, 0.3);
  background: rgba(26, 37, 64, 0.6);
}

.tfm-navbar__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e2520e, #f97316);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.tfm-navbar__username {
  font-size: 12px;
  font-weight: 600;
  color: #cbd5e1;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tfm-navbar__login {
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #22d3ee;
  text-decoration: none;
  border: 1px solid rgba(34, 211, 238, 0.3);
  border-radius: 4px;
  transition: all 0.2s ease;
}

.tfm-navbar__login:hover {
  background: rgba(34, 211, 238, 0.1);
  border-color: rgba(34, 211, 238, 0.5);
  box-shadow: 0 0 12px rgba(34, 211, 238, 0.15);
}

/* ============ Hamburger button (hidden on desktop) ============ */
.tfm-navbar__hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  border: 1px solid rgba(38, 48, 80, 0.7);
  background: rgba(26, 37, 64, 0.5);
  border-radius: 6px;
  cursor: pointer;
  gap: 4px;
  padding: 0;
  transition: all 0.2s ease;
}

.tfm-navbar__hamburger span {
  display: block;
  width: 18px;
  height: 2px;
  background: #94a3b8;
  border-radius: 1px;
  transition: all 0.3s ease;
}

.tfm-navbar__hamburger:hover {
  border-color: rgba(226, 82, 14, 0.5);
}
.tfm-navbar__hamburger:hover span {
  background: #f1f5f9;
}

.tfm-navbar__hamburger--open span:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}
.tfm-navbar__hamburger--open span:nth-child(2) {
  opacity: 0;
}
.tfm-navbar__hamburger--open span:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

/* ============ Mobile overlay modal ============ */
.tfm-navbar__overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.tfm-navbar__modal {
  width: 100%;
  max-width: 340px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  background: linear-gradient(180deg, rgba(10, 14, 26, 0.98) 0%, rgba(17, 26, 46, 0.98) 100%);
  border: 1px solid rgba(38, 48, 80, 0.7);
  border-radius: 8px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.7), 0 0 40px rgba(226, 82, 14, 0.06);
}

/* Modal header */
.tfm-navbar__modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(38, 48, 80, 0.5);
}

.tfm-navbar__modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid rgba(38, 48, 80, 0.5);
  background: rgba(26, 37, 64, 0.4);
  border-radius: 6px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
}
.tfm-navbar__modal-close:hover {
  border-color: rgba(226, 82, 14, 0.5);
  color: #f1f5f9;
  background: rgba(226, 82, 14, 0.1);
}

/* Modal navigation links */
.tfm-navbar__modal-links {
  padding: 8px 0;
}

.tfm-navbar__modal-link {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 24px;
  text-decoration: none;
  font-size: 15px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #94a3b8;
  transition: all 0.2s ease;
  position: relative;
}

.tfm-navbar__modal-link:hover {
  color: #f1f5f9;
  background: rgba(26, 37, 64, 0.6);
}

.tfm-navbar__modal-link--active {
  color: #f1f5f9;
  background: rgba(226, 82, 14, 0.08);
}

.tfm-navbar__modal-link--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background: linear-gradient(to bottom, transparent, #e2520e, transparent);
  border-radius: 0 2px 2px 0;
}

.tfm-navbar__modal-link-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 18px;
  opacity: 0.7;
}

.tfm-navbar__modal-link--active .tfm-navbar__modal-link-icon {
  opacity: 1;
  color: #e2520e;
}

/* Modal footer / user section */
.tfm-navbar__modal-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(38, 48, 80, 0.5);
}

.tfm-navbar__modal-user {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(38, 48, 80, 0.5);
  background: rgba(26, 37, 64, 0.3);
  transition: all 0.2s ease;
}

.tfm-navbar__modal-user:hover {
  border-color: rgba(34, 211, 238, 0.3);
  background: rgba(26, 37, 64, 0.5);
}

.tfm-navbar__modal-user-name {
  font-size: 14px;
  font-weight: 600;
  color: #cbd5e1;
}

.tfm-navbar__modal-signin {
  display: block;
  width: 100%;
  padding: 10px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #22d3ee;
  text-decoration: none;
  border: 1px solid rgba(34, 211, 238, 0.3);
  border-radius: 4px;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.tfm-navbar__modal-signin:hover {
  background: rgba(34, 211, 238, 0.1);
  border-color: rgba(34, 211, 238, 0.5);
}

/* Overlay transition */
.tfm-overlay-enter-active,
.tfm-overlay-leave-active {
  transition: opacity 0.3s ease;
}
.tfm-overlay-enter-active .tfm-navbar__modal,
.tfm-overlay-leave-active .tfm-navbar__modal {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.tfm-overlay-enter,
.tfm-overlay-leave-to {
  opacity: 0;
}
.tfm-overlay-enter .tfm-navbar__modal,
.tfm-overlay-leave-to .tfm-navbar__modal {
  transform: scale(0.9);
  opacity: 0;
}

/* ============ Responsive: Mobile (<=640px) ============ */
@media (max-width: 640px) {
  .tfm-navbar__inner {
    padding: 0 12px;
    height: 48px;
  }

  .tfm-navbar__links {
    display: none;
  }

  .tfm-navbar__hamburger {
    display: flex;
  }

  .tfm-navbar__username {
    display: none;
  }

  .tfm-navbar__user {
    padding: 2px;
    border-radius: 50%;
    border-color: transparent;
    background: transparent;
  }

  .tfm-navbar__brand-text {
    font-size: 13px;
  }
}

/* ============ Responsive: Tablet (641px - 768px) ============ */
@media (min-width: 641px) and (max-width: 768px) {
  .tfm-navbar__inner {
    padding: 0 12px;
    height: 48px;
  }

  .tfm-navbar__link-label {
    display: none;
  }

  .tfm-navbar__link-icon {
    width: 18px;
    height: 18px;
  }

  .tfm-navbar__link {
    padding: 8px 10px;
  }

  .tfm-navbar__username {
    display: none;
  }

  .tfm-navbar__brand-text {
    font-size: 13px;
  }
}
</style>
