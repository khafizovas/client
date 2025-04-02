import { writable } from 'svelte/store';

export const BOARD_SIZES = {
  'Fanoron-Telo': { width: 3, height: 3 },
  'Fanoron-Dimy': { width: 5, height: 5 },
  'Fanoron-Sivy': { width: 9, height: 5 },
};

export const DEFAULT_BOARD_SIZE = 'Fanoron-Sivy';
const DEFAULT_PLAYER = 'playerA';

export type BoardSize = keyof typeof BOARD_SIZES;
export type BoardSizeValue = {
  width: number;
  height: number;
};

export type Player = 'playerA' | 'playerB';
export type Cell = Player | null;

export type GameState = {
  boardSize: BoardSize;
  board: Cell[][];
  currentPlayer: Player;
};

const initialState: GameState = {
  boardSize: DEFAULT_BOARD_SIZE,
  board: initializeBoard(BOARD_SIZES[DEFAULT_BOARD_SIZE]),
  currentPlayer: DEFAULT_PLAYER,
};

function createGameStore() {
  const { subscribe, update } = writable(initialState);

  return {
    subscribe,
    setBoardSize: (size: BoardSize) =>
      update((state) => ({
        ...state,
        boardSize: size,
        board: initializeBoard(BOARD_SIZES[size]),
        currentPlayer: DEFAULT_PLAYER,
      })),
    reset: () =>
      update((state) => ({
        ...state,
        board: initializeBoard(BOARD_SIZES[state.boardSize]),
        currentPlayer: DEFAULT_PLAYER,
      })),
  };
}

function initializeBoard(size: BoardSizeValue): Cell[][] {
  const centerRow = Math.floor(size.height / 2);

  const board = Array.from({ length: size.height }, (_, row) =>
    Array.from({ length: size.width }, (_, col) => {
      if (row < centerRow) return 'playerB';
      if (row > centerRow) return 'playerA';

      if (row === centerRow) {
        const centerCell = Math.floor(size.width / 2);

        return col === centerCell
          ? null
          : col % 2 === 0
          ? 'playerB'
          : 'playerA';
      }

      return null;
    })
  );

  return board;
}

export const gameStore = createGameStore();
