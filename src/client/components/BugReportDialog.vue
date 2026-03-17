<template>
  <dialog ref="dialog" class="bug-dialog">
    <div class="bug-dialog__container">
      <div class="bug-dialog__content">
        <p class="bug-dialog__message">
          <span v-i18n>Copy the text below and then paste it in</span>
          <br>
          <a href="https://github.com/terraforming-mars/terraforming-mars/issues/new?template=from-heroku.md" target="_blank" v-i18n class="bug-dialog__link">a GitHub issue</a>
          <span v-i18n>or</span>
          <a href="https://discord.com/channels/737945098695999559/742721510376210583" target="_blank" v-i18n class="bug-dialog__link">#bug-reports Discord channel</a>
        </p>
        <textarea ref="textarea" readonly rows="6" v-model="message" class="bug-dialog__textarea"></textarea>
      </div>

      <div class="bug-dialog__actions">
        <button class="bug-dialog__button bug-dialog__button--primary" @click="copyTextArea" v-i18n>Copy to Clipboard</button>
        <div :class="{ 'bug-dialog__copied': true, 'bug-dialog__copied--hidden': !showCopied }" v-i18n>Copied!</div>
      </div>
      <form method="dialog" class="bug-dialog__close">
        <button class="bug-dialog__button bug-dialog__button--secondary" v-i18n>Close</button>
      </form>
    </div>
  </dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import {WithRefs} from 'vue-typed-refs';
import {showModal, windowHasHTMLDialogElement} from '@/client/components/HTMLDialogElementCompatibility';
import raw_settings from '@/genfiles/settings.json';
import {vueRoot} from '@/client/components/vueRoot';
import {PlayerViewModel} from '@/common/models/PlayerModel';
import {SpectatorId} from '@/common/Types';
import {getPreferences} from '../utils/PreferencesManager';

import dialogPolyfill from 'dialog-polyfill';

type Refs = {
  dialog: HTMLElement,
  textarea: HTMLTextAreaElement,
}

function browser(): string {
  // Taken from https://stackoverflow.com/questions/5916900/how-can-you-detect-the-version-of-a-browser
  const ua= navigator.userAgent;
  let match = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(match[1])) {
    const temp = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return 'IE '+(temp[1] || '');
  }
  if (match[1]=== 'Chrome') {
    const temp = ua.match(/\b(OPR|Edge)\/(\d+)/);
    if (temp !== null) return temp.slice(1).join(' ').replace('OPR', 'Opera');
  }
  match = match[2] ? [match[1], match[2]] : [navigator.appName, navigator.appVersion, '-?'];
  const temp = ua.match(/version\/(\d+)/i);
  if (temp !== null) match.splice(1, 1, temp[1]);
  return match.join(' ');
}

export default (Vue as WithRefs<Refs>).extend({
  name: 'BugReportDialog',
  data() {
    return {
      message: '',
      showCopied: false,
    };
  },
  methods: {
    show() {
      showModal(this.$refs.dialog);
    },
    copyTextArea() {
      this.$refs.textarea.select();
      navigator.clipboard.writeText(this.$refs.textarea.value);
      this.showCopied = true;
    },
    url(playerView: PlayerViewModel | undefined) {
      const url = new URL(window.location.href);
      const spectatorId: SpectatorId | undefined = playerView?.game?.spectatorId;
      if (spectatorId && url.pathname === '/player' && url.searchParams.has('id')) {
        url.searchParams.set('id', spectatorId);
        url.pathname = '/spectator';
      }
      return url;
    },
    setMessage() {
      const playerView = vueRoot(this).playerView;
      const content = {
        url: this.url(playerView),
        color: playerView?.thisPlayer.color,
        step: playerView?.game.step,
        version: raw_settings.head,
        builtAt: raw_settings.builtAt,
        browser: browser(),
        language: getPreferences().lang,
        experimental_ui: getPreferences().experimental_ui,
      };
      this.message = JSON.stringify(content, null, 2);
    },
  },
  mounted() {
    if (!windowHasHTMLDialogElement()) dialogPolyfill.default.registerDialog(this.$refs.dialog);
    this.setMessage();
  },
});
</script>

<style scoped>
.bug-dialog {
  width: min(600px, 90vw);
  margin: auto;
  border: 1px solid #263050;
  border-radius: 8px;
  background: #111a2e;
  color: #f1f5f9;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.03);
  padding: 0;
}

.bug-dialog::backdrop {
  background: rgba(10, 14, 26, 0.85);
  backdrop-filter: blur(8px);
}

.bug-dialog__container {
  padding: 24px;
}

.bug-dialog__content {
  margin-bottom: 20px;
}

.bug-dialog__message {
  margin: 0 0 16px 0;
  color: #cbd5e1;
  font-size: 14px;
  line-height: 1.6;
  font-family: 'Ubuntu', sans-serif;
}

.bug-dialog__link {
  color: #22d3ee;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.bug-dialog__link:hover {
  color: #e2520e;
  text-decoration: underline;
}

.bug-dialog__textarea {
  width: 100%;
  min-height: 120px;
  background: #0a0e1a;
  border: 1px solid #263050;
  border-radius: 4px;
  padding: 12px;
  color: #cbd5e1;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
  resize: vertical;
}

.bug-dialog__textarea:focus {
  outline: none;
  border-color: rgba(226, 82, 14, 0.5);
  box-shadow: 0 0 0 3px rgba(226, 82, 14, 0.1);
}

.bug-dialog__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0;
}

.bug-dialog__close {
  margin: 0;
  padding: 0;
  border: none;
  background: none;
}

.bug-dialog__button {
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Ubuntu', sans-serif;
  border: none;
  position: relative;
}

.bug-dialog__button--primary {
  background: linear-gradient(135deg, #22d3ee 0%, #2dd4bf 100%);
  color: #0a0e1a;
  clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
  box-shadow: 0 0 12px rgba(34, 211, 238, 0.4);
}

.bug-dialog__button--primary:hover {
  background: linear-gradient(135deg, #2dd4bf 0%, #34d399 100%);
  box-shadow: 0 0 20px rgba(34, 211, 238, 0.6);
  transform: translateY(-2px);
}

.bug-dialog__button--primary:active {
  transform: translateY(0);
  box-shadow: 0 0 8px rgba(34, 211, 238, 0.3);
}

.bug-dialog__button--secondary {
  background: #1a2540;
  color: #cbd5e1;
  border: 1px solid #263050;
}

.bug-dialog__button--secondary:hover {
  background: #263050;
  color: #f1f5f9;
  border-color: rgba(226, 82, 14, 0.4);
}

.bug-dialog__copied {
  color: #2dd4bf;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.bug-dialog__copied--hidden {
  opacity: 0;
  transform: translateY(-10px);
}
</style>


