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
          <div>Delay in ms: {{delayInMs}}</div>
          <div class="slidecontainer">
            <input v-model="delayInMs" type="range" min="0" max="5000" value="1000" class="slider">
          </div>
        </div>
        <div>
          <div>Games to be played</div>
          <input v-model="gamesToBePlayed" type="number" min="1" max="100000"></div>
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
      gameCounter: 0
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

            if (this.chess.game_over()) {
              this.gameCounter++;
              if (this.chess.in_draw() || this.chess.in_stalemate()){
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
    currentPlayer() {
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
