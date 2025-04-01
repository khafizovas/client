import { writable } from 'svelte/store';

export const BOARD_SIZES = {
  'Fanoron-Telo': { width: 3, height: 3 },
  'Fanoron-Dimy': { width: 5, height: 5 },
  'Fanoron-Sivy': { width: 9, height: 5 },
};

const DEFAULT_BOARD_SIZE = 'Fanoron-Sivy';

export const gameStore = writable({
  boardSize: BOARD_SIZES[DEFAULT_BOARD_SIZE],
  board: Array(BOARD_SIZES[DEFAULT_BOARD_SIZE].height)
    .fill(null)
    .map(() => Array(BOARD_SIZES[DEFAULT_BOARD_SIZE].width).fill(null)),
  currentPlayer: 'A',
});
