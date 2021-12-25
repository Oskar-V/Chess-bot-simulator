<template>
  <div class="piece" :class="clickable ? 'clickable' : ''" @click="handlePieceClick">
    <img v-if="color === 'w' && type === 'b'" src="../assets/wb.svg" class="piece-icon" :class="[isSelected ? 'selected-piece': '']"/>
    <img v-if="color === 'w' && type === 'k'" src="../assets/wk.svg" class="piece-icon" :class="[isSelected ? 'selected-piece': '']"/>
    <img v-if="color === 'w' && type === 'n'" src="../assets/wn.svg" class="piece-icon" :class="[isSelected ? 'selected-piece': '']"/>
    <img v-if="color === 'w' && type === 'p'" src="../assets/wp.svg" class="piece-icon" :class="[isSelected ? 'selected-piece': '']"/>
    <img v-if="color === 'w' && type === 'q'" src="../assets/wq.svg" class="piece-icon" :class="[isSelected ? 'selected-piece': '']"/>
    <img v-if="color === 'w' && type === 'r'" src="../assets/wr.svg" class="piece-icon" :class="[isSelected ? 'selected-piece': '']"/>
    <img v-if="color === 'b' && type === 'b'" src="../assets/bb.svg" class="piece-icon" :class="[isSelected ? 'selected-piece': '']"/>
    <img v-if="color === 'b' && type === 'k'" src="../assets/bk.svg" class="piece-icon" :class="[isSelected ? 'selected-piece': '']"/>
    <img v-if="color === 'b' && type === 'n'" src="../assets/bn.svg" class="piece-icon" :class="[isSelected ? 'selected-piece': '']"/>
    <img v-if="color === 'b' && type === 'p'" src="../assets/bp.svg" class="piece-icon" :class="[isSelected ? 'selected-piece': '']"/>
    <img v-if="color === 'b' && type === 'q'" src="../assets/bq.svg" class="piece-icon" :class="[isSelected ? 'selected-piece': '']"/>
    <img v-if="color === 'b' && type === 'r'" src="../assets/br.svg" class="piece-icon" :class="[isSelected ? 'selected-piece': '']"/>
  </div>
</template>

<script>

export default {
  name: "Piece",
  props: {
    color: {
      type: String
    },
    currentPlayerColor: {
      type: String
    },
    type: {
      type: String
    },
    availableMoves: {
      type: Array,
      default: null
    },
    index:{
      type: Number,
      default: null
    },
    isManualPlayForThisPiece:{
      type: Boolean,
      default: false
    }
  },
  data(){
    return{
     isSelected:false
    }
  },
  methods: {
    translateNotationToIndex(notation){
      const x = notation.split('')[0];
      const y = notation.split('')[1];
      const arr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      const xSquareNr= arr.indexOf(x)+1;
      const ySquareNr = 8 - y+1;
      return (ySquareNr-1)*8 + xSquareNr - 1;
    },
    unSelect(){
      this.isSelected = false;
    },
    handlePieceClick(){
      if (!this.clickable) return false;
      if (this.isSelected){
        this.$emit('pieceSelect');
        this.$emit('destinationSquaresChange', []);
        return;
      }
      this.$emit('pieceSelect');
      this.isSelected = true;
    }
  },
  watch:{
    isSelected(){
      if (!this.isSelected)return;
      const dests = [];
      this.availableMoves.forEach(move => {
        if (this.translateNotationToIndex(move.from) === this.index){
         dests.push({
           squareIndex:this.translateNotationToIndex(move.to),
           move: move.san
         });
        }
      })
      this.$emit('destinationSquaresChange', dests);
    }
  },
  computed:{
    clickable(){
      if (!this.availableMoves || this.index === null)return false;
      if (this.color !== this.currentPlayerColor)return false;
      if(!this.isManualPlayForThisPiece)return false;

      let canMove = false;
      this.availableMoves.forEach(move => {
        if (this.translateNotationToIndex(move.from) === this.index){
          canMove = true;
        }
      })
      return canMove;
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

.clickable:hover{
  opacity: 0.7;
  cursor: pointer;
}

.selected-piece{
  border: solid 3px green;
}
</style>