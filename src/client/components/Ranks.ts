import Vue from 'vue';
import './Ranks.css';
import {getTierColor} from '../utils/rankUtils';
import {showError} from '../utils/showAlert';
import {seasonService, rankService} from '../services';

// import {PreferencesManager} from '../utils/PreferencesManager';
import ConfirmDialog from './common/ConfirmDialog.vue';
import RankTier from '@/client/components/RankTier.vue';
import {RankTiers} from '../../common/rank/RankTiers';

const RANK_LIMIT = 100;
export const Ranks = Vue.component('ranks', {
  data: function() {
    return {
      allUserRanks: [] as any[],
      openTab: 1,
      rankTiers: RankTiers,
      seasons: [] as Array<{seasonId: string; seasonName: string; startDate: string; endDate: string}>,
      seasonList: undefined as undefined | {currentSeasonId: string; previousSeasonId?: string},
      selectedSeasonId: '',
      isCurrentSeason: true,
      isLoadingLeaderboard: false,
      leaderboardCache: {} as Record<string, {allUserRanks: any[]; isCurrentSeason: boolean}>,
    };
  },
  computed: {
    seasonInfo: function(): {seasonId: string; seasonName: string; startDate: string; endDate: string} | undefined {
      if (!this.selectedSeasonId || this.seasons.length === 0) return undefined;
      return this.seasons.find((s: any) => s.seasonId === this.selectedSeasonId);
    },
  },
  components: {
    'confirm-dialog': ConfirmDialog,
    RankTier,
  },
  mounted: function() {
    this.loadSeasonData();
  },
  methods: {
    loadSeasonData: function() {
      seasonService.getSeasonInfo()
        .then((data) => {
          this.seasons = data.seasons || [];
        })
        .catch(() => {
          showError('Error loading season info');
        });

      seasonService.getSeasonList()
        .then((data) => {
          this.seasonList = data;
          this.selectedSeasonId = data.currentSeasonId;
          this.isCurrentSeason = true;
          this.loadLeaderboard(this.selectedSeasonId);
        })
        .catch(() => {
          this.loadLegacyLeaderboard();
        });
    },
    loadLegacyLeaderboard: function() {
      rankService.getLeaderboard(RANK_LIMIT)
        .then((result) => {
          if (result && result.allUserRanks && result.allUserRanks instanceof Array) {
            this.allUserRanks = result.allUserRanks;
          }
        })
        .catch(() => {
          showError('Error getting ranking data');
        });
    },
    loadLeaderboard: function(seasonId: string) {
      if (this.leaderboardCache[seasonId]) {
        const cached = this.leaderboardCache[seasonId];
        this.allUserRanks = cached.allUserRanks;
        this.selectedSeasonId = seasonId;
        this.isCurrentSeason = cached.isCurrentSeason;
        return;
      }

      this.isLoadingLeaderboard = true;
      const querySeasonId = seasonId || (this.seasonInfo ? this.seasonInfo.seasonId : '');
      seasonService.getLeaderboard(querySeasonId, RANK_LIMIT)
        .then((result) => {
          this.isLoadingLeaderboard = false;
          if (result && result.allUserRanks && result.allUserRanks instanceof Array) {
            this.allUserRanks = result.allUserRanks;
            this.selectedSeasonId = result.seasonId || querySeasonId;
            this.isCurrentSeason = result.isCurrentSeason === true;
            this.leaderboardCache[querySeasonId] = {
              allUserRanks: result.allUserRanks,
              isCurrentSeason: result.isCurrentSeason === true,
            };
          } else {
            showError('Unexpected response fetching leaderboard from API');
          }
        })
        .catch(() => {
          this.isLoadingLeaderboard = false;
          console.log('No Ranking Data yet.');
        });
    },
    toggleTabs: function(tabNumber: number) {
      this.openTab = tabNumber;
    },
    viewPreviousSeason: function() {
      const previousSeasonId = this.seasonList?.previousSeasonId || '';
      if (!previousSeasonId) {
        return;
      }
      this.loadLeaderboard(previousSeasonId);
    },
    viewCurrentSeason: function() {
      const currentSeasonId = this.seasonList?.currentSeasonId || this.seasonInfo?.seasonId || '';
      if (!currentSeasonId) {
        return;
      }
      this.loadLeaderboard(currentSeasonId);
    },
    formatSeasonDateTime: function(isoDate: string | undefined): string {
      if (!isoDate) {
        return '';
      }
      const date = new Date(isoDate);
      return date.toLocaleString();
    },
    getDisplayRank: function(singleUserRank: any, index: number): number {
      return singleUserRank.finalPosition || index + 1;
    },
    getTierColor: function(rankTier: any): string {
      return getTierColor(rankTier.name);
    },
    getTierCardStyle: function(rankTier: any, _idx: number): Record<string, string> {
      const color = getTierColor(rankTier.name);
      return {
        background: `linear-gradient(135deg, rgba(24,33,54,0.95) 0%, rgba(31,43,68,0.8) 100%)`,
        borderColor: `${color}30`,
        borderLeftWidth: '3px',
        borderLeftColor: `${color}80`,
      };
    },
    getTierGlowStyle: function(rankTier: any): Record<string, string> {
      const color = getTierColor(rankTier.name);
      return {
        background: `radial-gradient(ellipse at 0% 50%, ${color}15 0%, transparent 70%)`,
      };
    },
  },
  created() {
  },
  template: `
    <div class="ranks-page bg-mars-void text-mars-text p-4 sm:p-6 lg:p-8"
      style="flex: 1; min-height: 0; overflow-y: auto; background-image: radial-gradient(ellipse at 50% -10%, rgba(226,82,14,0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 90%, rgba(34,211,238,0.05) 0%, transparent 40%), linear-gradient(rgba(38,48,80,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(38,48,80,0.3) 1px, transparent 1px); background-size: 100% 100%, 100% 100%, 40px 40px, 40px 40px;">
      <div class="max-w-5xl mx-auto">

        <!-- Page title -->
        <div class="flex items-center gap-3 mb-3">
          <div style="width:7px;height:7px;border-radius:50%;background:#2dd4bf;box-shadow:0 0 8px rgba(45,212,191,0.7);"></div>
          <h1 class="text-lg font-bold text-mars-text uppercase tracking-widest" v-i18n>Ranking</h1>
        </div>
        <div class="mb-3 text-xs text-mars-text-dim font-mono">
          <span class="text-mars-rust font-semibold">Season:</span>
          <span class="ml-1 text-mars-text">{{ seasonInfo ? seasonInfo.seasonName : '--' }}</span>
          <span v-if="seasonInfo" class="ml-3 text-mars-text-faint">({{ formatSeasonDateTime(seasonInfo.startDate) }} ~ {{ formatSeasonDateTime(seasonInfo.endDate) }})</span>
          <span v-if="!isCurrentSeason" class="ml-3 text-mars-yellow font-bold uppercase tracking-wider">Final Snapshot</span>
        </div>
        <div class="flex gap-2 mb-3 flex-wrap">
          <button class="flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all border border-mars-rust/30 bg-mars-deep text-mars-text-dim hover:bg-mars-rust/10 hover:border-mars-rust/60 hover:text-mars-text"
            style="border-radius:2px;"
            :class="{'bg-mars-rust/20 border-mars-rust text-mars-text': isCurrentSeason}"
            v-on:click="viewCurrentSeason" v-i18n>
            Current Season
          </button>
          <button class="flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all border border-mars-rust/30 bg-mars-deep text-mars-text-dim hover:bg-mars-rust/10 hover:border-mars-rust/60 hover:text-mars-text"
            style="border-radius:2px;"
            :class="{'bg-mars-rust/20 border-mars-rust text-mars-text': !isCurrentSeason && seasonList?.previousSeasonId}"
            v-on:click="viewPreviousSeason" v-i18n>
            Previous Season
          </button>
        </div>
        <div class="mb-6" style="height:1px;background:linear-gradient(to right,rgba(226,82,14,0.7),rgba(226,82,14,0.3) 25%,rgba(38,48,80,0.5) 55%,transparent 100%);"></div>

        <!-- Tabs -->
        <div class="flex gap-1 mb-5" style="cursor:pointer;">
          <div v-for="(tab, idx) in [{id:1, label:'Leaderboard'}, {id:2, label:'Rank Rules'}, {id:3, label:'Rank Tiers'}]"
               class="ranks-tab flex-1 text-center text-xs font-bold uppercase tracking-widest px-4 py-3 transition-all relative"
               v-on:click="toggleTabs(tab.id)"
               :key="tab.id"
               v-bind:class="{
                 'ranks-tab--active bg-mars-deep text-mars-text': openTab === tab.id,
                 'text-mars-text-dim hover:text-mars-text hover:bg-mars-deep/50': openTab !== tab.id
               }">
            <span v-i18n>{{ tab.label }}</span>
            <div v-if="openTab === tab.id" class="absolute bottom-0 left-1/2 -translate-x-1/2 w-8" style="height:2px;background:linear-gradient(to right,transparent,#c2410c,transparent);"></div>
          </div>
        </div>

        <!-- =============== TAB 1: Leaderboard =============== -->
        <div v-if="openTab === 1">
          <div v-if="isLoadingLeaderboard" class="text-center text-sm text-mars-text-dim mb-4">Loading leaderboard...</div>
          <!-- Top 3 Podium (Desktop only: hidden on small screens) -->
          <div v-if="allUserRanks.length >= 3" class="hidden sm:flex items-end justify-center gap-3 mb-6 px-4">
            <!-- #2 Silver -->
            <div class="ranks-podium ranks-podium--silver flex-1 max-w-[200px]">
              <div class="ranks-podium__crown text-center mb-2">
                <span class="text-3xl" style="filter:drop-shadow(0 0 8px rgba(203,213,225,0.5));">&#9733;</span>
              </div>
              <div class="ranks-podium__card relative p-4 text-center" style="background:linear-gradient(180deg,rgba(203,213,225,0.12) 0%,rgba(17,26,46,0.95) 100%);border:1px solid rgba(203,213,225,0.3);clip-path:polygon(0 8px,8px 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%);box-shadow:0 4px 20px rgba(0,0,0,0.4);">
                <div class="text-xs font-mono text-mars-text-dim uppercase tracking-widest mb-1">#{{ getDisplayRank(allUserRanks[1], 1) }}</div>
                <a :href="'/user/' + encodeURIComponent(allUserRanks[1].userName)" class="block text-sm font-bold text-mars-text truncate mb-1 hover:text-mars-cyan transition-colors">{{ allUserRanks[1].userName }}</a>
                <div class="flex justify-center"><RankTier :rankTier="allUserRanks[1].userTier" :showNumber="false"/></div>
              </div>
              <div style="height:60px;background:linear-gradient(180deg,rgba(203,213,225,0.15),rgba(203,213,225,0.02));border-left:1px solid rgba(203,213,225,0.2);border-right:1px solid rgba(203,213,225,0.2);"></div>
            </div>

            <!-- #1 Gold -->
            <div class="ranks-podium ranks-podium--gold flex-1 max-w-[220px]">
              <div class="ranks-podium__crown text-center mb-2">
                <span class="text-4xl" style="filter:drop-shadow(0 0 12px rgba(250,204,21,0.6));">&#9813;</span>
              </div>
              <div class="ranks-podium__card relative p-5 text-center" style="background:linear-gradient(180deg,rgba(250,204,21,0.12) 0%,rgba(17,26,46,0.95) 100%);border:1px solid rgba(250,204,21,0.4);clip-path:polygon(0 10px,10px 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%);box-shadow:0 0 28px rgba(250,204,21,0.12);">
                <div class="text-xs font-mono text-mars-yellow uppercase tracking-widest mb-1" style="text-shadow:0 0 8px rgba(250,204,21,0.4);">#{{ getDisplayRank(allUserRanks[0], 0) }}</div>
                <a :href="'/user/' + encodeURIComponent(allUserRanks[0].userName)" class="block text-base font-bold text-mars-text truncate mb-1 hover:text-mars-cyan transition-colors">{{ allUserRanks[0].userName }}</a>
                <div class="flex justify-center"><RankTier :rankTier="allUserRanks[0].userTier" :showNumber="false"/></div>
              </div>
              <div style="height:80px;background:linear-gradient(180deg,rgba(250,204,21,0.12),rgba(250,204,21,0.02));border-left:1px solid rgba(250,204,21,0.25);border-right:1px solid rgba(250,204,21,0.25);"></div>
            </div>

            <!-- #3 Bronze -->
            <div class="ranks-podium ranks-podium--bronze flex-1 max-w-[200px]">
              <div class="ranks-podium__crown text-center mb-2">
                <span class="text-3xl" style="filter:drop-shadow(0 0 8px rgba(212,148,90,0.5));">&#9733;</span>
              </div>
              <div class="ranks-podium__card relative p-4 text-center" style="background:linear-gradient(180deg,rgba(212,148,90,0.12) 0%,rgba(17,26,46,0.95) 100%);border:1px solid rgba(212,148,90,0.3);clip-path:polygon(0 8px,8px 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%);box-shadow:0 4px 20px rgba(0,0,0,0.4);">
                <div class="text-xs font-mono text-mars-amber uppercase tracking-widest mb-1">#{{ getDisplayRank(allUserRanks[2], 2) }}</div>
                <a :href="'/user/' + encodeURIComponent(allUserRanks[2].userName)" class="block text-sm font-bold text-mars-text truncate mb-1 hover:text-mars-cyan transition-colors">{{ allUserRanks[2].userName }}</a>
                <div class="flex justify-center"><RankTier :rankTier="allUserRanks[2].userTier" :showNumber="false"/></div>
              </div>
              <div style="height:40px;background:linear-gradient(180deg,rgba(212,148,90,0.12),rgba(212,148,90,0.02));border-left:1px solid rgba(212,148,90,0.2);border-right:1px solid rgba(212,148,90,0.2);"></div>
            </div>
          </div>

          <!-- Top 3 List (Mobile only: hidden on sm and above) -->
          <div v-if="allUserRanks.length >= 3" class="sm:hidden mb-4 space-y-2">
            <div v-for="idx in [0, 1, 2]" :key="'top-' + idx"
              class="flex items-center gap-3 px-3 py-2.5 bg-mars-deep border border-mars-border/50 rounded">
              <div class="w-8 h-8 flex items-center justify-center text-xs font-bold font-mono rounded flex-shrink-0"
                :style="idx === 0 ? 'background:rgba(250,204,21,0.15);color:#facc15;border:1px solid rgba(250,204,21,0.3);' :
                         idx === 1 ? 'background:rgba(203,213,225,0.1);color:#cbd5e1;border:1px solid rgba(203,213,225,0.25);' :
                                     'background:rgba(212,148,90,0.1);color:#d4945a;border:1px solid rgba(212,148,90,0.25);'">
                #{{ getDisplayRank(allUserRanks[idx], idx) }}
              </div>
              <a :href="'/user/' + encodeURIComponent(allUserRanks[idx].userName)"
                class="flex-1 min-w-0 text-sm font-bold text-mars-text truncate hover:text-mars-cyan transition-colors" style="text-decoration:none;">
                {{ allUserRanks[idx].userName }}
              </a>
              <div class="flex-shrink-0">
                <RankTier :rankTier="allUserRanks[idx].userTier" :showNumber="false"/>
              </div>
            </div>
          </div>

          <!-- Rest of ranking table -->
          <div class="ranks-panel bg-mars-deep border border-mars-border p-5"
            style="clip-path:polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px));">
            <div class="overflow-x-auto">
              <table class="w-full text-sm text-left">
                <thead>
                  <tr class="border-b border-mars-border">
                    <th class="py-3 px-3 w-16 text-xs uppercase tracking-wider text-mars-text-faint font-mono" v-i18n>Rank</th>
                    <th class="py-3 px-3 text-xs uppercase tracking-wider text-mars-text-faint font-mono" v-i18n>User Name</th>
                    <th class="py-3 px-3 text-xs uppercase tracking-wider text-mars-text-faint font-mono" v-i18n>Tier</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(singleUserRank, index) in allUserRanks"
                      v-if="index >= 3"
                      class="border-b border-mars-border/30 transition-colors"
                      v-bind:class="{'hover:bg-mars-surface/40': true}">
                    <td class="py-2.5 px-3">
                      <div class="w-7 h-7 text-center text-sm font-mono text-mars-text-dim leading-7">{{ getDisplayRank(singleUserRank, index) }}</div>
                    </td>
                    <td class="py-2.5 px-3 text-mars-text font-medium"><a :href="'/user/' + encodeURIComponent(singleUserRank.userName)" class="hover:text-mars-cyan transition-colors hover:underline">{{ singleUserRank.userName }}</a></td>
                    <td class="py-2.5 px-3"><RankTier :rankTier="singleUserRank.userTier" :showNumber="false"/></td>
                  </tr>
                </tbody>
              </table>
              <div v-if="allUserRanks.length <= 3" class="text-center py-8 text-mars-text-faint text-sm font-mono uppercase tracking-wider" v-i18n>No additional rankings</div>
            </div>
          </div>
        </div>

        <!-- =============== TAB 2: Rank Rules =============== -->
        <div v-if="openTab === 2">
          <div class="ranks-panel bg-mars-deep border border-mars-border p-6"
            style="clip-path:polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px));">
            <div class="text-xs uppercase tracking-widest text-mars-rust font-mono font-bold mb-4" v-i18n>Star Change per Placement</div>
            <div class="space-y-3">
              <div v-for="p in ['2','3','4','5']" class="ranks-rule-row flex items-start gap-4 p-3 rounded-sm transition-colors hover:bg-mars-surface/30" style="border-left:2px solid rgba(226,82,14,0.5);">
                <span class="inline-flex items-center justify-center w-10 h-10 flex-shrink-0 text-sm font-bold font-mono"
                  style="background:linear-gradient(135deg,rgba(226,82,14,0.2),rgba(226,82,14,0.05));color:#f97316;clip-path:polygon(0 4px,4px 0,calc(100% - 4px) 0,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0 calc(100% - 4px));">
                  {{p}}P
                </span>
                <div class="text-sm text-mars-text-dim pt-2 leading-relaxed">
                  <span v-if="p==='2'" v-i18n>First player + 1, second player -1.</span>
                  <span v-if="p==='3'" v-i18n>First player + 1, second player +0, third player -1.</span>
                  <span v-if="p==='4'" v-i18n>First player + 2, second player +1, third player +0, fourth player -1.</span>
                  <span v-if="p==='5'" v-i18n>First player + 2, second player +1, third player +0, fourth player -1, fifth player -2.</span>
                </div>
              </div>
            </div>

            <div class="mt-6 p-3 text-xs text-mars-text-dim font-mono" style="border:1px dashed rgba(38,48,80,0.7);background:rgba(10,14,26,0.5);">
              <span class="text-mars-cyan">&#9432;</span>
              <span class="ml-2" v-i18n>Iron, Bronze, Silver tier players will not lose stars on demotion.</span>
            </div>
          </div>
        </div>

        <!-- =============== TAB 3: Rank Tiers =============== -->
        <div v-if="openTab === 3">
          <div class="ranks-tiers-grid">
            <div v-for="(rankTier, idx) in rankTiers"
                 class="ranks-tier-card relative overflow-hidden transition-all"
                 :key="rankTier.name"
                 :style="getTierCardStyle(rankTier, idx)">

              <!-- Background glow -->
              <div class="absolute inset-0 opacity-20" :style="getTierGlowStyle(rankTier)"></div>

              <!-- Content -->
              <div class="relative z-10 flex items-center gap-4 p-4">
                <!-- Tier icon -->
                <div class="flex-shrink-0 flex items-center justify-center" style="min-width:50px;">
                  <RankTier :rankTier="rankTier" :showNumber="false"/>
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-0.5">
                    <span class="text-sm font-bold uppercase tracking-wider" :style="'color:' + getTierColor(rankTier)" v-i18n>{{ rankTier.name }}</span>
                    <span v-if="rankTier.measurement==='star'" class="text-xs font-mono text-mars-text-faint">{{ rankTier.maxStars }} &#9733;</span>
                    <span v-else class="text-xs font-mono" style="color:#06b6d4;">SCORE</span>
                  </div>
                  <div class="text-xs text-mars-text-dim leading-relaxed">
                    <span v-if="rankTier.measurement==='value'">
                      最高段位 · <a href="https://www.microsoft.com/en-us/research/project/trueskill-ranking-system/" class="text-mars-cyan hover:underline">TrueSkill</a> 算法排名
                    </span>
                    <span v-else-if="rankTier.maxStars<=3" v-i18n>Protected — no star loss on defeat</span>
                    <span v-else v-i18n>Stars can be lost on defeat</span>
                  </div>
                </div>

                <!-- Tier level indicator -->
                <div class="flex-shrink-0 flex flex-col items-center">
                  <div class="text-xs font-mono text-mars-text-faint uppercase tracking-widest">Lv</div>
                  <div class="text-lg font-bold font-mono" :style="'color:' + getTierColor(rankTier)">{{ idx + 1 }}</div>
                </div>
              </div>

              <!-- Bottom accent bar -->
              <div class="absolute bottom-0 left-0 right-0 h-px" :style="'background:linear-gradient(to right,transparent,' + getTierColor(rankTier) + '40,' + getTierColor(rankTier) + '40,transparent);'"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
});

