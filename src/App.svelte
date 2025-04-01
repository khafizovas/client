<script lang="ts">
  import GameBoard from './components/GameBoard.svelte';
</script>

<main>
  <GameBoard />
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    height: 100vh;

    background: white;
    color: black;

    font-family: sans-serif;
  }
</style>
