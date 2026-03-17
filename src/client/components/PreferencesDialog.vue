<template>
    <dialog ref="dialog" class="preferences-dialog">
      <div class="preferences-dialog__container">
        <button class="preferences-dialog__close" @click="closeDialog" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div class="preferences-panel__item">
          <label class="preferences-panel__switch">
            <input type="checkbox" v-on:change="updatePreferences" v-model="prefs.hide_awards_and_milestones" data-test="hide_awards_and_milestones">
            <div class="preferences-panel__switch-ui">
              <i class="preferences-panel__icon"></i>
              <span v-i18n>Hide awards and milestones</span>
            </div>
          </label>
        </div>
        <div class="preferences-panel__item">
          <label class="preferences-panel__switch">
            <input type="checkbox" v-on:change="updatePreferences" v-model="prefs.small_cards" data-test="small_cards">
            <div class="preferences-panel__switch-ui">
              <i class="preferences-panel__icon"></i>
              <span v-i18n>Smaller cards</span>
            </div>
          </label>
        </div>
        <div class="preferences-panel__item">
          <label class="preferences-panel__switch">
            <input type="checkbox" v-on:change="updatePreferences" v-model="prefs.magnify_cards" data-test="magnify_cards">
            <div class="preferences-panel__switch-ui">
              <i class="preferences-panel__icon"></i>
              <span v-i18n>Magnify cards on hover</span>
            </div>
          </label>
        </div>
        <div class="preferences-panel__item">
          <label class="preferences-panel__switch">
            <input type="checkbox" v-on:change="updatePreferences" v-model="prefs.hide_discount_on_cards" data-test="hide_discount_on_cards">
            <div class="preferences-panel__switch-ui">
              <i class="preferences-panel__icon"></i>
              <span v-i18n>Hide discount on cards</span>
            </div>
          </label>
        </div>
        <div class="preferences-panel__item">
          <label class="preferences-panel__switch">
            <input type="checkbox" v-on:change="updatePreferences" v-model="prefs.remove_background" data-test="remove_background">
            <div class="preferences-panel__switch-ui">
              <i class="preferences-panel__icon"></i>
              <span v-i18n>Remove background image</span>
            </div>
          </label>
        </div>
        <div class="preferences-panel__item">
          <label class="preferences-panel__switch">
            <input type="checkbox" v-on:change="updatePreferences" v-model="prefs.show_alerts" data-test="show_alerts">
            <div class="preferences-panel__switch-ui">
              <i class="preferences-panel__icon"></i>
              <span v-i18n>Show in-game alerts</span>
            </div>
          </label>
        </div>
        <div class="preferences-panel__item">
          <label class="preferences-panel__switch">
            <input type="checkbox" v-on:change="updatePreferences" v-model="prefs.enable_sounds" data-test="enable_sounds">
            <div class="preferences-panel__switch-ui">
              <i class="preferences-panel__icon"></i>
              <span v-i18n>Enable sounds</span>
            </div>
          </label>
        </div>
        <div class="preferences-panel__item">
          <label class="preferences-panel__switch">
            <input type="checkbox" v-on:change="updatePreferences" v-model="prefs.hide_animated_sidebar" data-test="hide_animated_sidebar">
            <div class="preferences-panel__switch-ui">
              <i class="preferences-panel__icon"></i>
              <span v-i18n>Hide sidebar notification</span>
            </div>
          </label>
        </div>
        <div class="preferences-panel__item">
          <label class="preferences-panel__switch">
            <input type="checkbox" v-on:change="updatePreferences" v-model="prefs.hide_tile_confirmation" data-test="hide_tile_confirmation">
            <div class="preferences-panel__switch-ui">
              <i class="preferences-panel__icon"></i>
              <span v-i18n>Hide tile confirmation</span>
            </div>
          </label>
        </div>
        <div class="preferences-panel__item">
          <label class="preferences-panel__switch">
            <input type="checkbox" v-on:change="updatePreferences" v-model="prefs.learner_mode" data-test="learner_mode">
            <div class="preferences-panel__switch-ui">
              <i class="preferences-panel__icon"></i>
              <span v-i18n>Learner Mode (req. refresh)</span>
              <span class="preferences-panel__tooltip" :data-tooltip="$t('Show information that can be helpful\n to players who are still learning games')">&#9432;</span>
            </div>
          </label>
        </div>
        <div class="preferences-panel__item">
          <label class="preferences-panel__switch">
            <input type="checkbox" v-on:change="updatePreferences" v-model="prefs.symbol_overlay" data-test="symbol_overlay">
            <div class="preferences-panel__switch-ui">
              <i class="preferences-panel__icon"></i>
              <span v-i18n>Symbol Overlay</span>
              <span class="preferences-panel__tooltip" :data-tooltip="$t('Add symbols on top of player colors.')">&#9432;</span>
            </div>
          </label>
        </div>
        <div class="preferences-panel__item">
          <label class="preferences-panel__switch">
            <input type="checkbox" v-on:change="updatePreferences" v-model="prefs.experimental_ui" data-test="experimental_ui">
            <div class="preferences-panel__switch-ui">
              <i class="preferences-panel__icon"></i>
              <span v-i18n>Experimental UI</span>
              <span class="preferences-panel__tooltip" :data-tooltip="$t('Test out any possible new experimental UI features for feedback.')">&#9432;</span>
            </div>
          </label>
        </div>
        <div class="preferences-panel__item">
          <label class="preferences-panel__switch">
            <input type="checkbox" v-on:change="updatePreferences" v-model="prefs.debug_view" data-test="debug_view">
            <div class="preferences-panel__switch-ui">
              <i class="preferences-panel__icon"></i>
              <span v-i18n>Debug View</span>
              <span class="preferences-panel__tooltip" :data-tooltip="$t('Add information useful for development and debugging.')">&#9432;</span>
            </div>
          </label>
        </div>
        <div class="preferences-panel__actions">
          <button class="preferences-panel__button preferences-panel__button--primary" v-on:click="okClicked" v-i18n>Save</button>
        </div>
        <bug-report-dialog ref="bugDialog"></bug-report-dialog>
      </div>
    </dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import {WithRefs} from 'vue-typed-refs';
import {showModal, windowHasHTMLDialogElement} from '@/client/components/HTMLDialogElementCompatibility';

import dialogPolyfill from 'dialog-polyfill';

import {getPreferences, PreferencesManager, Preference} from '@/client/utils/PreferencesManager';
import BugReportDialog from '@/client/components/BugReportDialog.vue';

type Refs = {
  dialog: HTMLElement,
  bugDialog: InstanceType<typeof BugReportDialog>,
}

export default (Vue as WithRefs<Refs>).extend({
  name: 'PreferencesDialog',
  components: {
    'bug-report-dialog': BugReportDialog,
  },
  props: {
    preferencesManager: {
      type: Object as () => PreferencesManager,
    },
  },
  data() {
    return {
      prefs: {...this.preferencesManager.values()},
    };
  },
  methods: {
    setBoolPreferencesCSS(
      target: HTMLElement,
      val: boolean | string,
      name: Preference,
    ): void {
      const cssClassSuffix = name;
      if (typeof val === 'string') {
        return;
      }
      if (val) {
        target.classList.add('preferences_' + cssClassSuffix);
      } else {
        target.classList.remove('preferences_' + cssClassSuffix);
      }
    },
    updatePreferences(): void {
      for (const k of Object.keys(this.preferencesManager.values()) as Array<Preference>) {
        const val = this.prefs[k];
        this.preferencesManager.set(k, val, /* setOnChange */ true);
      }
    },
    syncPreferences(): void {
      const target = document.getElementById('ts-preferences-target');
      if (!target) return;

      for (const k of Object.keys(this.prefs) as Array<Preference>) {
        if (k === 'lang') continue;
        this.setBoolPreferencesCSS(target, this.prefs[k], k);
      }

      if (!target.classList.contains('language-' + this.prefs.lang)) {
        target.classList.add('language-' + this.prefs.lang);
      }
    },
    okClicked(): void {
      this.$emit('okButtonClicked');
    },
    closeDialog(): void {
      (this.$refs.dialog as HTMLDialogElement).close();
    },
    show() {
      showModal(this.$refs.dialog);
    },
  },
  computed: {
    getPreferences(): typeof getPreferences {
      return getPreferences;
    },
  },
});
</script>

<style scoped>
.preferences-dialog {
  width: min(520px, 90vw);
  margin: auto;
  border: 1px solid #263050;
  border-radius: 8px;
  background: #111a2e;
  color: #f1f5f9;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.03);
  padding: 0;
  max-height: 85vh;
}

.preferences-dialog::backdrop {
  background: rgba(10, 14, 26, 0.85);
  backdrop-filter: blur(8px);
}

.preferences-dialog__container {
  padding: 20px;
  padding-top: 48px;
  overflow-y: auto;
  position: relative;
}

.preferences-dialog__close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 1;
}

.preferences-dialog__close:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.preferences-panel__item {
  margin-bottom: 12px;
}

.preferences-panel__switch {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 12px 16px;
  background: #1a2540;
  border: 1px solid #263050;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.preferences-panel__switch:hover {
  background: #263050;
  transform: translateX(2px);
}

.preferences-panel__switch input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  width: 0;
  height: 0;
  position: absolute;
  opacity: 0;
}

.preferences-panel__switch-ui {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #cbd5e1;
  font-size: 14px;
  font-family: 'Ubuntu', sans-serif;
}

.preferences-panel__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  min-width: 20px;
  border-radius: 4px;
  background: rgba(34, 211, 238, 0.1);
  border: 1px solid rgba(34, 211, 238, 0.3);
  color: #22d3ee;
  font-size: 10px;
  transition: all 0.2s ease;
}

.preferences-panel__icon::after {
  content: '';
  width: 6px;
  height: 10px;
  border: solid currentColor;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) scale(0);
  transition: all 0.2s ease;
}

.preferences-panel__switch:hover .preferences-panel__icon {
  background: rgba(226, 82, 14, 0.15);
  border-color: rgba(226, 82, 14, 0.4);
  color: #f97316;
}

.preferences-panel__tooltip {
  color: #94a3b8;
  font-size: 12px;
  margin-left: auto;
  padding-left: 8px;
  border-left: 1px solid rgba(38, 48, 80, 0.3);
  display: flex;
  align-items: center;
  gap: 4px;
}

.preferences-panel__footer {
  padding: 20px 0 0 0 0;
}

.preferences-panel__actions {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.preferences-panel__button {
  padding: 12px 32px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Ubuntu', sans-serif;
  border: none;
  width: 100%;
}

.preferences-panel__button--primary {
  background: linear-gradient(135deg, #e2520e 0%, #f97316 100%);
  color: #ffffff;
  clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
  box-shadow: 0 0 12px rgba(226, 82, 14, 0.4);
}

.preferences-panel__button--primary:hover {
  background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
  box-shadow: 0 0 20px rgba(226, 82, 14, 0.6);
  transform: translateY(-2px);
}

.preferences-panel__button--primary:active {
  transform: translateY(0);
  box-shadow: 0 0 8px rgba(226, 82, 14, 0.3);
}

/* Check indicator styles */
.preferences-panel__switch input[type="checkbox"]:checked + .preferences-panel__switch-ui .preferences-panel__icon {
  background: rgba(226, 82, 14, 0.2);
  border-color: #e2520e;
  color: #e2520e;
}

.preferences-panel__switch input[type="checkbox"]:checked + .preferences-panel__switch-ui .preferences-panel__icon::after {
  transform: rotate(45deg) scale(1);
}

.preferences-panel__switch input[type="checkbox"]:checked + .preferences-panel__switch-ui span {
  color: #f1f5f9;
}
</style>


