<script lang="ts">
  import Cell from './Cell.svelte';
  import { BOARD_SIZES, gameStore, type BoardSize, type Cell as CellType } from '../store/game';

  $: boardData = $gameStore;
  $: selectedChip = null as (CellType | null);

  function selectChip(cell: CellType) {
    if (!selectedChip) {
      selectedChip = cell;
      return;
    }

    gameStore.moveChip({from: selectedChip.position, to: cell.position, type: 'paika'});
    selectedChip = null;
  }

  function changeBoardSize(e: Event) {
    const selectElement = e.target as HTMLSelectElement;
    const newSize = selectElement.value as BoardSize;

    gameStore.setBoardSize(newSize);
  }
</script>

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
