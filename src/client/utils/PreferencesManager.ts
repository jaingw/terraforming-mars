export interface IPreferences {
  learner_mode: boolean,
  enable_sounds: boolean,
  magnify_cards: boolean,
  show_alerts: boolean,
  hide_hand: boolean,
  hide_awards_and_milestones: boolean,
  hide_top_bar: boolean,
  small_cards: boolean,
  remove_background: boolean,
  hide_active_cards: boolean,
  hide_automated_cards: boolean,
  hide_event_cards: boolean,
  hide_tile_confirmation: boolean,
  hide_discount_on_cards: boolean,
  hide_animated_sidebar: boolean,
  experimental_ui: boolean,
  lang: string,
  donateupdate : string,
  userId : string,
  vipupdate: string,
  vip: boolean,
  userName: string,
  input: string,
  lastcreated: string,
}

export type Preference = keyof IPreferences;

const defaults: IPreferences = {
  learner_mode: true,
  enable_sounds: true,
  magnify_cards: true,
  show_alerts: true,
  lang: 'cn',

  hide_hand: false,
  hide_awards_and_milestones: false,
  hide_top_bar: false,
  small_cards: false,
  remove_background: false,
  hide_active_cards: false,
  hide_automated_cards: false,
  hide_event_cards: false,
  hide_tile_confirmation: false,
  hide_discount_on_cards: false,
  hide_animated_sidebar: false,
  experimental_ui: false,

  donateupdate: '',
  userId: '',
  vipupdate: '',
  vip: false,
  userName: '',
  input: '',
  lastcreated: '',
};

export class PreferencesManager {
  public static INSTANCE = new PreferencesManager();
  private readonly _values: IPreferences;

  private localStorageSupported(): boolean {
    return typeof localStorage !== 'undefined';
  }


  public static resetForTest() {
    this.INSTANCE = new PreferencesManager();
  }

  private constructor() {
    this._values = {...defaults};
    for (const key of Object.keys(defaults) as Array<Preference>) {
      const value = this.localStorageSupported() ? localStorage.getItem(key) : undefined;
      if (value) this._set(key, value);
    }
  }

  // eslint-disable-next-line valid-jsdoc
  /**
   * userId
   * userName
   * enable_sounds
   * lastcreated  最后一次创建游戏的时间
   * input  exec输入
   * vip         是否vip
   * vipupdate   vip更新时间
   * donateupdate  赞助页面显示时间
   */
  static load(name: Preference, defaultValue = ''): string {
    return (PreferencesManager.INSTANCE.values()[name] ?? defaultValue).toString();
  }

  private _set(key: Preference, val: IPreferences[Preference] ) {
    if (typeof(this._values[key]) === 'string') {
      (this._values[key] as any) = String(val);
    } else {
      (this._values[key] as any) = typeof(val) === 'boolean' ? val : (val === '1');
    }
  }

  // Making this Readonly means that it's Typescript-impossible to
  // set preferences through the fields themselves.
  values(): Readonly<IPreferences> {
    return this._values;
  }

  set(name: Preference, val: string | boolean, setOnChange = false): void {
    // Don't set values if nothing has changed.
    if (setOnChange && this._values[name] === val) return;
    this._set(name, val);
    if (this.localStorageSupported()) {
      if (typeof(this._values[name]) === 'string') {
        localStorage?.setItem(name, val as string);
      } else {
        localStorage?.setItem(name, val ? '1' : '0');
      }
    }
  }

  static loginOut() {
    if ( ! PreferencesManager.INSTANCE.localStorageSupported()) return;
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('vip');
    localStorage.removeItem('vipupdate');
  }
}

export function getPreferences(): Readonly<IPreferences> {
  return PreferencesManager.INSTANCE.values();
}
