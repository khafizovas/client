<script lang="ts">
  import Line from './Line.svelte';
  import { gameStore, type Cell } from '../store/game';

  export let cell: Cell;
  export let isSelected: boolean;
  export let onSelect: (cell: Cell) => void;
  export let selectedChip: Cell | null;

  $: currentPlayer = $gameStore.currentPlayer;
  $: hasSelectedChip = selectedChip !== null;

  $: canBeSelected =
    !hasSelectedChip
      && cell.chip === currentPlayer
      && cell.adjacents.filter(({ chip }) => chip === null).length > 0
    || hasSelectedChip
      && !cell.chip
      && cell.adjacents.includes(selectedChip!);

  function selectCell() {
    if (!canBeSelected) {
      return;
    }

    onSelect(cell);
  }
</script>

<div class="cell">
  <Line type="horizontal" parentCell={cell} />
  <Line type="vertical" parentCell={cell} />
  <Line type="diagonal diagonal-1" parentCell={cell} />
  <Line type="diagonal diagonal-2" parentCell={cell} />

  <button
    class="cell-background {canBeSelected ? 'can-be-selected' : ''} {isSelected ? 'selected' : ''}"
    type="button"
    aria-label="{cell.position.row} {cell.position.column} {cell.chip}"
    on:click={selectCell}
  >
    {#if cell.chip}
      <div
        class="cell-chip {cell.chip}">
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

    padding: 0;
    background: white;

    border: 2px solid black;
    border-radius: 50%;
  }

  .cell-background.can-be-selected {
    background: lightgrey;
    cursor: pointer;
  }

  .cell-background.can-be-selected:hover {
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
  }

  .cell-chip.playerA {
    background: white;
  }

  .cell-chip.playerB {
    background: black;
  }
</style>
