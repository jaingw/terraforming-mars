<template>
  <div class="user-info-card" :class="{ 'user-info-card--highlighted': highlighted }">
    <UserInfo
      :name="name"
      :rankTier="rankTier"
      :winRate="winRate"
      :fleeRate="fleeRate"
      :avatarColor="avatarColor"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {RankTier} from '@/common/rank/RankTier';
import UserInfo from '@/client/components/common/UserInfo.vue';

export default Vue.extend({
  name: 'UserInfoCard',
  components: {
    UserInfo,
  },
  props: {
    /** User display name */
    name: {
      type: String,
      required: true,
    },
    /** Optional RankTier object */
    rankTier: {
      type: Object as () => RankTier | null,
      default: null,
    },
    /** Recent win rate as percentage (0-100). Undefined if not available. */
    winRate: {
      type: Number,
      default: undefined,
    },
    /** Escape/flee rate as percentage (0-100). Undefined if not available. */
    fleeRate: {
      type: Number,
      default: undefined,
    },
    /** Custom avatar color */
    avatarColor: {
      type: String,
      default: '',
    },
    /** Whether to show highlighted border */
    highlighted: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style scoped>
.user-info-card {
  background: linear-gradient(135deg, #182136 0%, #1f2b44 100%);
  border: 1px solid #2e3f5e;
  border-radius: 2px;
  padding: 12px 16px;
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
  position: relative;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.user-info-card:hover {
  border-color: #c2410c66;
  box-shadow: 0 0 12px rgba(194, 65, 12, 0.15);
}

.user-info-card--highlighted {
  border-color: #c2410c;
  box-shadow: 0 0 16px rgba(194, 65, 12, 0.25);
}

/* Corner accent — top-left */
.user-info-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 20px;
  height: 1px;
  background: #c2410c;
}

/* Corner accent — bottom-right */
.user-info-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 1px;
  background: #c2410c;
}
</style>
