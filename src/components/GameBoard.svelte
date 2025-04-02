<script lang="ts">
  import Cell from './Cell.svelte';
  import { BOARD_SIZES, gameStore, type BoardSize } from '../store/game';

  $: boardData = $gameStore;

  function changeBoardSize(e: Event) {
    const selectElement = e.target as HTMLSelectElement;
    const newSize = selectElement.value as BoardSize;

    gameStore.setBoardSize(newSize);
  }
</script>

<label>
  <select value={boardData.boardSize} on:change={changeBoardSize}>
    {#each Object.keys(BOARD_SIZES) as size}
      <option value={size}>{size}</option>
    {/each}
  </select>
</label>

<div 
  class="board" 
  style="grid-template-columns: repeat({BOARD_SIZES[boardData.boardSize].width}, 1fr); grid-template-rows: repeat({BOARD_SIZES[$gameStore.boardSize].height}, 1fr);"
>
  {#each boardData.board as row, rowIndex}
    {#each row as cell, colIndex}
    <Cell 
      rowIndex={rowIndex} 
      colIndex={colIndex} 
      cell={cell} 
    />
    {/each}
  {/each}
</div>

<style>
  .board {
    display: grid;
    gap: 50px;

    padding: 10px;
  }
</style>
