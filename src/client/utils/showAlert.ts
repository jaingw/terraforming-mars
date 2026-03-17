/*
 * @Author: Ender-Wiggin
 * @Date: 2026-02-12 11:28:08
 * @LastEditors: Ender-Wiggin
 * @LastEditTime: 2026-02-12 12:16:09
 * @Description:
 */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {$t} from '@/client/directives/i18n';

let alertDialogElement: HTMLDialogElement | null = null;
let messageElement: HTMLElement | null = null;
let buttonElement: HTMLElement | null = null;
let titleElement: HTMLElement | null = null;

function initElements(): boolean {
  if (alertDialogElement) return true;
  alertDialogElement = document.getElementById('alert-dialog') as HTMLDialogElement;
  messageElement = document.getElementById('alert-dialog-message');
  buttonElement = document.getElementById('alert-dialog-button');
  titleElement = document.querySelector('.alert-dialog__title');
  return alertDialogElement !== null && messageElement !== null && buttonElement !== null;
}

function hasShowModal(el: HTMLElement): boolean {
  return typeof (el as any).showModal === 'function';
}

export interface ShowAlertOptions {
  title?: string;
  type?: 'error' | 'warning' | 'info' | 'success';
}

export function showAlert(
  message: string,
  options?: ShowAlertOptions,
): Promise<void>;
export function showAlert(
  message: string,
  callback?: () => void,
): void;
export function showAlert(
  message: string,
  options?: ShowAlertOptions | (() => void),
): Promise<void> | void {
  const isCallback = typeof options === 'function';
  const callback = isCallback ? options : undefined;
  const opts: ShowAlertOptions = isCallback ? {} : (options || {});

  return new Promise((resolve) => {
    const done = () => {
      if (callback) callback();
      resolve();
    };

    if (!initElements() || !hasShowModal(alertDialogElement!)) {
      alert($t(message));
      done();
      return;
    }

    messageElement!.innerHTML = $t(message);

    if (titleElement) {
      if (opts.title) {
        titleElement.innerHTML = $t(opts.title);
        titleElement.style.display = '';
      } else {
        titleElement.style.display = 'none';
      }
    }

    alertDialogElement!.className = 'alert-dialog';
    if (opts.type) {
      alertDialogElement!.classList.add(`alert-dialog--${opts.type}`);
    }

    const handler = () => {
      buttonElement!.removeEventListener('click', handler);
      alertDialogElement!.close();
      done();
    };
    buttonElement!.addEventListener('click', handler);
    alertDialogElement!.showModal();
  });
}

export function showError(message: string): Promise<void> {
  return showAlert(message, {type: 'error', title: 'Error'});
}

export function showWarning(message: string): Promise<void> {
  return showAlert(message, {type: 'warning', title: 'Warning'});
}

export function showInfo(message: string): Promise<void> {
  return showAlert(message, {type: 'info', title: 'Info'});
}

export function showSuccess(message: string): Promise<void> {
  return showAlert(message, {type: 'success', title: 'Success'});
}
