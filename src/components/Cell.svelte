<script lang="ts">
  import Line from './Line.svelte';

  export let rowIndex: number;
  export let colIndex: number;
  export let cell: string;
  export let boardSize: { width: number; height: number };

  const isHorizontalVisible = colIndex < boardSize.width - 1;
  const isVerticalVisible = rowIndex < boardSize.height - 1;
  const isFirstDiagonalVisible = colIndex < boardSize.width - 1 && rowIndex < boardSize.height - 1;
  const isSecondDiagonalVisible = colIndex !== 0 && rowIndex < boardSize.height - 1;
</script>

<div class="cell" data-row={rowIndex} data-col={colIndex}>
  {cell}

  <Line type="horizontal" isVisible={isHorizontalVisible} />
  <Line type="vertical" isVisible={isVerticalVisible} />
  <Line type="diagonal diagonal-1" isVisible={isFirstDiagonalVisible} />
  <Line type="diagonal diagonal-2" isVisible={isSecondDiagonalVisible} />

  <div class="cell-background"></div>
</div>

<style>
  .cell {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 50px;
    height: 50px;

    position: relative;
  }

  .cell-background {
    z-index: 1;

    width: 50px;
    height: 50px;

    background: white;
    border: 2px solid black;
    border-radius: 50%;
  }
</style>
