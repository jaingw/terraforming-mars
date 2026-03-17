<template>
  <div id="game-lobby" class="lobby-page bg-mars-void text-mars-text p-4 sm:p-6 lg:p-8">
    <!-- Page title with HUD accent -->
    <div class="max-w-5xl mx-auto mb-6">
      <div class="flex items-center gap-3">
        <span class="lobby-hud-dot lobby-hud-dot--active"></span>
        <h1 class="text-lg font-bold text-mars-text uppercase tracking-widest" v-i18n>Game Lobby</h1>
      </div>
      <div class="lobby-hud-line mt-3"></div>
    </div>

    <!-- 创建房间模式 -->
    <div v-if="showCreateForm" class="max-w-5xl mx-auto">
      <create-game-form
        :lobby-mode="true"
        @lobby-room-created="onRoomCreated"
        @lobby-cancel="showCreateForm = false"
      ></create-game-form>
    </div>

    <!-- 大厅主界面 -->
    <div v-else class="max-w-5xl mx-auto">
      <!-- 顶部操作栏 -->
      <div class="flex items-center gap-3 mb-6 flex-wrap">
        <button
          class="lobby-btn-create inline-flex items-center gap-2 px-5 py-2.5 bg-mars-rust hover:bg-mars-ember disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-mars-rust text-white font-medium transition-all"
          @click="showCreateForm = true"
          :disabled="!isLoggedIn || isInAnyRoom"
          :title="!isLoggedIn ? $t('Please login first') : (isInAnyRoom ? $t('Leave your current room first') : '')"
        >
          <span class="text-lg leading-none font-bold">+</span>
          <span v-i18n>Create Room</span>
        </button>
        <button
          class="inline-flex items-center gap-1.5 px-4 py-2.5 bg-mars-surface hover:bg-mars-border text-mars-text-dim hover:text-mars-text font-medium transition-colors border border-mars-border rounded"
          @click="fetchRooms"
        >
          <span v-i18n>Refresh</span>
        </button>
        <div class="ml-auto flex items-center gap-2" v-if="hasAnyRooms">
          <span class="lobby-hud-dot"></span>
          <span class="text-xs text-mars-text-faint font-mono uppercase tracking-wider">
            {{ visibleRoomsCount }} <span v-i18n>room(s)</span>
          </span>
        </div>
      </div>

      <button
        v-if="!isLoggedIn"
        class="w-full text-left px-4 py-3 mb-5 bg-mars-cyan/10 hover:bg-mars-cyan/20 border border-mars-cyan/35 rounded text-mars-cyan transition-colors"
        @click="goToLogin"
      >
        <span class="font-semibold" v-i18n>Login required.</span>
        <span class="ml-2 text-mars-text-dim" v-i18n>Click here to sign in before creating or joining a room.</span>
      </button>

      <!-- 空状态 -->
      <div v-if="!hasAnyRooms && !loading" class="text-center py-24">
        <div class="lobby-empty-icon text-5xl mb-6">&#9790;</div>
        <p class="text-mars-text-dim text-base mb-1 uppercase tracking-wide" v-i18n>No active rooms</p>
        <p class="text-mars-text-faint text-sm" v-i18n>Create one to get started!</p>
      </div>

      <!-- 加载中 -->
      <div v-if="loading" class="text-center py-20">
        <p class="text-mars-text-dim animate-pulse font-mono uppercase tracking-wider text-sm" v-i18n>Scanning rooms...</p>
      </div>

      <div v-if="hasAnyRooms && !loading" class="space-y-5">
        <div
          v-for="section in lobbySections"
          :key="section.key"
          class="space-y-3"
        >
          <button
            v-if="section.type === 'toggle'"
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-mars-surface hover:bg-mars-border text-mars-text font-medium transition-colors border border-mars-border rounded"
            @click="showStartedRooms = !showStartedRooms"
          >
            <span class="text-mars-cyan font-mono">{{ showStartedRooms ? '-' : '+' }}</span>
            <span>{{ showStartedRooms ? $t('Hide running rooms') : $t('Show running rooms') }}</span>
            <span class="text-mars-text-faint font-mono">({{ startedRooms.length }})</span>
          </button>

          <div v-else class="space-y-3">
            <div class="flex items-center gap-2">
              <span class="lobby-hud-dot" :class="{'lobby-hud-dot--active': section.key === 'section-my'}"></span>
              <span class="text-xs text-mars-text-dim uppercase tracking-wider font-mono">{{ section.title }}</span>
            </div>

            <!-- 房间列表 -->
            <div class="grid gap-5 sm:grid-cols-1 lg:grid-cols-2" :class="{'lg:grid-cols-1': section.singleRow}">
              <div
                v-for="room in section.rooms"
                :key="room.roomId"
                class="lobby-room-card relative overflow-hidden transition-all"
                :class="{
                  'lobby-room-card--active': isInRoom(room) && room.status !== 'confirming',
                  'lobby-room-card--confirming': room.status === 'confirming',
                  'lobby-room-card--joinable': isJoinableRoom(room),
                  'lobby-room-card--ranked': isRankedRoom(room),
                  'lobby-room-card--owner': isOwner(room),
                }"
              >
          <!-- HUD corner accents -->
                <div class="lobby-corner lobby-corner--tl"></div>
                <div class="lobby-corner lobby-corner--tr"></div>
                <div class="lobby-corner lobby-corner--bl"></div>
                <div class="lobby-corner lobby-corner--br"></div>

                <!-- 房间头部 -->
                <div class="flex items-center justify-between px-5 py-3 border-b border-mars-border/60">
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="lobby-hud-dot" :class="{'lobby-hud-dot--active': room.status === 'waiting'}"></span>
                    <span class="font-semibold text-mars-text truncate">{{ room.ownerName }}</span>
                    <span class="text-mars-text-faint text-sm flex-shrink-0" v-i18n>'s Room</span>
                    <span
                      class="lobby-status-badge inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-wider flex-shrink-0"
                      :class="statusBadgeClass(room.status)"
                    >
                      {{ getStatusText(room.status) }}
                    </span>
                    <span
                      v-if="isJoinableRoom(room)"
                      class="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-mars-teal bg-mars-teal/20 border border-mars-teal/40 rounded-sm"
                      v-i18n
                    >Joinable</span>
                    <span
                      v-if="isRankedRoom(room)"
                      class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-200 bg-amber-500/20 border border-amber-400/60 rounded-sm"
                    >
                      <img src="/assets/rank/rank-logo.png" alt="Ranked" class="w-3 h-3">
                      <span v-i18n>Ranked</span>
                    </span>
                  </div>
                  <div class="flex-shrink-0 ml-3 text-sm font-mono flex items-center gap-2">
                    <span class="text-mars-rust font-bold text-base">{{ room.players.length }}</span>
                    <span class="text-mars-text-faint"> / {{ room.maxPlayers }}</span>
                    <button
                      class="lobby-info-btn"
                      :title="$t('View room settings')"
                      @click="openRoomSettings(room)"
                    >i</button>
                    <button
                      v-if="isOwner(room) && room.status === 'waiting'"
                      class="lobby-close-btn"
                      :title="$t('Close room')"
                      @click="closeRoom(room.roomId)"
                    ><i class="fas fa-times"></i></button>
                  </div>
                </div>

                <!-- 游戏设置摘要 -->
                <div class="px-5 py-2.5 flex flex-wrap gap-1.5" v-if="getSettingsTags(room).length > 0">
                  <span
                    class="lobby-tag inline-block px-2.5 py-0.5 text-xs font-medium"
                    v-for="tag in getSettingsTags(room)"
                    :key="tag"
                  >{{ tag }}</span>
                </div>

                <!-- 玩家列表 -->
                <div class="px-5 py-2 space-y-1.5">
                  <div
                    v-for="player in room.players"
                    :key="player.userId"
                    class="lobby-player-slot flex items-center gap-2 px-3 py-2 text-sm"
                    :class="getPlayerColorClass(player.color)"
                  >
                    <a :href="'/user/' + encodeURIComponent(player.name)" class="font-medium truncate text-mars-text hover:text-mars-cyan transition-colors">{{ player.name }}</a>
                    <i
                      v-if="player.isOwner"
                      class="fas fa-crown text-mars-amber"
                      :title="$t('Owner')"
                    ></i>
                    <span v-if="player.rankValue" class="text-xs text-mars-text-dim font-mono">
                      &#9733; {{ Math.round(player.rankValue) }}
                    </span>
                    <span
                      v-if="room.status === 'confirming'"
                      class="ml-auto text-xs font-bold uppercase tracking-wider font-mono"
                      :class="player.isReady ? 'text-mars-teal' : 'text-mars-yellow animate-pulse'"
                    >
                      {{ player.isReady ? $t('READY') : $t('STANDBY') }}
                    </span>
                    <button
                      v-if="isOwner(room) && !player.isOwner && room.status === 'waiting'"
                      class="ml-auto px-2.5 py-0.5 text-xs font-medium bg-mars-red/15 hover:bg-mars-red/30 text-mars-red rounded-sm transition-colors border border-mars-red/20"
                      @click="kickPlayer(room.roomId, player.userId)"
                      v-i18n
                    >Kick</button>
                  </div>
                  <!-- 空位 slot -->
                  <div
                    v-for="i in (room.maxPlayers - room.players.length)"
                    :key="'empty-' + i"
                    class="lobby-empty-slot flex items-center px-3 py-2 text-sm text-mars-text-faint"
                  >
                    <span class="font-mono text-xs uppercase tracking-wider" v-i18n>[ Empty Slot ]</span>
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div class="px-5 py-3 border-t border-mars-border/60 flex items-center gap-2 flex-wrap">
                  <!-- 未加入 -->
                  <template v-if="canJoinRoom(room)">
                    <div class="flex items-center gap-3 flex-wrap w-full">
                      <div class="flex items-center gap-2">
                        <span class="text-xs text-mars-text-faint uppercase tracking-wider font-mono" v-i18n>Color:</span>
                        <label
                          v-for="color in getAvailableColors(room)"
                          :key="color"
                          :for="'color-' + room.roomId + '-' + color"
                          class="cursor-pointer"
                        >
                          <input
                            type="radio"
                            :id="'color-' + room.roomId + '-' + color"
                            :name="'joinColor-' + room.roomId"
                            :value="color"
                            v-model="selectedColors[room.roomId]"
                            class="sr-only peer"
                          >
                          <div
                            class="w-7 h-7 rounded-full border-2 border-mars-border peer-checked:border-mars-text peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-offset-mars-deep peer-checked:ring-mars-cyan transition-all"
                            :class="'create-game-colorbox ' + getPlayerCubeColorClass(color)"
                          ></div>
                        </label>
                      </div>
                      <button
                        class="lobby-btn-join ml-auto px-4 py-1.5 disabled:opacity-30 disabled:cursor-not-allowed text-mars-teal text-sm font-medium transition-all border border-mars-teal/50 hover:border-mars-teal hover:bg-mars-teal/20"
                        @click="joinRoom(room.roomId)"
                        :disabled="!selectedColors[room.roomId]"
                        v-i18n
                      >Join</button>
                    </div>
                  </template>

                  <!-- 已加入且非房主 -->
                  <template v-if="isInRoom(room) && !isOwner(room)">
                    <button
                      class="lobby-btn-action px-4 py-1.5 text-mars-text-dim hover:text-mars-text text-sm font-medium transition-all border border-mars-border hover:border-mars-text-dim"
                      @click="leaveRoom(room.roomId)"
                      v-i18n
                    >Leave</button>
                    <button
                      v-if="room.status === 'confirming' && !isReady(room)"
                      class="lobby-btn-action px-4 py-1.5 text-mars-teal text-sm font-medium transition-all border border-mars-teal/40 hover:border-mars-teal/70 hover:bg-mars-teal/10"
                      @click="confirmReady(room.roomId)"
                      v-i18n
                    >Confirm</button>
                  </template>

                  <!-- 房主操作 -->
                  <template v-if="isOwner(room)">
                    <button
                      v-if="room.status === 'waiting' && room.players.length >= 2"
                      class="lobby-btn-create px-4 py-1.5 bg-mars-rust hover:bg-mars-ember text-white text-sm font-medium transition-all"
                      @click="startGame(room.roomId)"
                      v-i18n
                    >Launch Game</button>
                  </template>

                  <!-- 游戏已开始 -->
                  <template v-if="room.status === 'started' && room.gameId">
                    <a
                      :href="'game?id=' + room.gameId"
                      class="lobby-btn-action inline-block px-4 py-1.5 text-mars-cyan text-sm font-medium transition-all border border-mars-cyan/40 hover:border-mars-cyan/70 hover:bg-mars-cyan/10"
                      v-i18n
                    >Enter Game</a>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <lobby-room-settings-modal ref="settingsModal" :room="activeSettingsRoom"></lobby-room-settings-modal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {Color, PLAYER_COLORS} from '@/common/Color';
import {ILobbyRoom, ELobbyRoomStatus} from '@/common/lobby/LobbyTypes';
import {PreferencesManager} from '@/client/utils/PreferencesManager';
import {playerColorClass} from '@/common/utils/utils';
import {paths} from '@/common/app/paths';
import {translateText} from '@/client/directives/i18n';
import CreateGameForm from '@/client/components/create/CreateGameForm.vue';
import LobbyRoomSettingsModal from '@/client/components/lobby/LobbyRoomSettingsModal.vue';
import {showError, showWarning} from '@/client/utils/showAlert';
import {lobbyService} from '@/client/services';
import {request} from '@/client/utils/request';

const POLL_INTERVAL = 3000;

export default Vue.extend({
  name: 'GameLobby',
  components: {
    CreateGameForm,
    LobbyRoomSettingsModal,
  },
  data() {
    return {
      rooms: [] as Array<ILobbyRoom>,
      loading: false,
      showCreateForm: false,
      selectedColors: {} as Record<string, Color>,
      pollTimer: null as ReturnType<typeof setInterval> | null,
      showStartedRooms: false,
      activeSettingsRoom: null as ILobbyRoom | null,
    };
  },
  computed: {
    userId(): string {
      return PreferencesManager.load('userId');
    },
    userName(): string {
      return PreferencesManager.load('userName');
    },
    isInAnyRoom(): boolean {
      return this.rooms.some((room: ILobbyRoom) =>
        room.players.some((p) => p.userId === this.userId) &&
        room.status !== ELobbyRoomStatus.STARTED,
      );
    },
    isLoggedIn(): boolean {
      return this.userId !== undefined && this.userId !== '';
    },
    visibleLobbyRooms(): Array<ILobbyRoom> {
      return this.rooms
        .filter((room: ILobbyRoom) => this.isVisibleRoom(room))
        .sort((a, b) => b.createdAt - a.createdAt);
    },
    myRooms(): Array<ILobbyRoom> {
      return this.visibleLobbyRooms.filter((room: ILobbyRoom) => this.isInRoom(room));
    },
    waitingRooms(): Array<ILobbyRoom> {
      return this.visibleLobbyRooms.filter((room: ILobbyRoom) => !this.isInRoom(room) && room.status !== ELobbyRoomStatus.STARTED);
    },
    startedRooms(): Array<ILobbyRoom> {
      return this.visibleLobbyRooms.filter((room: ILobbyRoom) => !this.isInRoom(room) && room.status === ELobbyRoomStatus.STARTED);
    },
    hasAnyRooms(): boolean {
      return this.visibleLobbyRooms.length > 0;
    },
    visibleRoomsCount(): number {
      return this.myRooms.length + this.waitingRooms.length + (this.showStartedRooms ? this.startedRooms.length : 0);
    },
    lobbySections(): Array<{key: string; type: 'rooms' | 'toggle'; title?: string; rooms?: Array<ILobbyRoom>; singleRow?: boolean}> {
      const sections: Array<{key: string; type: 'rooms' | 'toggle'; title?: string; rooms?: Array<ILobbyRoom>; singleRow?: boolean}> = [];
      if (this.myRooms.length > 0) {
        sections.push({
          key: 'section-my',
          type: 'rooms',
          title: translateText('Your room'),
          rooms: this.myRooms,
          singleRow: true,
        });
      }
      sections.push({
        key: 'section-waiting',
        type: 'rooms',
        title: translateText('Waiting to start'),
        rooms: this.waitingRooms,
        singleRow: false,
      });
      if (this.startedRooms.length > 0) {
        sections.push({
          key: 'section-toggle',
          type: 'toggle',
        });
      }
      if (this.showStartedRooms && this.startedRooms.length > 0) {
        sections.push({
          key: 'section-started',
          type: 'rooms',
          title: translateText('In progress'),
          rooms: this.startedRooms,
          singleRow: false,
        });
      }
      return sections;
    },
  },
  mounted() {
    this.fetchRooms();
    this.startPolling();
  },
  beforeDestroy() {
    this.stopPolling();
  },
  methods: {
    startPolling() {
      this.stopPolling();
      this.pollTimer = setInterval(() => {
        if (!this.showCreateForm) {
          this.fetchRooms();
        }
      }, POLL_INTERVAL);
    },
    stopPolling() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
    },
    async fetchRooms() {
      this.loading = true;
      try {
        const data = await lobbyService.getRooms();
        this.rooms = data.rooms || [];
      } catch (err: any) {
        console.error('Failed to fetch rooms:', err);
      } finally {
        this.loading = false;
      }
    },
    async joinRoom(roomId: string) {
      const color = this.selectedColors[roomId];
      if (!color) {
        showWarning(translateText('Please select a color'));
        return;
      }
      if (!this.userId) {
        showWarning(translateText('Please login first'));
        return;
      }
      try {
        await lobbyService.joinRoom(roomId, {
          userId: this.userId,
          userName: this.userName,
          color,
        });
        await this.fetchRooms();
      } catch (err: any) {
        showError(err.body || err.message);
      }
    },
    async leaveRoom(roomId: string) {
      try {
        await lobbyService.leaveRoom(roomId, this.userId);
        await this.fetchRooms();
      } catch (err: any) {
        showError(err.body || err.message);
      }
    },
    async kickPlayer(roomId: string, targetUserId: string) {
      try {
        await lobbyService.kickPlayer(roomId, this.userId, targetUserId);
        await this.fetchRooms();
      } catch (err: any) {
        showError(err.body || err.message);
      }
    },
    async startGame(roomId: string) {
      try {
        await lobbyService.startGame(roomId, this.userId);
        await this.fetchRooms();
      } catch (err: any) {
        showError(err.body || err.message);
      }
    },
    async pollAndCreateGame(roomId: string) {
      try {
        const data = await request.get<{room: ILobbyRoom; allReady: boolean; gameConfig?: any}>(
          `/api/v2/lobby/${roomId}/poll`,
        );
        if (data.allReady && data.gameConfig) {
          await this.createGameFromLobby(roomId, data.gameConfig);
          await this.fetchRooms();
        }
      } catch (err) {
        console.error('Failed to poll and create game:', err);
      }
    },
    async onRoomCreated(_room: ILobbyRoom) {
      this.showCreateForm = false;
      await this.fetchRooms();
    },
    isInRoom(room: ILobbyRoom): boolean {
      return room.players.some((p) => p.userId === this.userId);
    },
    isVisibleRoom(room: ILobbyRoom): boolean {
      if (room.status === ELobbyRoomStatus.CLOSED) {
        return false;
      }
      if (room.status === ELobbyRoomStatus.STARTED) {
        const phase = (room.gameData as any)?.phase;
        if (phase === 'end' || phase === 'timeout' || phase === 'abandon') {
          return false;
        }
      }
      return true;
    },
    canJoinRoom(room: ILobbyRoom): boolean {
      return this.isLoggedIn && !this.isInAnyRoom && !this.isInRoom(room) && room.status === ELobbyRoomStatus.WAITING && room.players.length < room.maxPlayers;
    },
    isJoinableRoom(room: ILobbyRoom): boolean {
      return this.canJoinRoom(room);
    },
    isRankedRoom(room: ILobbyRoom): boolean {
      return Boolean((room.gameConfig as any)?.rankOption);
    },
    openRoomSettings(room: ILobbyRoom) {
      this.activeSettingsRoom = room;
      (this.$refs.settingsModal as any)?.show?.();
    },
    goToLogin() {
      window.location.href = '/' + paths.LOGIN;
    },
    isOwner(room: ILobbyRoom): boolean {
      return room.ownerId === this.userId;
    },
    isReady(room: ILobbyRoom): boolean {
      const player = room.players.find((p) => p.userId === this.userId);
      return player?.isReady ?? false;
    },
    getAvailableColors(room: ILobbyRoom): Array<Color> {
      const usedColors = new Set(room.players.map((p) => p.color));
      return PLAYER_COLORS.filter((c) => !usedColors.has(c));
    },
    getPlayerColorClass(color: Color): string {
      return playerColorClass(color, 'bg_transparent');
    },
    getPlayerCubeColorClass(color: Color): string {
      return playerColorClass(color, 'bg');
    },
    getStatusText(status: string): string {
      switch (status) {
      case ELobbyRoomStatus.WAITING: return translateText('Waiting');
      case ELobbyRoomStatus.CONFIRMING: return translateText('Confirming');
      case ELobbyRoomStatus.STARTED: return translateText('Started');
      case ELobbyRoomStatus.CLOSED: return translateText('Closed');
      default: return status;
      }
    },
    statusBadgeClass(status: string): string {
      switch (status) {
      case ELobbyRoomStatus.WAITING: return 'bg-mars-teal/15 text-mars-teal';
      case ELobbyRoomStatus.CONFIRMING: return 'bg-mars-yellow/15 text-mars-yellow';
      case ELobbyRoomStatus.STARTED: return 'bg-mars-cyan/15 text-mars-cyan';
      case ELobbyRoomStatus.CLOSED: return 'bg-mars-surface text-mars-text-faint';
      default: return 'bg-mars-surface text-mars-text-faint';
      }
    },
    getSettingsTags(room: ILobbyRoom): Array<string> {
      const tags: Array<string> = [];
      const config = room.gameConfig;
      if (!config || !config.expansions) return tags;

      tags.push(room.maxPlayers + 'P');

      if (config.expansions.prelude) tags.push('Prelude');
      if (config.expansions.prelude2) tags.push('Prelude 2');
      if (config.expansions.venus) tags.push('Venus');
      if (config.expansions.colonies) tags.push('Colonies');
      if (config.expansions.turmoil) tags.push('Turmoil');
      if (config.expansions.promo) tags.push('Promos');
      if (config.expansions.ceo) tags.push('CEOs');
      if (config.expansions.moon) tags.push('Moon');
      if (config.expansions.pathfinders) tags.push('Pathfinders');
      if (config.expansions.ares) tags.push('Ares');
      if (config.expansions.community) tags.push('Community');
      if (config.expansions.starwars) tags.push('Star Wars');
      if (config.expansions.underworld) tags.push('Underworld');
      if (config.expansions.breakthrough) tags.push('Breakthrough');
      if (config.expansions.eros) tags.push('Eros');

      if (config.draftVariant) tags.push('Draft');
      if ((config as any).rankOption) tags.push('Ranked');

      return tags;
    },
    async closeRoom(roomId: string) {
      try {
        await lobbyService.leaveRoom(roomId, this.userId);
        await this.fetchRooms();
      } catch (err: any) {
        showError(err.body || err.message);
      }
    },
    async confirmReady(roomId: string) {
      try {
        const data = await lobbyService.confirmReady(roomId, this.userId);

        if (data.allReady && data.gameConfig) {
          await this.createGameFromLobby(roomId, data.gameConfig);
        }
        await this.fetchRooms();
      } catch (err: any) {
        showError(err.body || err.message);
      }
    },
    async createGameFromLobby(roomId: string, gameConfig: any) {
      try {
        const response = await fetch(paths.API_CREATEGAME, {
          method: 'POST',
          body: JSON.stringify(gameConfig),
          headers: {'Content-Type': 'application/json'},
        });
        const text = await response.text();
        const json = JSON.parse(text);

        await lobbyService.markStarted(roomId, json.id, json);
      } catch (err: any) {
        showError('Failed to create game: ' + (err.message || err));
      }
    },
    navigateToGame(gameData: any) {
      this.stopPolling();
      if (gameData.players.length === 1) {
        window.location.href = 'player?id=' + gameData.players[0].id;
      } else {
        window.location.href = 'game?id=' + gameData.id;
      }
    },
  },
});
</script>

<style scoped>
/* === Page background with subtle grid + warm glow === */
.lobby-page {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  background-image:
    radial-gradient(ellipse at 50% -10%, rgba(226,82,14,0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 90%, rgba(34,211,238,0.05) 0%, transparent 40%),
    linear-gradient(rgba(38,48,80,0.3) 1px, transparent 1px),
    linear-gradient(90deg, rgba(38,48,80,0.3) 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 40px 40px, 40px 40px;
}

/* === HUD pulsing dot === */
.lobby-hud-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #94a3b8;
  box-shadow: 0 0 4px rgba(148,163,184,0.5);
}
.lobby-hud-dot--active {
  background: #2dd4bf;
  box-shadow: 0 0 8px rgba(45,212,191,0.7);
  animation: hudPulse 2s ease-in-out infinite;
}

@keyframes hudPulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(45,212,191,0.7); }
  50% { opacity: 0.4; box-shadow: 0 0 3px rgba(45,212,191,0.3); }
}

/* === HUD divider line === */
.lobby-hud-line {
  height: 1px;
  background: linear-gradient(
    to right,
    rgba(226,82,14,0.7),
    rgba(226,82,14,0.3) 20%,
    rgba(38,48,80,0.5) 50%,
    transparent 100%
  );
}

/* === Room card with angular clip + glow border === */
.lobby-room-card {
  background: linear-gradient(180deg, rgba(17,26,46,0.98) 0%, rgba(17,26,46,0.95) 100%);
  border: 1px solid #263050;
  border-radius: 4px;
  clip-path: polygon(
    0 0, calc(100% - 12px) 0, 100% 12px,
    100% 100%, 12px 100%, 0 calc(100% - 12px)
  );
  box-shadow: 0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03);
}
.lobby-room-card--active {
  border-color: rgba(226,82,14,0.5);
  box-shadow: 0 4px 24px rgba(0,0,0,0.5), 0 0 24px rgba(226,82,14,0.1);
}
.lobby-room-card--confirming {
  border-color: rgba(250,204,21,0.5);
  box-shadow: 0 4px 24px rgba(0,0,0,0.5), 0 0 24px rgba(250,204,21,0.1);
}
.lobby-room-card--joinable {
  border-color: rgba(45,212,191,0.55);
  box-shadow: 0 4px 24px rgba(0,0,0,0.5), 0 0 28px rgba(45,212,191,0.12);
}
.lobby-room-card--ranked {
  border-color: rgba(245,158,11,0.7);
  box-shadow: 0 4px 24px rgba(0,0,0,0.5), 0 0 32px rgba(245,158,11,0.16);
}
.lobby-room-card--owner {
  background: linear-gradient(180deg, rgba(26, 37, 64, 0.98) 0%, rgba(17, 26, 46, 0.96) 100%);
}

/* === HUD corner accents === */
.lobby-corner {
  position: absolute;
  width: 18px;
  height: 18px;
  pointer-events: none;
}
.lobby-corner--tl { top: 0; left: 0; border-top: 2px solid rgba(226,82,14,0.5); border-left: 2px solid rgba(226,82,14,0.5); }
.lobby-corner--tr { top: 0; right: 0; border-top: 2px solid rgba(226,82,14,0.3); border-right: 2px solid rgba(226,82,14,0.3); }
.lobby-corner--bl { bottom: 0; left: 0; border-bottom: 2px solid rgba(226,82,14,0.3); border-left: 2px solid rgba(226,82,14,0.3); }
.lobby-corner--br { bottom: 0; right: 0; border-bottom: 2px solid rgba(226,82,14,0.5); border-right: 2px solid rgba(226,82,14,0.5); }

.lobby-room-card--active .lobby-corner--tl,
.lobby-room-card--active .lobby-corner--br {
  border-color: rgba(226,82,14,0.7);
}
.lobby-room-card--confirming .lobby-corner--tl,
.lobby-room-card--confirming .lobby-corner--br {
  border-color: rgba(250,204,21,0.7);
}

/* === Status badge with border === */
.lobby-status-badge {
  border-radius: 2px;
  border: 1px solid currentColor;
  opacity: 0.85;
}

/* === Setting tags === */
.lobby-tag {
  background: rgba(26,37,64,0.8);
  color: #c48b5c;
  border: 1px solid rgba(38,48,80,0.7);
  border-radius: 2px;
}

/* === Player slot === */
.lobby-player-slot {
  border-radius: 4px;
  border-left: 3px solid transparent;
}

/* === Empty slot with dashed sci-fi border === */
.lobby-empty-slot {
  border: 1px dashed rgba(38,48,80,0.9);
  border-radius: 4px;
}

/* === Buttons with angular clip === */
.lobby-btn-create {
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
  border-radius: 0;
  box-shadow: 0 0 14px rgba(226,82,14,0.25);
  background: linear-gradient(135deg, #e2520e, #f97316) !important;
}
.lobby-btn-create:hover {
  box-shadow: 0 0 22px rgba(226,82,14,0.4);
  background: linear-gradient(135deg, #f97316, #f59e0b) !important;
}
.lobby-btn-action {
  border-radius: 2px;
  background: transparent;
}
.lobby-info-btn {
  width: 26px;
  height: 26px;
  border-radius: 9999px;
  border: 1px solid rgba(148,163,184,0.4);
  color: #cbd5e1;
  background: rgba(17,26,46,0.8);
  font-weight: 700;
  font-family: monospace;
  line-height: 1;
  transition: all 0.2s ease;
}
.lobby-info-btn:hover {
  border-color: rgba(34,211,238,0.72);
  color: #22d3ee;
  box-shadow: 0 0 14px rgba(34,211,238,0.25);
}
.lobby-btn-join {
  border-radius: 2px;
  background: rgba(45,212,191,0.08);
  box-shadow: 0 0 14px rgba(45,212,191,0.2);
}
.lobby-btn-join:hover {
  box-shadow: 0 0 20px rgba(45,212,191,0.32);
}

.lobby-close-btn {
  width: 26px;
  height: 26px;
  border-radius: 9999px;
  border: 1px solid rgba(239,68,68,0.4);
  color: #ef4444;
  background: rgba(239,68,68,0.1);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lobby-close-btn:hover {
  border-color: rgba(239,68,68,0.72);
  color: #f87171;
  background: rgba(239,68,68,0.2);
  box-shadow: 0 0 14px rgba(239,68,68,0.25);
}

/* === Empty state icon glow === */
.lobby-empty-icon {
  color: #94a3b8;
  text-shadow: 0 0 24px rgba(226,82,14,0.25);
  opacity: 0.5;
}

/* ============ Mobile Responsive ============ */
@media (max-width: 640px) {
  .lobby-page {
    padding: 12px !important;
  }

  /* Page title */
  .lobby-page h1 {
    font-size: 15px !important;
    letter-spacing: 0.08em;
  }

  /* Top action bar: stack create button full width */
  .lobby-page .flex.items-center.gap-3.mb-6.flex-wrap {
    gap: 8px;
  }

  .lobby-btn-create {
    width: 100%;
    justify-content: center;
    padding-top: 10px !important;
    padding-bottom: 10px !important;
    font-size: 14px;
  }

  /* Refresh button: compact on mobile */
  .lobby-page .flex.items-center.gap-3.mb-6 > button:not(.lobby-btn-create) {
    padding: 6px 12px !important;
    font-size: 12px;
  }

  /* Room card: remove clip-path on mobile for full visibility */
  .lobby-room-card {
    clip-path: none !important;
    border-radius: 6px;
  }

  /* Room card header: allow wrapping, reduce padding */
  .lobby-room-card .flex.items-center.justify-between {
    flex-wrap: wrap;
    gap: 6px;
    padding: 10px 12px !important;
  }

  /* Room owner name + badges: wrap into multiple lines */
  .lobby-room-card .flex.items-center.gap-2.min-w-0 {
    flex-wrap: wrap;
    gap: 4px;
  }

  /* Owner name */
  .lobby-room-card .font-semibold.text-mars-text.truncate {
    font-size: 14px;
    max-width: 120px;
  }

  /* "'s Room" text smaller */
  .lobby-room-card .text-mars-text-faint.text-sm.flex-shrink-0 {
    font-size: 12px;
  }

  /* Status badge smaller */
  .lobby-status-badge {
    font-size: 9px !important;
    padding: 1px 6px !important;
    letter-spacing: 0.04em !important;
  }

  /* Room card player slot */
  .lobby-player-slot {
    font-size: 13px;
    padding: 6px 8px !important;
  }

  /* Room card action area */
  .lobby-room-card .px-5.py-3.border-t {
    padding: 10px 12px !important;
  }

  /* Color picker label: column layout on mobile */
  .lobby-room-card .flex.items-center.gap-3.flex-wrap.w-full {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .lobby-room-card .flex.items-center.gap-3.flex-wrap.w-full .flex.items-center.gap-2 {
    justify-content: center;
  }

  .lobby-btn-join {
    width: 100% !important;
    margin-left: 0 !important;
    text-align: center;
    justify-content: center;
    padding: 10px 16px !important;
  }

  /* Color picker: smaller on mobile */
  .lobby-room-card .w-7.h-7 {
    width: 24px !important;
    height: 24px !important;
  }

  /* Settings tags: smaller */
  .lobby-tag {
    font-size: 10px;
    padding: 2px 6px;
  }

  /* Settings tags container: reduce padding */
  .lobby-room-card .px-5.py-2\.5 {
    padding: 6px 12px !important;
  }

  /* Reduce card inner padding */
  .lobby-room-card .px-5 {
    padding-left: 12px !important;
    padding-right: 12px !important;
  }

  /* Info button smaller */
  .lobby-info-btn {
    width: 22px;
    height: 22px;
    font-size: 11px;
  }

  /* Player count area: tighter */
  .lobby-room-card .flex-shrink-0.ml-3 {
    margin-left: auto !important;
    font-size: 12px;
  }

  .lobby-room-card .flex-shrink-0.ml-3 .text-mars-rust {
    font-size: 14px !important;
  }

  /* Section headers */
  .lobby-page .text-xs.text-mars-text-dim.uppercase {
    font-size: 10px !important;
  }

  /* Room count badge at top */
  .lobby-page .text-xs.text-mars-text-faint.font-mono {
    font-size: 10px !important;
  }

  /* Empty state: smaller */
  .lobby-empty-icon {
    font-size: 36px !important;
    margin-bottom: 16px !important;
  }

  /* Room grid: always single column on mobile */
  .grid.gap-5 {
    grid-template-columns: 1fr !important;
    gap: 12px !important;
  }

  /* HUD corner accents: smaller on mobile */
  .lobby-corner {
    width: 12px;
    height: 12px;
  }

  /* Login prompt: smaller text */
  .lobby-page .text-mars-cyan.transition-colors .font-semibold {
    font-size: 13px;
  }
  .lobby-page .text-mars-cyan.transition-colors .text-mars-text-dim {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .lobby-page {
    padding: 8px !important;
  }

  /* Further reduce room card padding */
  .lobby-room-card .px-5 {
    padding-left: 10px !important;
    padding-right: 10px !important;
  }

  /* Room owner name even shorter on very small screens */
  .lobby-room-card .font-semibold.text-mars-text.truncate {
    max-width: 90px;
    font-size: 13px;
  }

  /* Player slot tighter */
  .lobby-player-slot {
    font-size: 12px;
    padding: 5px 6px !important;
    gap: 4px !important;
  }

  /* Kick button smaller */
  .lobby-player-slot .px-2\.5.py-0\.5 {
    font-size: 10px;
    padding: 2px 6px !important;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .lobby-page {
    padding: 16px !important;
  }

  /* Page title */
  .lobby-page h1 {
    font-size: 16px !important;
  }
}
</style>
