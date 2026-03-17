<template>
  <div class="me-page" :class="{ 'me-page--vip': isVip }">
    <div class="me-container">
      <!-- Desktop Sidebar -->
      <aside class="me-sidebar">
        <!-- User Card -->
        <div class="me-user-card" :class="{ 'me-user-card--vip': isVip }">
          <div class="me-user-card__glow" v-if="isVip"></div>
          <div class="me-user-card__avatar" :style="avatarStyle">
            {{ avatarLetter }}
          </div>
          <div class="me-user-card__info">
            <h2 class="me-user-card__name" :class="{ 'me-user-card__name--vip': isVip }">
              {{ userName }}
            </h2>
            <div class="me-user-card__badge" v-if="vipDate">
              <span class="me-vip-badge">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
                VIP
              </span>
            </div>
            <div class="me-user-card__rank" v-if="userRank.userId !== ''">
              <RankBadge :rankTier="getTier()" :showName="true" :vertical="true"/>
            </div>
          </div>
          <div class="me-user-card__points" v-if="userId">
            <div class="me-points-display" :class="{ 'me-points-display--vip': isVip }">
              <span class="me-points-display__value">{{ userPointsDisplay }}</span>
              <span class="me-points-display__label">PTS</span>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="me-nav">
          <button
            v-for="item in navItems"
            :key="item.id"
            class="me-nav__item"
            :class="{ 'me-nav__item--active': activeSection === item.id }"
            @click="activeSection = item.id"
          >
            <span class="me-nav__icon" v-html="item.icon"></span>
            <span class="me-nav__label" v-i18n>{{ item.label }}</span>
          </button>
        </nav>

        <!-- Logout -->
        <div class="me-sidebar__footer">
          <button class="me-logout-btn" @click="changeLogin">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span v-i18n>Logout</span>
          </button>
        </div>
      </aside>

      <!-- Mobile Tab Bar -->
      <nav class="me-mobile-nav">
        <button
          v-for="item in navItems"
          :key="item.id"
          class="me-mobile-nav__item"
          :class="{ 'me-mobile-nav__item--active': activeSection === item.id }"
          @click="activeSection = item.id"
        >
          <span class="me-mobile-nav__icon" v-html="item.icon"></span>
          <span class="me-mobile-nav__label">{{ item.label }}</span>
        </button>
      </nav>

      <!-- Main Content -->
      <main class="me-content">
        <!-- Not logged in -->
        <div v-if="!userName" class="me-empty">
          <div class="me-empty__icon">&#9790;</div>
          <p class="me-empty__text" v-i18n>Please sign in to view your profile</p>
          <a href="/login" class="me-btn-primary" v-i18n>Sign In</a>
        </div>

        <!-- Account Section -->
        <div v-else-if="activeSection === 'account'" class="me-section">
          <div class="me-section__header">
            <h3 class="me-section__title" v-i18n>Account</h3>
          </div>

          <div class="me-card me-account-card">
            <div class="me-account-card__grid">
              <div class="me-account-item">
                <span class="me-account-item__label" v-i18n>Username</span>
                <span class="me-account-item__value">{{ userName }}</span>
              </div>
              <div class="me-account-item" v-if="vipDate">
                <span class="me-account-item__label" v-i18n>Potato Expires</span>
                <span class="me-account-item__value me-account-item__value--vip">{{ vipDate }}</span>
              </div>
              <div class="me-account-item" v-if="createtime">
                <span class="me-account-item__label" v-i18n>Joined</span>
                <span class="me-account-item__value">{{ formattedJoinDate }}</span>
              </div>
              <div class="me-account-item" v-if="userRank.userId !== ''">
                <span class="me-account-item__label" v-i18n>Rank Tier</span>
                <div class="me-account-item__value">
                  <RankBadge :rankTier="getTier()" :showName="true" :vertical="false"/>
                </div>
              </div>
              <div class="me-account-item" v-else>
                <span class="me-account-item__label" v-i18n>Rank Status</span>
                <button class="me-btn-secondary" @click="activateRank" v-i18n>Activate Rank</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Section -->
        <div v-else-if="activeSection === 'stats'" class="me-section">
          <div class="me-section__header">
            <h3 class="me-section__title" v-i18n>Game Stats</h3>
          </div>

          <div class="me-card" v-if="gameStats">
            <UserGameStats
              :allTime="gameStats.allTime"
              :recent3Months="gameStats.recent3Months"
            />
          </div>
          <div v-else-if="statsLoading" class="me-card me-card--loading">
            <div class="me-loading" v-i18n>Loading stats...</div>
          </div>
        </div>

        <!-- Settings Section -->
        <div v-else-if="activeSection === 'settings'" class="me-section">
          <div class="me-section__header">
            <h3 class="me-section__title" v-i18n>Settings</h3>
          </div>

          <div class="me-card me-settings-card">
            <confirm-dialog
              message="开启后其他玩家可以通过你的游戏链接查看你的手牌，但不能帮你操作"
              ref="showHand"
              @accept="confimUpdate"
              @dismiss="cancelUpdate"
            />
            <div class="me-settings-list">
              <label class="me-setting-item">
                <div class="me-setting-item__info">
                  <span class="me-setting-item__icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                  </span>
                  <span class="me-setting-item__label" v-i18n>Sound notifications</span>
                </div>
                <div class="me-toggle">
                  <input type="checkbox" v-model="enable_sounds" @change="updateTips" class="me-toggle__input">
                  <span class="me-toggle__slider"></span>
                </div>
              </label>
              <label class="me-setting-item">
                <div class="me-setting-item__info">
                  <span class="me-setting-item__icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="9" y1="3" x2="9" y2="21"></line>
                    </svg>
                  </span>
                  <span class="me-setting-item__label" v-i18n>Show cards in hand to others</span>
                </div>
                <div class="me-toggle">
                  <input type="checkbox" v-model="showhandcards" @change="updateShowHandCards" class="me-toggle__input">
                  <span class="me-toggle__slider"></span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Games Section -->
        <div v-else-if="activeSection === 'games'" class="me-section">
          <div class="me-section__header">
            <h3 class="me-section__title" v-i18n>My Games</h3>
            <span class="me-section__count">{{ games.length }}</span>
          </div>

          <div class="me-card me-games-card">
            <div v-if="games.length === 0" class="me-games-empty">
              <span v-i18n>No games yet</span>
            </div>
            <div v-else class="me-games-list">
              <div v-for="game in games" :key="game.id" class="me-game-item">
                <div class="me-game-item__main">
                  <span class="me-game-item__date">{{ game.createtime.slice(0, 16) }}</span>
                  <span class="me-game-item__players">{{ game.players.length }}P</span>
                </div>
                <div class="me-game-item__members">
                  <span
                    v-for="player in game.players"
                    :key="player.id"
                    class="me-game-item__player"
                    :class="'player_bg_color_'+ player.color"
                  >
                    <a :href="'/player?id=' + player.id">{{ player.name }}</a>
                  </span>
                </div>
                <div class="me-game-item__status">
                  <span v-if="isGameAbandon(game.phase)" class="me-status me-status--muted">Abandon</span>
                  <span v-else-if="isGameTimeOut(game.phase)" class="me-status me-status--danger">Timeout</span>
                  <a v-else-if="isGameEnd(game.phase)" :href="'/game?id='+game.id" target="_blank" class="me-status me-status--muted" v-i18n>Ended</a>
                  <a v-else :href="'/game?id='+game.id" target="_blank" class="me-status me-status--success" v-i18n>Running</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {Phase} from '@/common/Phase';
import {getPreferences} from '@/client/utils/PreferencesManager';
import ConfirmDialog from '@/client/components/common/ConfirmDialog.vue';
import RankBadge from '@/client/components/common/RankBadge.vue';
import UserGameStats from '@/client/components/common/UserGameStats.vue';
import {UserRank} from '@/common/rank/RankManager';
import {DEFAULT_MU, DEFAULT_RANK_VALUE, DEFAULT_SIGMA} from '@/common/rank/constants';
import {showError} from '@/client/utils/showAlert';
import {userService} from '@/client/services';
import {userStore, preferencesStore} from '@/client/stores';

export default Vue.extend({
  name: 'MePage',
  components: {
    'confirm-dialog': ConfirmDialog,
    RankBadge,
    UserGameStats,
  },
  data() {
    return {
      userId: '' as string,
      userName: '' as string,
      games: [] as Array<any>,
      vipDate: '' as string,
      createtime: '' as string,
      enable_sounds: false,
      showhandcards: false,
      userRank: new UserRank('', DEFAULT_RANK_VALUE, DEFAULT_MU, DEFAULT_SIGMA, 0),
      gameStats: null as any,
      statsLoading: false,
      activeSection: 'account' as string,
      navItems: [
        {
          id: 'account',
          label: 'Account',
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
        },
        {
          id: 'stats',
          label: 'Stats',
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
        },
        {
          id: 'games',
          label: 'Games',
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M6 12h4m-2-2v4m7-1h.01M17 11h.01"></path></svg>',
        },
      ],
    };
  },
  computed: {
    isVip(): boolean {
      return Boolean(this.vipDate);
    },
    avatarLetter(): string {
      return this.userName ? this.userName.charAt(0).toUpperCase() : '?';
    },
    avatarStyle(): Record<string, string> {
      const base = {
        color: '#fff',
        textShadow: '0 2px 6px rgba(0,0,0,0.4)',
      };
      if (this.isVip) {
        return {
          ...base,
          background: 'linear-gradient(135deg, #fcd34d, #f59e0b, #d97706)',
          boxShadow: '0 0 24px rgba(251,191,36,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
        };
      }
      return {
        ...base,
        background: 'linear-gradient(135deg, #e2520e, #f97316)',
        boxShadow: '0 0 16px rgba(226,82,14,0.3)',
      };
    },
    userPointsDisplay(): string {
      const points = this.userRank?.points || 0;
      return points.toLocaleString('en-US');
    },
    formattedJoinDate(): string {
      if (!this.createtime) return '';
      const date = new Date(this.createtime);
      const lang = navigator.language || 'en-US';
      return date.toLocaleDateString(lang, {year: 'numeric', month: 'long', day: 'numeric'});
    },
  },
  mounted() {
    this.userId = userStore.userId;
    this.userName = userStore.userName;
    this.enable_sounds = preferencesStore.get('enable_sounds');
    if (this.userId.length > 0) {
      this.getGames();
      this.getUserRank();
      this.getUserStats();
      this.getProfile();
    }
  },
  methods: {
    getTier() {
      return this.userRank.getTier();
    },
    getGames() {
      userService.getMyGames(this.userId)
        .then((result) => {
          if (result && result.mygames && result.mygames instanceof Array) {
            this.games = result.mygames;
            if (result.vipDate) {
              this.vipDate = result.vipDate;
            }
            this.showhandcards = result.showhandcards;
          }
        })
        .catch(() => {
          showError('Error getting games data');
        });
    },
    getUserRank() {
      if (this.userId === '') return;
      userService.getUserRankInstance(this.userId)
        .then((userRank) => {
          this.userRank = userRank;
        })
        .catch(() => {});
    },
    isGameTimeOut(gamePhase: string): boolean {
      return gamePhase === Phase.TIMEOUT;
    },
    isGameAbandon(gamePhase: string): boolean {
      return gamePhase === Phase.ABANDON;
    },
    isGameEnd(gamePhase: string): boolean {
      return gamePhase === Phase.END;
    },
    changeLogin() {
      this.userId = '';
      this.userName = '';
      this.vipDate = '';
      this.games = [];
      userStore.logout();
      window.location.href = '/';
    },
    updateTips() {
      preferencesStore.set('enable_sounds', this.enable_sounds);
    },
    updateShowHandCards() {
      if (this.showhandcards) {
        (this.$refs['showHand'] as any).show();
      } else {
        this.confimUpdate();
      }
    },
    cancelUpdate() {
      this.showhandcards = false;
    },
    confimUpdate() {
      const userId = userStore.userId;
      if (userId === undefined || userId === '') return;
      userService.updateShowHandCards(userId, this.showhandcards)
        .catch((error: any) => {
          showError(error);
        });
    },
    getUserStats() {
      if (!this.userId) return;
      this.statsLoading = true;
      userService.getUserProfile(this.userId)
        .then((data) => {
          if (data && data.gameStats) {
            this.gameStats = data.gameStats;
          }
        })
        .catch((err: any) => {
          console.warn('Failed to load user stats:', err);
        })
        .finally(() => {
          this.statsLoading = false;
        });
    },
    activateRank() {
      const userId = userStore.userId;
      if (userId === undefined || userId === '') return;
      userService.activateRankInstance(userId)
        .then((userRank) => {
          this.userRank = userRank;
        })
        .catch((error: any) => {
          showError(error);
        });
    },
    getProfile() {
      if (!this.userId) return;
      userService.getUserProfile(this.userId)
        .then((data) => {
          if (data) {
            this.createtime = data.createtime || '';
          }
        })
        .catch((err: any) => {
          console.warn('Failed to load user profile:', err);
        });
    },
  },
});
</script>

<style scoped>
.me-page {
    background-color: #0a0e1a;
    background-image:
    radial-gradient(ellipse at 50% -10%, rgba(226,82,14,0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 90%, rgba(34,211,238,0.05) 0%, transparent 40%),
    linear-gradient(rgba(38,48,80,0.25) 1px, transparent 1px),
    linear-gradient(90deg, rgba(38,48,80,0.25) 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 40px 40px, 40px 40px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.me-container {
    display: flex;
    flex: 1;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    min-height: 0;
    overflow: hidden;
}

/* ============ SIDEBAR ============ */
.me-sidebar {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  padding: 20px 16px;
  background: linear-gradient(180deg, rgba(17,26,46,0.6) 0%, rgba(10,14,26,0.8) 100%);
  border-right: 1px solid rgba(38,48,80,0.5);
}

.me-user-card {
  position: relative;
  padding: 16px 12px;
  background: linear-gradient(135deg, rgba(17,26,46,0.95) 0%, rgba(26,37,64,0.85) 100%);
  border: 1px solid rgba(38,48,80,0.6);
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.me-user-card--vip {
  border-color: rgba(251,191,36,0.4);
  background: linear-gradient(135deg, rgba(17,26,46,0.95) 0%, rgba(30,25,15,0.9) 100%);
}

.me-user-card__glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 50%);
  animation: vipGlow 4s ease-in-out infinite;
}

@keyframes vipGlow {
  0%, 100% { transform: translate(0, 0); opacity: 0.5; }
  50% { transform: translate(10%, 10%); opacity: 1; }
}

.me-user-card__avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 800;
  margin: 0 auto 12px;
  position: relative;
  z-index: 1;
}

.me-user-card__info {
  text-align: center;
  position: relative;
  z-index: 1;
}

.me-user-card__name {
  font-size: 18px;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 6px;
}

.me-user-card__name--vip {
  background: linear-gradient(135deg, #fcd34d, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 8px rgba(251,191,36,0.4));
}

.me-user-card__badge {
  margin-bottom: 8px;
}

.me-vip-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  background: linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.15));
  border: 1px solid rgba(251,191,36,0.4);
  border-radius: 12px;
  font-size: 10px;
  font-weight: 800;
  color: #fbbf24;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.me-user-card__rank {
  display: flex;
  justify-content: center;
}

.me-user-card__points {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(38,48,80,0.4);
  position: relative;
  z-index: 1;
}

.me-points-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  background: linear-gradient(135deg, rgba(226,82,14,0.12), rgba(249,115,22,0.08));
  border: 1px solid rgba(226,82,14,0.3);
  border-radius: 6px;
}

.me-points-display--vip {
  background: linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.1));
  border-color: rgba(251,191,36,0.4);
}

.me-points-display__value {
  font-size: 22px;
  font-weight: 800;
  font-family: monospace;
  color: #fb923c;
}

.me-points-display--vip .me-points-display__value {
  color: #fbbf24;
  text-shadow: 0 0 12px rgba(251,191,36,0.5);
}

.me-points-display__label {
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.15em;
}

/* ============ NAVIGATION ============ */
.me-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 0;
  overflow-y: auto;
}

.me-nav__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.me-nav__item:hover {
  background: rgba(26,37,64,0.5);
}

.me-nav__item--active {
  background: rgba(226,82,14,0.12);
}

.me-nav__item--active .me-nav__icon {
  color: #e2520e;
}

.me-nav__item--active .me-nav__label {
  color: #f1f5f9;
}

.me-nav__icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: color 0.2s ease;
}

.me-nav__label {
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  transition: color 0.2s ease;
}

/* VIP page - golden accents */
.me-page--vip .me-nav__item--active {
  background: rgba(251,191,36,0.1);
}

.me-page--vip .me-nav__item--active .me-nav__icon {
  color: #fbbf24;
}

/* Sidebar footer */
.me-sidebar__footer {
  padding-top: 12px;
  border-top: 1px solid rgba(38,48,80,0.4);
  margin-top: 12px;
  flex-shrink: 0;
}

.me-logout-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 14px;
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.2);
  border-radius: 6px;
  color: #f87171;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.me-logout-btn:hover {
  background: rgba(239,68,68,0.15);
  border-color: rgba(239,68,68,0.4);
}

/* ============ CONTENT AREA ============ */
.me-content {
  flex: 1;
  padding: 24px;
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
}

.me-section {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.me-section__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.me-section__title {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #94a3b8;
  font-family: monospace;
}

.me-section__count {
  padding: 2px 8px;
  background: rgba(226,82,14,0.15);
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  color: #fb923c;
  font-family: monospace;
}

/* ============ CARDS ============ */
.me-card {
  background: linear-gradient(135deg, rgba(17,26,46,0.98) 0%, rgba(26,37,64,0.9) 100%);
  border: 1px solid rgba(38,48,80,0.6);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.me-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, #e2520e, rgba(226,82,14,0.3), transparent);
}

.me-card--loading {
  padding: 40px;
  text-align: center;
}

.me-loading {
  font-size: 13px;
  color: #64748b;
  font-family: monospace;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Account card */
.me-account-card {
  padding: 20px;
}

.me-account-card__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.me-account-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.me-account-item__label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #64748b;
  font-family: monospace;
}

.me-account-item__value {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #f1f5f9;
}

.me-account-item__value--vip {
  color: #fbbf24;
}

/* Settings card */
.me-settings-card {
  padding: 4px 0;
}

.me-settings-list {
  display: flex;
  flex-direction: column;
}

.me-setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.me-setting-item:hover {
  background: rgba(26,37,64,0.4);
}

.me-setting-item__info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.me-setting-item__icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.me-setting-item__label {
  font-size: 14px;
  color: #cbd5e1;
}

/* Toggle switch */
.me-toggle {
  position: relative;
  width: 44px;
  height: 24px;
}

.me-toggle__input {
  opacity: 0;
  width: 0;
  height: 0;
}

.me-toggle__slider {
  position: absolute;
  inset: 0;
  background: rgba(38,48,80,0.8);
  border: 1px solid rgba(38,48,80,0.6);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.me-toggle__slider::before {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  left: 2px;
  top: 2px;
  background: #64748b;
  border-radius: 50%;
  transition: all 0.25s ease;
}

.me-toggle__input:checked + .me-toggle__slider {
  background: rgba(226,82,14,0.2);
  border-color: rgba(226,82,14,0.5);
}

.me-toggle__input:checked + .me-toggle__slider::before {
  transform: translateX(20px);
  background: #e2520e;
  box-shadow: 0 0 8px rgba(226,82,14,0.5);
}

/* Games card */
.me-games-card {
  padding: 8px 0;
}

.me-games-empty {
  padding: 40px;
  text-align: center;
  color: #64748b;
  font-family: monospace;
  font-size: 13px;
}

.me-games-list {
  display: flex;
  flex-direction: column;
}

.me-game-item {
  display: grid;
  grid-template-columns: 140px 1fr auto;
  gap: 16px;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(38,48,80,0.3);
  transition: background 0.2s ease;
}

.me-game-item:last-child {
  border-bottom: none;
}

.me-game-item:hover {
  background: rgba(26,37,64,0.3);
}

.me-game-item__main {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.me-game-item__date {
  font-size: 12px;
  font-family: monospace;
  color: #94a3b8;
}

.me-game-item__players {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
}

.me-game-item__members {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.me-game-item__player {
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
}

.me-game-item__player a {
  color: #f1f5f9;
  text-decoration: none;
  transition: color 0.2s ease;
}

.me-game-item__player a:hover {
  color: #fff;
}

.me-game-item__status {
  display: flex;
  justify-content: flex-end;
}

/* Status badges */
.me-status {
  display: inline-block;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  font-family: monospace;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 3px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.me-status--muted {
  background: rgba(38,48,80,0.6);
  color: #94a3b8;
  border: 1px solid rgba(38,48,80,0.5);
}

.me-status--danger {
  background: rgba(239,68,68,0.12);
  color: #ef4444;
  border: 1px solid rgba(239,68,68,0.3);
}

.me-status--success {
  background: rgba(45,212,191,0.12);
  color: #2dd4bf;
  border: 1px solid rgba(45,212,191,0.3);
}

.me-status--success:hover {
  background: rgba(45,212,191,0.2);
}

/* Empty state */
.me-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  text-align: center;
}

.me-empty__icon {
  font-size: 64px;
  opacity: 0.3;
  margin-bottom: 16px;
}

.me-empty__text {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 20px;
}

.me-btn-primary {
  display: inline-block;
  padding: 12px 28px;
  background: linear-gradient(135deg, #e2520e, #f97316);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-decoration: none;
  border-radius: 6px;
  box-shadow: 0 0 16px rgba(226,82,14,0.3);
  transition: all 0.2s ease;
}

.me-btn-primary:hover {
  box-shadow: 0 0 24px rgba(226,82,14,0.45);
  transform: translateY(-1px);
}

.me-btn-secondary {
  padding: 8px 16px;
  background: rgba(26,37,64,0.6);
  border: 1px solid rgba(38,48,80,0.6);
  border-radius: 4px;
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.me-btn-secondary:hover {
  background: rgba(226,82,14,0.1);
  border-color: rgba(226,82,14,0.4);
  color: #f1f5f9;
}

/* ============ MOBILE NAV ============ */
.me-mobile-nav {
  display: none;
  position: fixed;
  bottom: 32px;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, rgba(17,26,46,0.98) 0%, rgba(10,14,26,0.99) 100%);
  border-top: 1px solid rgba(38,48,80,0.5);
  padding: 8px 12px;
  padding-bottom: max(8px, env(safe-area-inset-bottom));
  z-index: 50;
}

.me-mobile-nav__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  background: none;
  border: none;
  cursor: pointer;
}

.me-mobile-nav__icon {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: color 0.2s ease;
}

.me-mobile-nav__item--active .me-mobile-nav__icon {
  color: #e2520e;
}

.me-mobile-nav__label {
  font-size: 10px;
  font-weight: 600;
  color: #64748b;
  transition: color 0.2s ease;
}

.me-mobile-nav__item--active .me-mobile-nav__label {
  color: #f1f5f9;
}

/* ============ RESPONSIVE ============ */
@media (max-width: 768px) {
  .me-sidebar {
    display: none;
  }

  .me-mobile-nav {
    display: flex;
  }

  .me-content {
    padding: 16px;
    padding-bottom: 120px;
  }

  .me-account-card__grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .me-game-item {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .me-game-item__status {
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .me-content {
    padding: 12px;
    padding-bottom: 110px;
  }

  .me-section__title {
    font-size: 12px;
  }

  .me-setting-item {
    padding: 14px 16px;
  }

  .me-setting-item__label {
    font-size: 13px;
  }

  .me-game-item {
    padding: 12px 16px;
  }
}
</style>
