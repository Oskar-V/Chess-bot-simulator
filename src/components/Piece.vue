<template>
  <div class="piece">
    <img v-if="color === 'w' && type === 'b'" src="../assets/wb.svg" class="piece-icon"/>
    <img v-if="color === 'w' && type === 'k'" src="../assets/wk.svg" class="piece-icon"/>
    <img v-if="color === 'w' && type === 'n'" src="../assets/wn.svg" class="piece-icon"/>
    <img v-if="color === 'w' && type === 'p'" src="../assets/wp.svg" class="piece-icon"/>
    <img v-if="color === 'w' && type === 'q'" src="../assets/wq.svg" class="piece-icon"/>
    <img v-if="color === 'w' && type === 'r'" src="../assets/wr.svg" class="piece-icon"/>

    <img v-if="color === 'b' && type === 'b'" src="../assets/bb.svg" class="piece-icon"/>
    <img v-if="color === 'b' && type === 'k'" src="../assets/bk.svg" class="piece-icon"/>
    <img v-if="color === 'b' && type === 'n'" src="../assets/bn.svg" class="piece-icon"/>
    <img v-if="color === 'b' && type === 'p'" src="../assets/bp.svg" class="piece-icon"/>
    <img v-if="color === 'b' && type === 'q'" src="../assets/bq.svg" class="piece-icon"/>
    <img v-if="color === 'b' && type === 'r'" src="../assets/br.svg" class="piece-icon"/>
  </div>
</template>

<script>

export default {
  name: "Piece",
  props: {
    color: {
      type: String
    },
    type: {
      type: String
    }
  }

}
</script>

<style scoped>
.piece {
  height: 70%;
  width: 70%;
  border-radius: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>