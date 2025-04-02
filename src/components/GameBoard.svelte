<script lang="ts">
  import { get } from 'svelte/store';

  import Cell from './Cell.svelte';
  import { gameStore } from '../store/game';

  let boardData;

  $: boardData = get(gameStore);
</script>

<div 
  class="board" 
  style="grid-template-columns: repeat({boardData.boardSize.width}, 1fr); grid-template-rows: repeat({boardData.boardSize.height}, 1fr);"
>
  {#each boardData.board as row, rowIndex}
    {#each row as cell, colIndex}
    <Cell 
      rowIndex={rowIndex} 
      colIndex={colIndex} 
      cell={cell} 
      boardSize={boardData.boardSize}
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
