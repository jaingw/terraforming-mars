<template>
  <div class="profile-page" :class="{ 'profile-page--vip': isVip }">
    <div class="profile-container">
      <!-- Loading State -->
      <div v-if="loading" class="profile-loading">
        <div class="profile-loading__spinner"></div>
        <span v-i18n>Loading profile...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="profile-error">
        <div class="profile-error__icon">&#9888;</div>
        <div class="profile-error__message">{{ error }}</div>
        <a href="/" class="profile-btn" v-i18n>Back to Home</a>
      </div>

      <!-- Profile Content -->
      <template v-else-if="profile">
        <!-- Profile Header Card -->
        <div class="profile-header" :class="{ 'profile-header--vip': isVip }">
          <div class="profile-header__glow" v-if="isVip"></div>
          <div class="profile-header__bg"></div>

          <div class="profile-header__content">
            <!-- Avatar -->
            <div class="profile-avatar" :style="avatarStyle" :class="{ 'profile-avatar--vip': isVip }">
              {{ avatarLetter }}
              <div class="profile-avatar__ring" v-if="isVip"></div>
            </div>

            <!-- User Info -->
            <div class="profile-info">
              <div class="profile-info__top">
                <h1 class="profile-info__name" :class="{ 'profile-info__name--vip': isVip }">
                  {{ profile.name }}
                </h1>
                <span v-if="isVip" class="profile-vip-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                  VIP
                </span>
              </div>

              <!-- Rank Display -->
              <div class="profile-info__rank" v-if="profile.rank">
                <RankBadge :rankTier="rankTierObj" :showName="true" :vertical="true"/>
              </div>
              <div class="profile-info__unranked" v-else v-i18n>Unranked</div>

              <!-- Join Date -->
              <div class="profile-info__joined" v-if="profile.createtime">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span v-i18n>Joined</span> {{ formattedJoinDate }}
              </div>
            </div>
          </div>

          <!-- Corner accents -->
          <div class="profile-header__corner profile-header__corner--tl"></div>
          <div class="profile-header__corner profile-header__corner--br"></div>
        </div>

        <!-- Stats Overview -->
        <div class="profile-stats">
          <div class="profile-stat" :class="{ 'profile-stat--highlight': allTimeWinRate >= 50 }">
            <div class="profile-stat__value">
              {{ profile.totalGames }}
            </div>
            <div class="profile-stat__label" v-i18n>Games</div>
          </div>
          <div class="profile-stat" :class="winRateClass">
            <div class="profile-stat__value">
              {{ allTimeWinRate }}<span class="profile-stat__unit">%</span>
            </div>
            <div class="profile-stat__label" v-i18n>Win Rate</div>
          </div>
          <div class="profile-stat" :class="fleeRateClass">
            <div class="profile-stat__value">
              {{ allTimeFleeRate }}<span class="profile-stat__unit">%</span>
            </div>
            <div class="profile-stat__label" v-i18n>Flee Rate</div>
          </div>
          <div class="profile-stat profile-stat--rank" v-if="profile.rank">
            <div class="profile-stat__rank-badge">
              <RankBadge :rankTier="rankTierObj" :showName="true" :vertical="false"/>
            </div>
          </div>
          <div class="profile-stat" v-else>
            <div class="profile-stat__value profile-stat__value--muted">&mdash;</div>
            <div class="profile-stat__label" v-i18n>Tier</div>
          </div>
        </div>

        <!-- Game Stats Section -->
        <div class="profile-section" v-if="profile.gameStats">
          <div class="profile-section__header">
            <span class="profile-section__icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </span>
            <h2 class="profile-section__title" v-i18n>Game Statistics</h2>
          </div>
          <div class="profile-card">
            <UserGameStats
              :allTime="profile.gameStats.allTime"
              :recent3Months="profile.gameStats.recent3Months"
            />
          </div>
        </div>

      </template>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {RankTier} from '@/common/rank/RankTier';
import RankBadge from '@/client/components/common/RankBadge.vue';
import UserGameStats from '@/client/components/common/UserGameStats.vue';
import {userService, UserProfile as IProfile} from '@/client/services';

export default Vue.extend({
  name: 'UserProfile',
  components: {
    RankBadge,
    UserGameStats,
  },
  props: {
    identifier: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      loading: true,
      error: '' as string,
      profile: null as IProfile | null,
    };
  },
  computed: {
    formattedJoinDate(): string {
      if (!this.profile?.createtime) return '';
      const date = new Date(this.profile.createtime);
      const lang = navigator.language || 'en-US';
      return date.toLocaleDateString(lang, {year: 'numeric', month: 'long', day: 'numeric'});
    },
    isVip(): boolean {
      return this.profile ? this.profile.isvip > 0 : false;
    },
    avatarLetter(): string {
      return this.profile ? this.profile.name.charAt(0).toUpperCase() : '?';
    },
    avatarStyle(): Record<string, string> {
      if (this.isVip) {
        return {
          background: 'linear-gradient(135deg, #fcd34d, #f59e0b, #d97706)',
          boxShadow: '0 0 32px rgba(251,191,36,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
          color: '#fff',
          textShadow: '0 2px 6px rgba(0,0,0,0.4)',
        };
      }
      return {
        background: 'linear-gradient(135deg, #e2520e, #f97316)',
        boxShadow: '0 0 20px rgba(226,82,14,0.35)',
        color: '#fff',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
      };
    },
    rankTierObj(): RankTier | null {
      if (!this.profile?.rank) return null;
      const t = this.profile.rank.tier;
      return new RankTier(
        t.name as any,
        t.measurement as 'star' | 'value',
        t.maxStars,
        t.stars,
        t.value,
      );
    },
    allTimeWinRate(): number {
      return this.profile?.gameStats?.allTime?.winRate ?? 0;
    },
    allTimeFleeRate(): number {
      return this.profile?.gameStats?.allTime?.fleeRate ?? 0;
    },
    winRateClass(): string {
      const rate = this.allTimeWinRate;
      if (rate >= 50) return 'profile-stat--success';
      if (rate >= 40) return 'profile-stat--warn';
      return '';
    },
    fleeRateClass(): string {
      const rate = this.allTimeFleeRate;
      if (rate > 20) return 'profile-stat--danger';
      if (rate > 10) return 'profile-stat--warn';
      return '';
    },
  },
  mounted() {
    this.fetchProfile();
  },
  watch: {
    identifier() {
      this.fetchProfile();
    },
  },
  methods: {
    fetchProfile() {
      this.loading = true;
      this.error = '';
      this.profile = null;

      userService.getUserProfile(this.identifier)
        .then((data) => {
          this.profile = data;
        })
        .catch((err: Error) => {
          this.error = err.message || 'Failed to load profile';
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
});
</script>

<style scoped>
.profile-page {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  background-color: #0a0e1a;
  background-image:
    radial-gradient(ellipse at 50% -10%, rgba(226,82,14,0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 90%, rgba(34,211,238,0.05) 0%, transparent 40%),
    linear-gradient(rgba(38,48,80,0.25) 1px, transparent 1px),
    linear-gradient(90deg, rgba(38,48,80,0.25) 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 40px 40px, 40px 40px;
  padding: 24px;
}

.profile-container {
  max-width: 720px;
  margin: 0 auto;
}

/* ============ LOADING & ERROR ============ */
.profile-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 16px;
  color: #64748b;
  font-family: monospace;
  font-size: 13px;
}

.profile-loading__spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(38,48,80,0.6);
  border-top-color: #e2520e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.profile-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 12px;
  text-align: center;
}

.profile-error__icon {
  font-size: 48px;
  color: #ef4444;
}

.profile-error__message {
  color: #f87171;
  font-size: 14px;
  font-family: monospace;
}

.profile-btn {
  display: inline-block;
  padding: 10px 20px;
  background: linear-gradient(135deg, #e2520e, #f97316);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.profile-btn:hover {
  box-shadow: 0 0 20px rgba(226,82,14,0.4);
}

/* ============ HEADER CARD ============ */
.profile-header {
  position: relative;
  background: linear-gradient(135deg, rgba(17,26,46,0.98) 0%, rgba(26,37,64,0.9) 100%);
  border: 1px solid rgba(38,48,80,0.6);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
}

.profile-header--vip {
  border-color: rgba(251,191,36,0.35);
}

.profile-header__glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 30% 20%, rgba(251,191,36,0.1) 0%, transparent 50%);
  animation: vipShimmer 4s ease-in-out infinite;
}

@keyframes vipShimmer {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.profile-header__bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 100% 0%, rgba(226,82,14,0.08) 0%, transparent 50%);
}

.profile-header__content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 32px;
}

.profile-header__corner {
  position: absolute;
  width: 24px;
  height: 24px;
  border: 2px solid transparent;
}

.profile-header__corner--tl {
  top: 0;
  left: 0;
  border-top-color: rgba(226,82,14,0.6);
  border-left-color: rgba(226,82,14,0.6);
}

.profile-header__corner--br {
  bottom: 0;
  right: 0;
  border-bottom-color: rgba(226,82,14,0.4);
  border-right-color: rgba(226,82,14,0.4);
}

/* Avatar */
.profile-avatar {
  position: relative;
  width: 88px;
  height: 88px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 800;
  flex-shrink: 0;
}

.profile-avatar--vip {
  animation: vipPulse 3s ease-in-out infinite;
}

@keyframes vipPulse {
  0%, 100% { box-shadow: 0 0 32px rgba(251,191,36,0.5); }
  50% { box-shadow: 0 0 48px rgba(251,191,36,0.7); }
}

.profile-avatar__ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid rgba(251,191,36,0.5);
  animation: ringRotate 8s linear infinite;
}

@keyframes ringRotate {
  to { transform: rotate(360deg); }
}

/* Info */
.profile-info {
  flex: 1;
  min-width: 0;
}

.profile-info__top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.profile-info__name {
  font-size: 28px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
}

.profile-info__name--vip {
  background: linear-gradient(135deg, #fcd34d, #f59e0b, #d97706);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 10px rgba(251,191,36,0.4));
}

.profile-vip-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.15));
  border: 1px solid rgba(251,191,36,0.4);
  border-radius: 12px;
  font-size: 11px;
  font-weight: 800;
  color: #fbbf24;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.profile-info__rank {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.profile-info__unranked {
  font-size: 13px;
  color: #64748b;
  font-family: monospace;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 8px;
}

.profile-info__joined {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
  font-family: monospace;
}

/* ============ STATS OVERVIEW ============ */
.profile-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.profile-stat {
  background: linear-gradient(135deg, rgba(17,26,46,0.95) 0%, rgba(26,37,64,0.8) 100%);
  border: 1px solid rgba(38,48,80,0.5);
  border-radius: 8px;
  padding: 20px 16px;
  text-align: center;
  transition: all 0.25s ease;
}

.profile-stat:hover {
  border-color: rgba(226,82,14,0.35);
  transform: translateY(-2px);
}

.profile-stat--success .profile-stat__value {
  color: #2dd4bf;
  text-shadow: 0 0 16px rgba(45,212,191,0.4);
}

.profile-stat--rank {
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-stat__rank-badge {
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-stat--warn .profile-stat__value {
  color: #f59e0b;
  text-shadow: 0 0 12px rgba(245,158,11,0.3);
}

.profile-stat--danger .profile-stat__value {
  color: #ef4444;
  text-shadow: 0 0 16px rgba(239,68,68,0.4);
}

.profile-stat__value {
  font-size: 28px;
  font-weight: 800;
  font-family: monospace;
  color: #f1f5f9;
  line-height: 1;
  margin-bottom: 6px;
}

.profile-stat__value--muted {
  color: #64748b;
}

.profile-stat__unit {
  font-size: 16px;
  opacity: 0.7;
}

.profile-stat__label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #64748b;
  font-family: monospace;
}

/* ============ SECTIONS ============ */
.profile-section {
  margin-bottom: 24px;
}

.profile-section__header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.profile-section__icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e2520e;
}

.profile-section__title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #94a3b8;
  font-family: monospace;
  margin: 0;
}

.profile-card {
  background: linear-gradient(135deg, rgba(17,26,46,0.98) 0%, rgba(26,37,64,0.9) 100%);
  border: 1px solid rgba(38,48,80,0.6);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.profile-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, #e2520e, rgba(226,82,14,0.3), transparent);
}

/* ============ VIP PAGE ACCENTS ============ */
.profile-page--vip .profile-stat:hover {
  border-color: rgba(251,191,36,0.4);
}

.profile-page--vip .profile-section__icon {
  color: #fbbf24;
}

.profile-page--vip .profile-card::before {
  background: linear-gradient(to right, #fbbf24, rgba(251,191,36,0.3), transparent);
}

/* ============ RESPONSIVE ============ */
@media (max-width: 640px) {
  .profile-page {
    padding: 16px;
  }

  .profile-header__content {
    flex-direction: column;
    text-align: center;
    padding: 24px 20px;
    gap: 16px;
  }

  .profile-info__top {
    justify-content: center;
  }

  .profile-info__rank {
    justify-content: center;
  }

  .profile-info__joined {
    justify-content: center;
  }

  .profile-info__name {
    font-size: 22px;
  }

  .profile-avatar {
    width: 72px;
    height: 72px;
    font-size: 28px;
  }

  .profile-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .profile-stat {
    padding: 16px 12px;
  }

  .profile-stat__value {
    font-size: 22px;
  }
}

@media (max-width: 480px) {
  .profile-page {
    padding: 12px;
  }

  .profile-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .profile-stat__label {
    font-size: 9px;
  }
}
</style>
