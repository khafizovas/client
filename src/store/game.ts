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
  from: Position;
  to: Position;
  delta: Position;
  chipToEat: Cell | null;
  type: MoveOption;
};

export type GameTurn = {
  hasCapturingMoves: boolean;
  availableMoves: Move[];
  visitedCells: Position[];
};

export type GameScore = {
  playerA: number;
  playerB: number;
};

export type GameState = {
  boardSize: BoardSize;
  board: Cell[][];
  currentPlayer: Player;
  currentTurn: GameTurn;
  score: GameScore;
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
  score: {
    playerA: 0,
    playerB: 0,
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

        // Едим шашки
        let updatedScore = structuredClone(state.score);
        let chipToEat = move.chipToEat;

        while (chipToEat !== null) {
          updatedBoard[chipToEat.position.row][chipToEat.position.column].chip =
            null;

          updatedScore[state.currentPlayer] += 1;

          const nextChip = chipToEat.adjacents.filter(
            (adjacent) =>
              adjacent.position.row ===
                chipToEat!.position.row + move.delta.row &&
              adjacent.position.column ===
                chipToEat!.position.column + move.delta.column &&
              adjacent.chip !== state.currentPlayer &&
              state.currentPlayer !== null
          );

          chipToEat = nextChip.length === 1 ? nextChip[0] : null;
        }

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
          score: updatedScore,
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
          const [chipToEatByApproach, chipToEatByWithdrawal] = getChipsToEat(
            cell,
            emptyCell,
            currentPlayer
          );
          const chipToEat = chipToEatByApproach || chipToEatByWithdrawal;

          hasCapturingMoves = hasCapturingMoves || !!chipToEat;

          const moveType =
            (!!chipToEatByApproach && ('approach' as const)) ||
            (!!chipToEatByWithdrawal && ('withdrawal' as const)) ||
            ('paika' as const);

          return {
            from: cell.position,
            to: emptyCell.position,
            delta: {
              row: emptyCell.position.row - cell.position.row,
              column: emptyCell.position.column - cell.position.column,
            },
            chipToEat,
            type: moveType,
          };
        }),
    ],
    new Array<Move>()
  );

  return [availableMoves, hasCapturingMoves];
}

function getChipsToEat(
  from: Cell,
  to: Cell,
  currentPlayer: Player
): (Cell | null)[] {
  const moveDelta = {
    row: to.position.row - from.position.row,
    column: to.position.column - from.position.column,
  };

  return [
    getChipToEatByApproach(to, moveDelta, currentPlayer),
    getChipToEatByWithdrawal(from, moveDelta, currentPlayer),
  ];
}

function getChipToEatByApproach(
  to: Cell,
  delta: Position,
  currentPlayer: Player
): Cell | null {
  const chipToEatByApproach = to.adjacents.filter(
    (adjacent) =>
      adjacent.chip !== currentPlayer &&
      adjacent.chip !== null &&
      adjacent.position.row - to.position.row === delta.row &&
      adjacent.position.column - to.position.column === delta.column
  );
  const isApproach = chipToEatByApproach.length === 1;

  return isApproach ? chipToEatByApproach[0] : null;
}

function getChipToEatByWithdrawal(
  from: Cell,
  delta: Position,
  currentPlayer: Player
): Cell | null {
  const chipToEatByWithdrawal = from.adjacents.filter(
    (adjacent) =>
      adjacent.chip !== currentPlayer &&
      adjacent.chip !== null &&
      from.position.row - adjacent.position.row === delta.row &&
      from.position.column - adjacent.position.column === delta.column
  );
  const isWithdrawal = chipToEatByWithdrawal.length === 1;

  return isWithdrawal ? chipToEatByWithdrawal[0] : null;
}

export const gameStore = createGameStore();
