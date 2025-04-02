<script lang="ts">
  import Line from './Line.svelte';
  import { BOARD_SIZES, gameStore, type Cell } from '../store/game';

  export let rowIndex: number;
  export let colIndex: number;
  export let cell: Cell;
  export let isSelected: boolean;
  export let onSelect: (row: number, column: number) => void;

  $: boardSize = BOARD_SIZES[$gameStore.boardSize];

  $: isHorizontalVisible = colIndex < boardSize.width - 1;

  $: isVerticalVisible = rowIndex < boardSize.height - 1;

  $: isFirstDiagonalVisible = (rowIndex + colIndex) % 2 === 0
    && colIndex < boardSize.width - 1
    && rowIndex < boardSize.height - 1;

  $: isSecondDiagonalVisible = (rowIndex + colIndex) % 2 === 0
    && colIndex !== 0 && rowIndex < boardSize.height - 1;

  function selectCell() {
    console.log('debug selectCell', rowIndex, colIndex);
    onSelect(rowIndex, colIndex);
  }
</script>

<div class="cell">
  <Line type="horizontal" isVisible={isHorizontalVisible} />
  <Line type="vertical" isVisible={isVerticalVisible} />
  <Line type="diagonal diagonal-1" isVisible={isFirstDiagonalVisible} />
  <Line type="diagonal diagonal-2" isVisible={isSecondDiagonalVisible} />

  <button
    class="cell-background {isSelected ? 'selected' : ''}"
    type="button"
    aria-label="{rowIndex} {colIndex} {cell}"
    on:click={selectCell}
  >
    {#if cell}
      <div
        class="cell-chip {cell}">
      </div>
    {/if}
  </button>
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
    cursor: pointer;

    padding: 0;
    background: white;

    border: 2px solid black;
    border-radius: 50%;
  }

  .cell-background:hover {
    -webkit-box-shadow: 0px 5px 10px 2px rgba(34, 60, 80, 0.2) inset;
    -moz-box-shadow: 0px 5px 10px 2px rgba(34, 60, 80, 0.2) inset;
    box-shadow: 0px 5px 10px 2px rgba(34, 60, 80, 0.2) inset;
  }

  .cell-background.selected {
    background: grey;
  }

  .cell-chip {
    width: 80%;
    height: 80%;

    border: 2px solid black;
    border-radius: 50%;

    cursor: pointer;
  }

  .cell-chip.playerA {
    background: white;
  }

  .cell-chip.playerB {
    background: black;
  }
</style>
