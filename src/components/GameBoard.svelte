<script lang="ts">
  import Cell from './Cell.svelte';
  import { BOARD_SIZES, gameStore } from '../store/game';

  let boardData;
  $: boardData = $gameStore;
</script>

<div 
  class="board" 
  style="grid-template-columns: repeat({BOARD_SIZES[boardData.boardSize].width}, 1fr); grid-template-rows: repeat({BOARD_SIZES[boardData.boardSize].height}, 1fr);"
>
  {#each boardData.board as row, rowIndex}
    {#each row as cell, colIndex}
    <Cell 
      rowIndex={rowIndex} 
      colIndex={colIndex} 
      cell={cell} 
      boardSize={BOARD_SIZES[boardData.boardSize]}
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
