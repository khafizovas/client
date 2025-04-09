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

export type Position = {
  row: number;
  column: number;
};

export type Cell = {
  position: Position;
  chip: Player | null;
  adjacents: Cell[];
};

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
    moveChip: (from: Position, to: Position) =>
      update((state) => {
        const updatedBoard = structuredClone(state.board);
        updatedBoard[to.row][to.column].chip =
          updatedBoard[from.row][from.column].chip;
        updatedBoard[from.row][from.column].chip = null;

        const updatedPlayer =
          state.currentPlayer === 'playerA' ? 'playerB' : 'playerA';

        return { ...state, board: updatedBoard, currentPlayer: updatedPlayer };
      }),
    setBoardSize: (size: BoardSize) =>
      update((state) => ({
        ...state,
        boardSize: size,
        board: initializeBoard(BOARD_SIZES[size]),
        currentPlayer: DEFAULT_PLAYER,
      })),
    resetGame: () =>
      update((state) => ({
        ...state,
        board: initializeBoard(BOARD_SIZES[state.boardSize]),
        currentPlayer: DEFAULT_PLAYER,
      })),
  };
}

function initializeBoard(size: BoardSizeValue): Cell[][] {
  const centerRow = Math.floor(size.height / 2);
  const centerCell = Math.floor(size.width / 2);

  const board = Array.from({ length: size.height }, (_, row) =>
    Array.from({ length: size.width }, (_, column) => {
      const chip: Player | null =
        (row < centerRow && 'playerA') ||
        (row > centerRow && 'playerB') ||
        (column !== centerCell && column % 2 === 0 && 'playerB') ||
        (column !== centerCell && 'playerA') ||
        null;

      return {
        chip,
        position: {
          row,
          column,
        },
        adjacents: new Array<Cell>(),
      };
    })
  );

  board.forEach((row, rowInd) =>
    row.forEach((cell, colInd) => {
      const hasUp = rowInd - 1 >= 0;
      const hasDown = rowInd + 1 < size.height;
      const hasLeft = colInd - 1 >= 0;
      const hasRight = colInd + 1 < size.width;

      const adjacents: (Cell | false)[] = [
        hasLeft && board[rowInd][colInd - 1],
        hasRight && board[rowInd][colInd + 1],
        hasUp && board[rowInd - 1][colInd],
        hasDown && board[rowInd + 1][colInd],
      ];

      if ((rowInd + colInd) % 2 === 0) {
        adjacents.push(
          hasUp && hasLeft && board[rowInd - 1][colInd - 1],
          hasUp && hasRight && board[rowInd - 1][colInd + 1],
          hasDown && hasLeft && board[rowInd + 1][colInd - 1],
          hasDown && hasRight && board[rowInd + 1][colInd + 1]
        );
      }

      const filteredAdjacents: Cell[] = adjacents.filter(
        (adjacent) => !!adjacent
      );

      cell.adjacents.push(...filteredAdjacents);
    })
  );

  return board;
}

export const gameStore = createGameStore();
