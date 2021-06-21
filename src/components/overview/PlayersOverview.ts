import Vue from 'vue';
import {PlayerInfo} from './PlayerInfo';
import {OverviewSettings} from './OverviewSettings';
import {OtherPlayer} from '../OtherPlayer';
import {PlayerModel, PublicPlayerModel} from '../../models/PlayerModel';
import {ActionLabel} from './ActionLabel';
import {Phase} from '../../Phase';
import {Color} from '../../Color';

const SHOW_NEXT_LABEL_MIN = 2;

export const getCurrentPlayerIndex = (
  currentPlayerColor: Color,
  players: Array<PublicPlayerModel>,
): number => {
  let currentPlayerIndex: number = 0;
  players.forEach((p: PublicPlayerModel, index: number) => {
    if (p.color === currentPlayerColor) {
      currentPlayerIndex = index;
    }
  });
  return currentPlayerIndex;
};

export const PlayersOverview = Vue.component('players-overview', {
  props: {
    player: {
      type: Object as () => PlayerModel,
    },
  },
  components: {
    'player-info': PlayerInfo,
    'overview-settings': OverviewSettings,
    'other-player': OtherPlayer,
  },
  data: function() {
    return {};
  },
  methods: {
    hasPlayers: function(): boolean {
      return this.player.players.length > 0;
    },
    getPlayerOnFocus: function(): PublicPlayerModel {
      return this.player.players.filter(
        (p: PublicPlayerModel) => p.color === this.player.color,
      )[0];
    },
    getIsFirstForGen: function(player: PublicPlayerModel): boolean {
      return getCurrentPlayerIndex(player.color, this.player.players) === 0;
    },
    getPlayersInOrder: function(): Array<PublicPlayerModel> {
      const players = this.player.players;
      let result: Array<PublicPlayerModel> = [];
      let currentPlayerOffset: number = 0;
      const currentPlayerIndex: number = getCurrentPlayerIndex(
        this.player.color,
        this.player.players,
      );

      // shift the array by putting the player on focus at the tail
      currentPlayerOffset = currentPlayerIndex + 1;
      result = players
        .slice(currentPlayerOffset)
        .concat(players.slice(0, currentPlayerOffset));

      // return all but the focused user
      result = result.slice(0, -1);

      // 去除当前玩家之后，体退玩家放到最后一位
      return result.filter((p) => !p.exited).concat(result.filter((p) => p.exited));
    },
    getActionLabel(player: PublicPlayerModel): string {
      if (player.exited) {
        return ActionLabel.RESIGNED;
      }
      if (this.player.game.phase === Phase.DRAFTING) {
        if (player.waitingFor !== undefined) {
          return ActionLabel.DRAFTING;
        } else {
          return ActionLabel.NONE;
        }
      } else if (this.player.game.phase === Phase.RESEARCH) {
        if (player.waitingFor !== undefined) {
          return ActionLabel.RESEARCHING;
        } else {
          return ActionLabel.NONE;
        }
      }
      if (this.player.game.passedPlayers.includes(player.color)) {
        return ActionLabel.PASSED;
      }
      if (player.isActive) return ActionLabel.ACTIVE;
      const notPassedPlayers = this.player.players.filter(
        (p: PublicPlayerModel) => !this.player.game.passedPlayers.includes(p.color),
      );

      const currentPlayerIndex: number = getCurrentPlayerIndex(
        player.color,
        notPassedPlayers,
      );
      const prevPlayerIndex =
                currentPlayerIndex === 0 ?
                  notPassedPlayers.length - 1 :
                  currentPlayerIndex - 1;
      const isNext = notPassedPlayers[prevPlayerIndex].isActive;

      if (isNext && this.player.players.length > SHOW_NEXT_LABEL_MIN) {
        return ActionLabel.NEXT;
      }

      return ActionLabel.NONE;
    },
  },
  template: `
        <div class="players-overview" v-if="hasPlayers()">
            <div class="other_player" v-if="player.players.length > 1">
                <div v-for="(otherPlayer, index) in getPlayersInOrder()" :key="otherPlayer.id">
                    <other-player v-if="otherPlayer.id !== player.id || otherPlayer.color === player.color" :player="otherPlayer" :playerIndex="index"/>
                </div>
            </div>
            <template v-for="(p, index) in getPlayersInOrder()">
              <div v-if="p.corporationCard2"  class="player-info-top" >
                <div v-if="p.corporationCard !== undefined" :title="p.corporationCard.name"  class="player-corp-left"  :class="'player_translucent_bg_color_'+p.color" >{{p.corporationCard.name }}</div>
                <div :title="p.corporationCard2.name" class="player-corp-right" :class="'player_translucent_bg_color_'+p.color" >{{p.corporationCard2.name }}</div>
              </div>
              <player-info 
                :activePlayer="player"
                :player="p"
                :key="p.id"
                :firstForGen="getIsFirstForGen(p)"
                :actionLabel="getActionLabel(p)"
                :playerIndex="index"/>
            </template>
            <div v-if="player.players.length > 1" class="player-divider" />
            <div v-if="player.corporationCard2" class="player-info-top" >
                <div v-if="player.corporationCard !== undefined" :title="player.corporationCard.name"  class="player-corp-left" :class="'player_translucent_bg_color_'+player.color" >{{player.corporationCard.name }}</div>
                <div :title="player.corporationCard2.name" class="player-corp-right" :class="'player_translucent_bg_color_'+player.color" >{{player.corporationCard2.name }}</div>
            </div>
            <player-info
              :player="getPlayerOnFocus()"
              :activePlayer="player"
              :key="player.players.length - 1"
              :firstForGen="getIsFirstForGen(player)"
              :actionLabel="getActionLabel(player)"
              :playerIndex="-1"/>
        </div>
    `,
});
