<template>
  <div class="container">

    <div class="controls-container">
      <div>{{ message }}</div>

      <div style="display: flex; gap: 1em;">
        <button @click="handlePlayClick">PLAY</button>
        <button @click="handlePauseClick">PAUSE</button>
        <button @click="handleResumeClick">RESUME</button>
        <button @click="handleRestartClick">RESTART</button>
      </div>

      <div>
        <div>Delay in seconds</div>
        <input v-model="delayInSeconds"/>
      </div>


      <div class="player-containers">
        <div>
          <div>White player</div>
          <input v-model="whitePlayerEndpoint"/>
          <div class="player-move-history">
            <div v-for="(move, index) in whiteHistory" :key="index">{{ move }}</div>
          </div>
        </div>
        <div>
          <div>Black player</div>
          <input v-model="blackPlayerEndpoint"/>
          <div class="player-move-history">
            <div v-for="(move, index) in blackHistory" :key="index">{{ move }}</div>
          </div>
        </div>
      </div>

    </div>

    <div class="field">
      <div
          v-for="(square, index) in gameSquares"
          :key="index"
          :class="[getSquareColorClass(index)]"
          :style="index > 55 ? 'border-bottom: solid' : ''"
      >
        <Piece v-if="square" :type="square.type" :color="square.color" :index="index"/>
      </div>
    </div>
  </div>
</template>

<script>
import Piece from "./Piece";
import Chess from "chess.js";
import axios from 'axios';

export default {

  name: 'Board',
  components: {Piece},
  data() {
    return {
      delayInSeconds: 1,
      blackPlayerEndpoint: "",
      whitePlayerEndpoint: "",
      blackHistory: [],
      whiteHistory: [],
      allHistory: [],
      chess: new Chess(),
      currentPlayer: "w",
      isPlaying: false,
      message: "White move",
    }
  },

  methods: {
    makeTurn() {
      const endpoint = this.currentPlayer === "w" ? this.whitePlayerEndpoint : this.blackPlayerEndpoint;

      axios.post(endpoint, this.allHistory.join(" "),
          {
            headers: {
              'Content-Type': 'text/plain'
            }
          }
      )
          .then(response => {
            this.chess.move(response.data);

            if (this.currentPlayer === "w") {
              this.currentPlayer = "b";
              this.whiteHistory.push(response.data);
              this.allHistory.push(response.data);
            } else if (this.currentPlayer === "b") {
              this.currentPlayer = "w";
              this.blackHistory.push(response.data)
              this.allHistory.push(response.data);
            }

            if (this.chess.game_over()) {
              this.message += this.currentPlayer === "w" ? "Black wins!" : "White wins!";
              this.isPlaying = false;
            } else if (this.chess.in_check()) {
              this.message = this.currentPlayer === "w" ? "In check... White move" : "In check... Black move";
            } else {
              this.message = this.currentPlayer === "w" ? "White move" : "Black move";
            }
          }).catch(
          error => console.log(error)
      )
    },
    handlePlayClick() {
      this.isPlaying = true;
      this.makeTurn();
    },
    handlePauseClick() {
      this.isPlaying = false;
    },
    handleResumeClick() {
      this.isPlaying = true;
      this.makeTurn();
    },
    handleRestartClick() {
      this.chess = new Chess();
      this.currentPlayer = "w";
      this.isPlaying = false;
      this.message = "White move";
      this.blackHistory = [];
      this.whiteHistory = [];
      this.allHistory = [];
    },
    isEvenRow(index) {
      if (index < 8)
        return true;
      if (index < 16)
        return false;
      if (index < 24)
        return true;
      if (index < 32)
        return false;
      if (index < 40)
        return true;
      if (index < 48)
        return false;
      if (index < 56)
        return true;
      return false;
    },
    getSquareColorClass(index) {
      const isEvenRow = this.isEvenRow(index);
      const isEvenCol = index % 2 === 0;
      if (isEvenRow && isEvenCol)
        return "squareWhite"
      if (!isEvenRow && isEvenCol)
        return "squareBlack"
      if (isEvenRow && !isEvenCol)
        return "squareBlack"
      if (!isEvenRow && !isEvenCol)
        return "squareWhite"
    },
  },

  watch: {
    currentPlayer() {
      if (this.isPlaying) {
        setTimeout(() => {
          if (this.isPlaying) this.makeTurn();
        }, Number(this.delayInSeconds) * 1000)
      }
    }
  },

  computed: {
    gameSquares() {
      if (this.currentPlayer) {//triggers update
        const squares = [];
        for (let i = 0; i < this.chess.board().length; i++) {
          for (let j = 0; j < this.chess.board()[0].length; j++) {
            const ruut = this.chess.board()[i][j];
            squares.push(ruut);
          }
        }
        return squares;
      }
      return null;
    }
  }
}
</script>

<style scoped>
button {
  margin: 10px;
}

.player-move-history {
  border: solid 1px black;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 14em;
  max-height: 14em;
  overflow-y: scroll;
}

.player-containers {
  display: flex;
  justify-content: center;
  gap: 2em;
}

.controls-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4em;
}


.container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.field {
  display: grid;
  grid-template-columns: repeat(8, 6em);
  margin-left: 2em;
}

.squareWhite {
  border: solid;
  border-bottom: none;
  background-color: #b9b9b6;
  display: flex;
  width: 6em;
  height: 6em;
  justify-content: center;
  align-items: center;
}

.squareBlack {
  border: solid;
  border-bottom: none;
  background-color: darkslategrey;
  display: flex;
  width: 6em;
  height: 6em;
  justify-content: center;
  align-items: center;
}
</style>
