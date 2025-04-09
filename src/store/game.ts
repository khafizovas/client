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

export type MoveOption = 'capturing' | 'paika';
export type Move = {
  type: MoveOption;
  from: Position;
  to: Position;
};

export type GameTurn = {
  availableMoves: Move[];
  moves: Position[];
};

export type GameState = {
  boardSize: BoardSize;
  board: Cell[][];
  currentPlayer: Player;
  currentTurn: GameTurn;
};

const initialState: GameState = {
  boardSize: DEFAULT_BOARD_SIZE,
  board: initializeBoard(BOARD_SIZES[DEFAULT_BOARD_SIZE]),
  currentPlayer: DEFAULT_PLAYER,
  currentTurn: {
    availableMoves: [],
    moves: [],
  },
};

function createGameStore() {
  initialState.currentTurn.availableMoves.push(
    ...getAvailableMoves(initialState.board, initialState.currentPlayer)
  );

  const { subscribe, update } = writable(initialState);

  return {
    subscribe,
    moveChip: (move: Move) =>
      update((state) => {
        const updatedBoard = structuredClone(state.board);
        updatedBoard[move.to.row][move.to.column].chip =
          updatedBoard[move.from.row][move.from.column].chip;
        updatedBoard[move.from.row][move.from.column].chip = null;

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

function getAvailableMoves(board: Cell[][], currentPlayer: Player): Move[] {
  const emptyCells = board.reduce((acc, row) => {
    return [...acc, ...row.filter((cell) => cell.chip === null)];
  }, []);

  const availableMoves = emptyCells.reduce(
    (acc, emptyCell) => [
      ...acc,
      ...emptyCell.adjacents
        .filter((adjacent) => adjacent.chip === currentPlayer)
        .map((cell) => {
          const delta = {
            row: emptyCell.position.row - cell.position.row,
            column: emptyCell.position.column - cell.position.column,
          };

          const isApproach =
            emptyCell.adjacents.filter(
              (adjacent) =>
                adjacent.chip !== currentPlayer &&
                adjacent.chip !== null &&
                adjacent.position.row - emptyCell.position.row === delta.row &&
                adjacent.position.column - emptyCell.position.column ===
                  delta.column
            ).length > 0;

          const isWithdrawal =
            cell.adjacents.filter(
              (adjacent) =>
                adjacent.chip !== currentPlayer &&
                adjacent.chip !== null &&
                adjacent.position.row - cell.position.row === delta.row &&
                adjacent.position.column - cell.position.column === delta.column
            ).length > 0;

          return {
            from: cell.position,
            to: emptyCell.position,
            type:
              isApproach || isWithdrawal
                ? ('capturing' as const)
                : ('paika' as const),
          };
        }),
    ],
    new Array<Move>()
  );

  return availableMoves;
}

export const gameStore = createGameStore();
