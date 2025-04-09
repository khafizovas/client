<script lang="ts">
  import Cell from './Cell.svelte';
  import { BOARD_SIZES, gameStore, type BoardSize, type Cell as CellType, type Move } from '../store/game';

  $: boardData = $gameStore;
  $: selectedChip = null as (CellType | null);

  function selectChip(cell: CellType, move: Move) {
    if (!selectedChip) {
      selectedChip = cell;
      return;
    }

    gameStore.moveChip(move);
    selectedChip = null;
  }

  function changeBoardSize(e: Event) {
    const selectElement = e.target as HTMLSelectElement;
    const newSize = selectElement.value as BoardSize;

    gameStore.setBoardSize(newSize);
  }
</script>

<div>Сейчас ходит: {boardData.currentPlayer}</div>
<div>
  Счёт:
  <pre>{JSON.stringify(boardData.score, null, 2)}</pre>
</div>
<div>Можно есть? - {boardData.currentTurn.hasCapturingMoves}</div>
<div>Посещённые за этот ход ячейки: {JSON.stringify(boardData.currentTurn.visitedCells)}</div>

<div class="controls">
  <label>
    Размер поля:
    <select value={boardData.boardSize} on:change={changeBoardSize}>
      {#each Object.keys(BOARD_SIZES) as size}
        <option value={size}>{size}</option>
      {/each}
    </select>
  </label>

  <button on:click={gameStore.resetGame}>Начать заново</button>
</div>

<div 
  class="board" 
  style="grid-template-columns: repeat({BOARD_SIZES[boardData.boardSize].width}, 1fr); grid-template-rows: repeat({BOARD_SIZES[$gameStore.boardSize].height}, 1fr);"
>
  {#each boardData.board as row}
    {#each row as cell}
    <Cell 
      cell={cell}
      isSelected={selectedChip === cell }
      selectedChip={selectedChip}
      onSelect={selectChip}
    />
    {/each}
  {/each}
</div>

<style>
  .controls {
    display: flex;
    gap: 50px;
  }

  .board {
    display: grid;
    gap: 50px;

    padding: 10px;
  }
</style>
