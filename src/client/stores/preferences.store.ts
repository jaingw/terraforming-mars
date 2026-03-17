import {PreferencesManager, getPreferences, Preferences, Preference} from '@/client/utils/PreferencesManager';

type PreferenceChangeCallback = (key: Preference, value: any) => void;

class PreferencesStore {
  private listeners: Array<PreferenceChangeCallback> = [];

  get<K extends Preference>(key: K): Preferences[K] {
    return getPreferences()[key];
  }

  getAll(): Readonly<Preferences> {
    return getPreferences();
  }

  set<K extends Preference>(key: K, value: Preferences[K]): void {
    PreferencesManager.INSTANCE.set(key, value as any);
    this.notify(key, value);
  }

  subscribe(listener: PreferenceChangeCallback): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notify(key: Preference, value: any): void {
    this.listeners.forEach((listener) => listener(key, value));
  }
}

export const preferencesStore = new PreferencesStore();
