<script lang="ts">
  import { get } from 'svelte/store';
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
      <div class="cell" data-row={rowIndex} data-col={colIndex}>
        {cell}

        {#if colIndex < boardData.boardSize.width - 1}
          <div class="line horizontal"></div>
        {/if}

        {#if rowIndex < boardData.boardSize.height - 1}
          <div class="line vertical"></div>
        {/if}

        {#if colIndex < boardData.boardSize.width - 1 && rowIndex < boardData.boardSize.height - 1}
          <div class="line diagonal diagonal-1"></div>
        {/if}

        {#if colIndex !== 0 && rowIndex < boardData.boardSize.height - 1}
          <div class="line diagonal diagonal-2"></div>
        {/if}

        <div class="cell-background"></div>
      </div>
    {/each}
  {/each}
</div>

<style>
  .board {
    display: grid;
    gap: 50px;

    padding: 10px;
  }

  .cell {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 50px;
    height: 50px;

    position: relative;
  }

  .cell-background {
    background: white;
    z-index: 1;

    width: 50px;
    height: 50px;

    border: 2px solid black;
    border-radius: 50%;
  }

  .line {
    position: absolute;

    width: 150%;
    height: 2px;

    background-color: black;
  }

  .line.horizontal {
    top: 50%;
    left: 100%;
  }

  .line.vertical {
    top: 150%;
    transform: rotate(90deg);
  }

  .line.diagonal {
    width: 250%;
    transform-origin: top left;

    left: 50%;
    top: 50%;
  }

  .line.diagonal-1 {
    transform: rotate(45deg);
  }

  .line.diagonal-2 {
    transform: rotate(135deg);
  }
</style>
