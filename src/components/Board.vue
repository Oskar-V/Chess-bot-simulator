<template>
  <div class="container">

    <div class="controls-container">
      <div>
        <div>Games played: {{gameCounter}}</div>
        <div>White wins: {{whiteWins}}</div>
        <div>Black wins: {{blackWins}}</div>
      </div>

      <div style="display: flex; gap: 1em;">
        <button v-if="isStart && !isPlaying && !isEndOfSimulations" @click="handlePlayClick">PLAY</button>
        <button v-if="!isStart && isPlaying && !isEndOfSimulations" @click="handlePauseClick">PAUSE</button>
        <button v-if="!isStart && !isPlaying && !isEndOfSimulations" @click="handleResumeClick">RESUME</button>
        <button v-if="!isStart || isEndOfSimulations" @click="handleRestartClick(true)">RESTART</button>
      </div>

      <div style="display: flex; gap: 1em;">
        <div>
          <div>Delay in ms</div>
            <input v-model="delayInMs" type="number" min="0" max="5000">
        </div>
        <div>
          <div>Games to be played</div>
          <input v-model="gamesToBePlayed" type="number" min="1" max="100000">
        </div>
        <div>
          <div>Move limit per player</div>
          <input v-model="moveLimitPerPlayer" type="number" min="1" max="100000">
        </div>
      </div>


      <div class="player-containers">
        <div>
          <div>White player ({{whiteHistory.length}})</div>
          <input v-model="whitePlayerEndpoint"/>
          <div class="player-move-history">
            <div v-for="(move, index) in whiteHistory" :key="index">{{ move }}</div>
          </div>
        </div>
        <div>
          <div>Black player ({{blackHistory.length}})</div>
          <input v-model="blackPlayerEndpoint"/>
          <div class="player-move-history">
            <div v-for="(move, index) in blackHistory" :key="index">{{ move }}</div>
          </div>
        </div>
      </div>

    </div>


    <div style="display: flex; flex-direction: column; height: 100%; margin-left: 6em;">
      <div
          class="board-coords"
          v-for="i in 8"
          :key="`${i}`"
          style="height: 6rem; display: flex; align-items: center;  border: solid transparent;border-bottom-style: none;"
      >
        {{ 8 - i }}
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
      <div
          class="board-coords"
          v-for="(char, index) in ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']"
          :key="`${index}${char}`"
          style="display: flex; justify-content: center"
      >
        {{ char }}
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
      delayInMs: 1000,
      blackPlayerEndpoint: "",
      whitePlayerEndpoint: "",
      allHistory: [],
      chess: new Chess(),
      currentPlayer: "w",
      isPlaying: false,
      isStart: true,
      isEndOfSimulations: false,
      whiteWins: 0,
      blackWins: 0,
      gamesToBePlayed: 1,
      gameCounter: 0,
      moveLimitPerPlayer: 100,
      moveTriggerer:false
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
              this.allHistory.push(response.data);
            } else if (this.currentPlayer === "b") {
              this.currentPlayer = "w";
              this.allHistory.push(response.data);
            }

            const moveLimitExceeded = Number(this.moveLimitPerPlayer) <= this.allHistory.length / 2 ;
            if (this.chess.game_over() || moveLimitExceeded){
              this.gameCounter++;
              if (this.chess.in_draw() || this.chess.in_stalemate() || moveLimitExceeded){
                this.blackWins += 0.5;
                this.whiteWins += 0.5;
              }else{
                if (this.currentPlayer === "w")this.blackWins++;
                if (this.currentPlayer !== "w")this.whiteWins++;
              }
              this.isPlaying = false;
              this.isEndOfSimulations = true;
              if (Number(this.gameCounter) < Number(this.gamesToBePlayed)){
                this.handleRestartClick(false);
                this.handlePlayClick();
              }
            }else{
              this.moveTriggerer = !this.moveTriggerer;
            }
          }).catch(
          error => console.log(error)
      )
    },
    handlePlayClick() {
      this.isStart = false;
      this.isPlaying = true;
      this.isEndOfSimulations = false;
      this.makeTurn();
    },
    handlePauseClick() {
      this.isPlaying = false;
      this.isEndOfSimulations = false;
    },
    handleResumeClick() {
      this.isPlaying = true;
      this.makeTurn();
      this.isEndOfSimulations = false;
    },
    handleRestartClick(hardReset) {
      this.isPlaying = false;
      this.isStart = true;
      this.chess = new Chess();
      this.currentPlayer = "w";
      this.allHistory = [];
      this.isEndOfSimulations = false;
      if (hardReset){
        this.whiteWins = 0;
        this.blackWins = 0;
        this.gameCounter = 0;
      }
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
    moveTriggerer() {
      if (this.isPlaying ) {
        setTimeout(() => {
          if (this.isPlaying ) this.makeTurn();
        }, Number(this.delayInMs))
      }
    }
  },

  computed: {
    blackHistory(){
      const moves = [];
      for (let i = 0; i < this.allHistory.length; i++) {
        if (i % 2 !== 0){
          moves.push(this.allHistory[i]);
        }
      }
      return moves;
    },
    whiteHistory(){
      const moves = [];
      for (let i = 0; i < this.allHistory.length; i++) {
        if (i % 2 === 0){
          moves.push(this.allHistory[i]);
        }
      }
      return moves;
    },
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

.board-coords{
  font-size: 25px;
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
}

.field {
  display: grid;
  grid-template-columns: repeat(8, 6rem);
  margin-left: 10px;
}

.squareWhite {
  border: solid;
  border-bottom: none;
  background-color: #b9b9b6;
  display: flex;
  width: 6rem;
  height: 6rem;
  justify-content: center;
  align-items: center;
}

.squareBlack {
  border: solid;
  border-bottom: none;
  background-color: darkslategrey;
  display: flex;
  width: 6rem;
  height: 6rem;
  justify-content: center;
  align-items: center;
}
</style>
