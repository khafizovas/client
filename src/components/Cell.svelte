<script lang="ts">
  import Line from './Line.svelte';
  import type { BoardSizeValue, Cell } from '../store/game';

  export let rowIndex: number;
  export let colIndex: number;
  export let cell: Cell;
  export let boardSize: BoardSizeValue;

  const isHorizontalVisible = colIndex < boardSize.width - 1;

  const isVerticalVisible = rowIndex < boardSize.height - 1;

  const isFirstDiagonalVisible = (rowIndex + colIndex) % 2 === 0
    && colIndex < boardSize.width - 1
    && rowIndex < boardSize.height - 1;

  const isSecondDiagonalVisible = (rowIndex + colIndex) % 2 === 0
    && colIndex !== 0 && rowIndex < boardSize.height - 1;
</script>

<div class="cell">
  <Line type="horizontal" isVisible={isHorizontalVisible} />
  <Line type="vertical" isVisible={isVerticalVisible} />
  <Line type="diagonal diagonal-1" isVisible={isFirstDiagonalVisible} />
  <Line type="diagonal diagonal-2" isVisible={isSecondDiagonalVisible} />

  <div class="cell-background">
    {#if cell}
      <div class="cell-chip {cell}"></div>
    {/if}
  </div>
</div>

<style>
  .cell, .cell-background {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 50px;
    height: 50px;

    position: relative;
  }

  .cell-background {
    z-index: 1;

    background: white;

    border: 2px solid black;
    border-radius: 50%;

    cursor: pointer;
  }

  .cell-chip {
    width: 80%;
    height: 80%;

    border: 2px solid black;
    border-radius: 50%;
  }

  .cell-chip.playerA {
    background: white;
  }

  .cell-chip.playerB {
    background: black;
  }
</style>
