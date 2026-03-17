import {TierName} from '@/common/rank/TierName';

const TIER_COLORS: Record<string, string> = {
  [TierName.IRON]: '#a8a29e',
  [TierName.BRONZE]: '#d4945a',
  [TierName.SILVER]: '#cbd5e1',
  [TierName.GOLD]: '#facc15',
  [TierName.PLATINUM]: '#22d3ee',
  [TierName.DIAMOND]: '#60a5fa',
  [TierName.MASTER]: '#a78bfa',
  [TierName.GRANDMASTER]: '#f87171',
  [TierName.CHALLENGER]: '#fbbf24',
};

export function getTierColor(tierName: string): string {
  return TIER_COLORS[tierName] || '#cbd5e1';
}

export function getTierGlowColor(tierName: string): string {
  const color = getTierColor(tierName);
  return `${color}40`;
}

export function getTierGradient(tierName: string): string {
  const color = getTierColor(tierName);
  return `linear-gradient(135deg, ${color}20 0%, ${color}08 100%)`;
}
