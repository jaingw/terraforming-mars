export enum Color {
  BLUE = 'blue',
  RED = 'red',
  YELLOW = 'yellow',
  GREEN = 'green',
  BLACK = 'black',
  PURPLE = 'purple',
  ORANGE = 'orange',
  PINK = 'pink',
  NEUTRAL = 'neutral',
  BRONZE = 'bronze',
  GRAY = 'gray',
}

export const PLAYER_COLORS = [Color.RED, Color.GREEN, Color.YELLOW, Color.BLUE, Color.BLACK, Color.PURPLE, Color.ORANGE, Color.PINK] as const;

export type ColorWithNeutral = Color | 'NEUTRAL';
