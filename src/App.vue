<template>
  <div id="app">
    <Board/>
  </div>
</template>

<script>
import Board from './components/Board.vue'

export default {
  name: 'App',
  components: {
    Board
  }
}
</script>

<style>
body{
  margin: 0
}
#app {
  top: 0;
  bottom: 0;
  background-color: #aebdee;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
