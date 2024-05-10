<template>
        <div class="players-overview" v-if="hasPlayers()">
            <overview-settings />
            <div class="other_player" v-if="thisPlayer === undefined || players.length > 1">
                <div v-for="(otherPlayer, index) in getPlayersInOrder()" :key="otherPlayer.color">
                    <other-player v-if="thisPlayer === undefined || otherPlayer.color !== thisPlayer.color" :player="otherPlayer" :playerIndex="index"/>
                </div>
            </div>
            <template v-for="(p, index) in getPlayersInOrder()" >
              <div v-if="p.corporationCard2"  class="player-info-top" :key="index" >
                <div v-if="p.corporationCard !== undefined" :title="p.corporationCard.name"  class="player-corp-left"  :class="getClasses(p)" >{{p.corporationCard.name }}</div>
                <div :title="p.corporationCard2.name" class="player-corp-right" :class="getClasses(p)" >{{p.corporationCard2.name }}</div>
              </div>
              <player-info
                :player="p"
              :key="p.color"
                :playerView="playerView"
                :firstForGen="getIsFirstForGen(p)"
                :actionLabel="getActionLabel(p)"
                :playerIndex="index"/>
            </template>
            <div v-if="playerView.players.length > 1 && thisPlayer !== undefined" class="player-divider" />
            <div v-if="thisPlayer !== undefined && thisPlayer.corporationCard2" class="player-info-top" >
              <div v-if="thisPlayer.corporationCard !== undefined" :title="thisPlayer.corporationCard.name"  class="player-corp-left" :class="getClasses(thisPlayer)" >{{thisPlayer.corporationCard.name }}</div>
              <div :title="thisPlayer.corporationCard2.name" class="player-corp-right" :class="getClasses(thisPlayer)" >{{thisPlayer.corporationCard2.name }}</div>
            </div>
            <player-info
              v-if="thisPlayer !== undefined"
              :player="thisPlayer"
              :key="thisPlayer.color"
              :playerView="playerView"
              :firstForGen="getIsFirstForGen(thisPlayer)"
              :actionLabel="getActionLabel(thisPlayer)"
              :playerIndex="-1"/>
        </div>
</template>

<script lang="ts">
import Vue from 'vue';
import PlayerInfo from '@/client/components/overview/PlayerInfo.vue';
import OtherPlayer from '@/client/components/OtherPlayer.vue';
import {ViewModel, PublicPlayerModel} from '@/common/models/PlayerModel';
import {ActionLabel} from '@/client/components/overview/ActionLabel';
import {Phase} from '@/common/Phase';
import {Color} from '@/common/Color';
import {playerColorClass} from '@/common/utils/utils';

const SHOW_NEXT_LABEL_MIN = 2;

export const playerIndex = (
  color: Color,
  players: Array<PublicPlayerModel>,
): number => {
  for (let idx = 0; idx < players.length; idx++) {
    if (players[idx].color === color) {
      return idx;
    }
  }
  return -1;
};

export default Vue.extend({
  name: 'PlayersOverview',
  props: {
    playerView: {
      type: Object as () => ViewModel,
    },
  },
  computed: {
    players(): Array<PublicPlayerModel> {
      return this.playerView.players;
    },
    thisPlayer(): PublicPlayerModel | undefined {
      return this.playerView.thisPlayer;
    },
  },
  components: {
    'player-info': PlayerInfo,
    'other-player': OtherPlayer,
  },
  data() {
    return {};
  },
  methods: {
    hasPlayers(): boolean {
      return this.players.length > 0;
    },
    getIsFirstForGen(player: PublicPlayerModel): boolean {
      return playerIndex(player.color, this.players) === 0;
    },
    getPlayersInOrder(): Array<PublicPlayerModel> {
      const players = this.players;
      if (this.thisPlayer === undefined) {
        return players;
      }

      let result = [];
      let currentPlayerOffset = 0;
      const currentPlayerIndex = playerIndex(
        this.thisPlayer.color,
        this.players,
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
      // 天梯 TODO: 异常结束游戏的`ActionLabel`等价于体退的状态？
      if (this.playerView.game.phase === Phase.TIMEOUT || this.playerView.game.phase === Phase.ABANDON) {
        return ActionLabel.RESIGNED;
      }
      if (this.playerView.game.phase === Phase.DRAFTING) {
        if (player.waitingFor !== undefined) {
          return ActionLabel.DRAFTING;
        } else {
          return ActionLabel.NONE;
        }
      } else if (this.playerView.game.phase === Phase.RESEARCH) {
        if (player.waitingFor !== undefined) {
          return ActionLabel.RESEARCHING;
        } else {
          return ActionLabel.NONE;
        }
      }
      if (this.playerView.game.passedPlayers.includes(player.color)) {
        return ActionLabel.PASSED;
      }
      if (player.isActive) return ActionLabel.ACTIVE;
      const notPassedPlayers = this.players.filter(
        (p: PublicPlayerModel) => !this.playerView.game.passedPlayers.includes(p.color),
      );

      const currentPlayerIndex = playerIndex(
        player.color,
        notPassedPlayers,
      );

      if (currentPlayerIndex === -1) {
        return ActionLabel.NONE;
      }

      const prevPlayerIndex =
                currentPlayerIndex === 0 ?
                  notPassedPlayers.length - 1 :
                  currentPlayerIndex - 1;
      const isNext = notPassedPlayers[prevPlayerIndex].isActive;

      if (isNext && this.players.length > SHOW_NEXT_LABEL_MIN) {
        return ActionLabel.NEXT;
      }

      return ActionLabel.NONE;
    },
    getClasses: function(player: PublicPlayerModel): string {
      const classes = [];
      classes.push(playerColorClass(player.color, 'bg_transparent'));
      if (player.exited) {
        classes.push('player_overview_bg_color_gray');
      }
      return classes.join(' ');
    },
  },
});
</script>
