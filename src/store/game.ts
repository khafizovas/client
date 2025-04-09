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

export type MoveOption = 'approach' | 'withdrawal' | 'paika';
export type Move = {
  type: MoveOption;
  from: Position;
  to: Position;
};

export type GameTurn = {
  hasCapturingMoves: boolean;
  availableMoves: Move[];
  visitedCells: Position[];
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
    hasCapturingMoves: false,
    visitedCells: [],
  },
};

function createGameStore() {
  const [availableMoves, hasCapturingMoves] = getAvailableMoves(
    initialState.board,
    initialState.currentPlayer,
    initialState.currentTurn.visitedCells
  );

  initialState.currentTurn.availableMoves.push(...availableMoves);
  initialState.currentTurn.hasCapturingMoves = hasCapturingMoves;

  const { subscribe, update } = writable(initialState);

  return {
    subscribe,
    moveChip: (move: Move) =>
      update((state) => {
        // Перемещаем шашку
        const updatedBoard = structuredClone(state.board);
        updatedBoard[move.to.row][move.to.column].chip =
          updatedBoard[move.from.row][move.from.column].chip;
        updatedBoard[move.from.row][move.from.column].chip = null;

        // Добавляем ячейки в массив посещённых в этом ходе
        let updatedVisitedCells = structuredClone(
          state.currentTurn.visitedCells
        );
        updatedVisitedCells.push(move.from, move.to);

        // Получаем доступные ходы и возможность есть шашки
        let [updatedAvailableMoves, updatedHasCapturingMoves] =
          getAvailableMoves(
            state.board,
            state.currentPlayer,
            updatedVisitedCells
          );

        // Можно ли продолжить есть шашки?
        const shouldContinueTurn =
          move.type !== 'paika' && updatedHasCapturingMoves;

        let updatedPlayer: Player;

        // Если продолжаем есть шашки, не меняем игрока и продолжаем ход
        if (shouldContinueTurn) {
          updatedPlayer = state.currentPlayer;
        }
        // Если нет, меняем игрока,
        // обнуляем посещённые ячейки
        // и снова ищем доступные ходы уже для нового игрока
        else {
          updatedPlayer =
            state.currentPlayer === 'playerA' ? 'playerB' : 'playerA';

          updatedVisitedCells = [];

          [updatedAvailableMoves, updatedHasCapturingMoves] = getAvailableMoves(
            updatedBoard,
            updatedPlayer,
            updatedVisitedCells
          );
        }

        return {
          ...state,
          board: updatedBoard,
          currentPlayer: updatedPlayer,
          currentTurn: {
            availableMoves: updatedAvailableMoves,
            hasCapturingMoves: updatedHasCapturingMoves,
            visitedCells: updatedVisitedCells,
          },
        };
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

function getAvailableMoves(
  board: Cell[][],
  currentPlayer: Player,
  visitedCells: Position[]
): [Move[], boolean] {
  let hasCapturingMoves = false;

  const emptyCells = board.reduce((acc, row) => {
    return [
      ...acc,
      ...row.filter(
        (cell) =>
          cell.chip === null &&
          visitedCells.filter(
            (visitedCell) =>
              visitedCell.row === cell.position.row ||
              visitedCell.column === cell.position.column
          ).length === 0
      ),
    ];
  }, []);

  const availableMoves = emptyCells.reduce(
    (acc, emptyCell) => [
      ...acc,
      ...emptyCell.adjacents
        .filter((adjacent) => adjacent.chip === currentPlayer)
        .map((cell) => {
          const deltaChipToEmpty = {
            row: emptyCell.position.row - cell.position.row,
            column: emptyCell.position.column - cell.position.column,
          };

          const isApproach =
            emptyCell.adjacents.filter(
              (adjacent) =>
                adjacent.chip !== currentPlayer &&
                adjacent.chip !== null &&
                adjacent.position.row - emptyCell.position.row ===
                  deltaChipToEmpty.row &&
                adjacent.position.column - emptyCell.position.column ===
                  deltaChipToEmpty.column
            ).length > 0;

          const isWithdrawal =
            cell.adjacents.filter(
              (adjacent) =>
                adjacent.chip !== currentPlayer &&
                adjacent.chip !== null &&
                cell.position.row - adjacent.position.row ===
                  deltaChipToEmpty.row &&
                cell.position.column - adjacent.position.column ===
                  deltaChipToEmpty.column
            ).length > 0;

          if (isApproach || isWithdrawal) {
            hasCapturingMoves = true;
          }

          return {
            from: cell.position,
            to: emptyCell.position,
            type:
              (isApproach && ('approach' as const)) ||
              (isWithdrawal && ('withdrawal' as const)) ||
              ('paika' as const),
          };
        }),
    ],
    new Array<Move>()
  );

  return [availableMoves, hasCapturingMoves];
}

export const gameStore = createGameStore();
