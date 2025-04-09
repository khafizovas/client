<script lang="ts">
  import type { Cell } from "../store/game";

  export let type: 'horizontal' | 'vertical' | 'diagonal diagonal-1' | 'diagonal diagonal-2';
  export let parentCell: Cell;

  $: isVisible = getVisibility();

  function getVisibility() {
    switch (type) {
      case 'horizontal':
        return parentCell.adjacents.filter(
          (adjacent) => adjacent.position.row === parentCell.position.row
            && adjacent.position.column === parentCell.position.column + 1
        ).length > 0;
      case 'vertical':
        return parentCell.adjacents.filter(
          (adjacent) => adjacent.position.column === parentCell.position.column
            && adjacent.position.row === parentCell.position.row + 1
        ).length > 0;
      case 'diagonal diagonal-1':
        return parentCell.adjacents.filter(
          (adjacent) => adjacent.position.row === parentCell.position.row + 1
            && adjacent.position.column === parentCell.position.column + 1
        ).length > 0;
      case 'diagonal diagonal-2':
        return parentCell.adjacents.filter(
          (adjacent) => adjacent.position.row === parentCell.position.row + 1
            && adjacent.position.column === parentCell.position.column - 1
        ).length > 0;
      default:
        return false;
    }
  }
</script>

{#if isVisible}
  <div class="line {type}"></div>
{/if}

<style>
  .line {
    position: absolute;
    z-index: 0;

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

  .line.line.diagonal {
    width: 250%;
    
    left: 50%;
    top: 50%;

    transform-origin: top left;
  }

  .line.diagonal-1 {
    transform: rotate(45deg);
  }

  .line.diagonal-2 {
    transform: rotate(135deg);
  }
</style>
