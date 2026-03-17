<template>
  <dialog ref="dialog" class="confirm-dialog">
    <div class="confirm-dialog__container">
      <p class="confirm-dialog__message" v-i18n>{{ message }}</p>
      <label v-if="enableDontShowAgainCheckbox" class="confirm-dialog__checkbox">
        <input type="checkbox" v-model="hide" />
        <span v-i18n>Don't show this again</span>
      </label>
      <menu class="confirm-dialog__actions">
        <button class="confirm-dialog__button confirm-dialog__button--primary" v-on:click="accept()" v-i18n>Yes</button>
        <button class="confirm-dialog__button confirm-dialog__button--secondary" v-on:click="dismiss()" v-i18n>No</button>
      </menu>
    </div>
  </dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import {WithRefs} from 'vue-typed-refs';
import {showModal, windowHasHTMLDialogElement} from '@/client/components/HTMLDialogElementCompatibility';

import dialogPolyfill from 'dialog-polyfill';

type Refs = {
  dialog: HTMLElement,
}

export default (Vue as WithRefs<Refs>).extend({
  name: 'ConfirmDialog',
  props: {
    message: {
      type: String,
    },
    enableDontShowAgainCheckbox: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      hide: false,
      shown: false,
    };
  },
  watch: {
    hide() {
      this.$emit('hide', this.hide);
    },
  },
  methods: {
    accept() {
      this.$emit('accept');
    },
    dismiss() {
      this.$emit('dismiss');
    },
    show() {
      this.shown = true;
      showModal(this.$refs.dialog);
    },
  },
  mounted() {
    if (!windowHasHTMLDialogElement()) dialogPolyfill.default.registerDialog(this.$refs.dialog);
  },
});
</script>

<style scoped>
.confirm-dialog {
  width: min(480px, 90vw);
  margin: auto;
  border: 1px solid #263050;
  border-radius: 8px;
  background: #111a2e;
  color: #f1f5f9;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.03);
  padding: 0;
}

.confirm-dialog::backdrop {
  background: rgba(10, 14, 26, 0.85);
  backdrop-filter: blur(8px);
}

.confirm-dialog__container {
  padding: 24px;
}

.confirm-dialog__message {
  margin: 0 0 16px 0;
  color: #f1f5f9;
  font-size: 16px;
  line-height: 1.6;
  text-align: center;
  white-space: pre-wrap;
}

.confirm-dialog__checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
  color: #94a3b8;
  font-size: 13px;
  cursor: pointer;
}

.confirm-dialog__checkbox input[type="checkbox"] {
  accent-color: #e2520e;
  cursor: pointer;
}

.confirm-dialog__actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 0;
  margin: 0;
}

.confirm-dialog__button {
  flex: 1;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Ubuntu', sans-serif;
  border: none;
  position: relative;
}

.confirm-dialog__button--primary {
  background: linear-gradient(135deg, #e2520e 0%, #f97316 100%);
  color: #ffffff;
  clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
  box-shadow: 0 0 12px rgba(226, 82, 14, 0.4);
}

.confirm-dialog__button--primary:hover {
  background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
  box-shadow: 0 0 20px rgba(226, 82, 14, 0.6);
  transform: translateY(-1px);
}

.confirm-dialog__button--primary:active {
  transform: translateY(0);
  box-shadow: 0 0 8px rgba(226, 82, 14, 0.3);
}

.confirm-dialog__button--secondary {
  background: #1a2540;
  color: #cbd5e1;
  border: 1px solid #263050;
}

.confirm-dialog__button--secondary:hover {
  background: #263050;
  color: #f1f5f9;
  border-color: #e2520e40;
}

.newlines {
  white-space: pre-wrap;
}
</style>

