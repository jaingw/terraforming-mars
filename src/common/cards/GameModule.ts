export const GAME_MODULES = ['base', 'corpera', 'prelude', 'venus', 'colonies', 'turmoil', 'promo', 'breakthrough', 'eros', 'community', 'ares', 'moon', 'pathfinders', 'leader'] as const;
export type GameModule = typeof GAME_MODULES[number];
