import Vue from 'vue';
import {PreferencesManager} from '@/client/utils/PreferencesManager';

interface UserState {
  userId: string;
  userName: string;
  isVip: boolean;
  vipUpdate: string;
}

class UserStore {
  private state: UserState;
  private listeners: Array<(state: UserState) => void> = [];

  constructor() {
    this.state = {
      userId: PreferencesManager.load('userId'),
      userName: PreferencesManager.load('userName'),
      isVip: PreferencesManager.load('vip') === 'true',
      vipUpdate: PreferencesManager.load('vipupdate'),
    };
  }

  getState(): Readonly<UserState> {
    return this.state;
  }

  get userId(): string {
    return this.state.userId;
  }

  get userName(): string {
    return this.state.userName;
  }

  get isVip(): boolean {
    return this.state.isVip;
  }

  get isLoggedIn(): boolean {
    return this.state.userId !== '' && this.state.userName !== '';
  }

  get avatarLetter(): string {
    return this.state.userName ? this.state.userName.charAt(0).toUpperCase() : '?';
  }

  setUser(userId: string, userName: string): void {
    this.state = {...this.state, userId, userName};
    PreferencesManager.INSTANCE.set('userId', userId);
    PreferencesManager.INSTANCE.set('userName', userName);
    this.notify();
  }

  setVip(isVip: boolean, vipUpdate?: string): void {
    this.state = {...this.state, isVip, vipUpdate: vipUpdate ?? this.state.vipUpdate};
    PreferencesManager.INSTANCE.set('vip', isVip);
    if (vipUpdate) {
      PreferencesManager.INSTANCE.set('vipupdate', vipUpdate);
    }
    this.notify();
  }

  logout(): void {
    this.state = {
      userId: '',
      userName: '',
      isVip: false,
      vipUpdate: '',
    };
    PreferencesManager.loginOut();
    this.notify();
  }

  subscribe(listener: (state: UserState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }
}

export const userStore = new UserStore();
export type {UserState};
