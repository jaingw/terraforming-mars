export const GAME_MODULES = [
  'base',
  'corpera',
  'prelude',
  'prelude2',
  'venus',
  'colonies',
  'turmoil',
  'promo',
  'breakthrough',
  'eros',
  'community',
  'ares',
  'moon',
  'pathfinders',
  'ceo',
  'starwars',
  'underworld',
  'commission', // 以后赞助的卡牌都放在这个模块里
] as const;
export type GameModule = typeof GAME_MODULES[number];

export const MODULE_NAMES: Readonly<Record<GameModule, string>> = {
  base: 'Base',
  corpera: 'Corporate Era',
  promo: 'Promo',
  venus: 'Venus Next',
  colonies: 'Colonies',
  prelude: 'Prelude',
  prelude2: 'Prelude 2',
  turmoil: 'Turmoil',
  community: 'Community',
  commission: 'Commission',
  breakthrough: 'Breakthrough',
  eros: 'Eros',
  ares: 'Ares',
  moon: 'The Moon',
  pathfinders: 'Pathfinders',
  ceo: 'CEOs',
  starwars: 'Star Wars',
  underworld: 'Underworld',
};
