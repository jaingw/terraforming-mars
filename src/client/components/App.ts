import * as raw_settings from '@/genfiles/settings.json';
import {PlayerViewModel} from '@/common/models/PlayerModel';
import {SimpleGameModel} from '@/common/models/SimpleGameModel';
import {SpectatorModel} from '@/common/models/SpectatorModel';

export type Screen =
  'admin' |
  'cards' |
  'create-game-form' |
  'donate' |
  'empty' |
  'game-home' |
  'game-lobby' |
  'games-overview' |
  'help' |
  'load' |
  'login' |
  'me-page' |
  'player-home' |
  'ranks' |
  'register' |
  'reset-password' |
  'start-screen' |
  'the-end' |
  'user-profile' 
  ;

export interface MainAppData {
  screen: Screen;
  oscreen: Screen;
  userProfileId: string;
  spectator?: SpectatorModel;
  playerView?: PlayerViewModel;
  playerkey: number;
  settings: typeof raw_settings;
  isServerSideRequestInProgress: boolean;
  componentsVisibility: {[x: string]: boolean};
  game: SimpleGameModel | undefined;
  isvip: boolean;
  login: string | undefined;
}

export interface MainAppMethods {
  handleRouteChange(): void;
  showAlert(titleOrMessage: string, messageOrCb?: string | (() => void), cb?: () => void): void;
  setVisibilityState(targetVar: string, isVisible: boolean): void;
  getVisibilityState(targetVar: string): boolean;
  updatePlayer(): void;
  udpatevip(userId: string): void;
  showdonate(): void;
}

export interface MainAppSettings {
  data: MainAppData;
  methods: MainAppMethods;
}

const noop = () => {};

export const mainAppSettings: MainAppSettings = {
  data: {
    screen: 'empty',
    oscreen: 'empty',
    userProfileId: '',
    spectator: undefined,
    playerView: undefined,
    playerkey: 0,
    settings: raw_settings,
    isServerSideRequestInProgress: false,
    componentsVisibility: {
      'milestones': true,
      'awards_list': true,
      'tags_concise': false,
      'pinned_player_0': false,
      'pinned_player_1': false,
      'pinned_player_2': false,
      'pinned_player_3': false,
      'pinned_player_4': false,
      'turmoil_parties': false,
    },
    game: undefined,
    isvip: false,
    login: undefined,
  },
  methods: {
    handleRouteChange: noop,
    showAlert: noop,
    setVisibilityState: noop,
    getVisibilityState: () => false,
    updatePlayer: noop,
    udpatevip: noop,
    showdonate: noop,
  },
};
