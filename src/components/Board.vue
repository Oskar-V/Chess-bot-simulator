<template>
  <div class="container">

    <div class="controls-container">
      <div>
        <div>Games played: {{ gameCounter }}</div><br/>
        <div v-if="gameCounter % 2 === 0">{{player1 ? player1 : "-"}} wins: {{ scoresData[0] }}</div>
        <div v-if="gameCounter % 2 === 0">{{player1 ? player1 : "-"}} ties: {{ scoresData[1] }}</div>
        <br  v-if="gameCounter % 2 === 0"/>
        <div>{{ player2 ? player2 : "-" }} wins: {{ scoresData[2]}}</div>
        <div>{{ player2 ? player2 : "-" }} ties: {{ scoresData[3] }}</div>
        <br  v-if="gameCounter % 2 !== 0"/>
        <div v-if="gameCounter % 2 !== 0">{{player1 ? player1 : "-"}} wins: {{ scoresData[0]  }}</div>
        <div v-if="gameCounter % 2 !== 0">{{player1 ? player1 : "-"}} ties: {{ scoresData[1] }}</div>
      </div>

      <div style="display: flex; gap: 1em;">
        <button v-if="isStart && !isPlaying && !isEndOfSimulations" @click="handlePlayClick">PLAY</button>
        <button v-if="!isStart && isPlaying && !isEndOfSimulations" @click="handlePauseClick">PAUSE</button>
        <button v-if="!isStart && !isPlaying && !isEndOfSimulations" @click="handleResumeClick">RESUME</button>
        <button v-if="!isStart || isEndOfSimulations" @click="handleRestartClick(true)">RESTART</button>
      </div>

      <div class="controls-inner-container">
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
        <div>
          <div>Switch sides automatically between games</div>
          <input class="switch" type="checkbox" name="scales" v-model="autoSwitchOnGames" >
        </div>
      </div>


      <div class="player-containers">
        <div>
          <div>Player 1 (white) ({{ player1History.length }})</div>
          <Select
              v-model="player1"
              allow-create
              clearable
              filterable
              no-data-text="No endpoints here..."
              placeholder="Select or enter endpoint">
            <Option
                v-for="item in endpointsMemory"
                :key="item"
                :label="item"
                :value="item">
              <div class="dropdown-option-container">
                {{item}}
                <button v-if="item !== 'Manual'" @click="handleRemoveClick(item)">remove</button>
              </div>
            </Option>
          </Select>
          <div v-if="player1 !== 'Manual'" class="player-move-history">
            <div v-for="(move, index) in player1History" :key="index">{{ move }}</div>
          </div>
          <div v-else-if="player1 === 'Manual' && currentPlayer === 'w' && isPlaying" class="player-available-moves">
              <button v-for="(move, index) in currentMoves" :key="index" class="move-button" @click="handleManualMoveClick(move)">
                {{ move }}
              </button>
          </div>
          <div v-else class="player-move-history"></div>
        </div>



        <div class="switch-container">
          <div>switch</div>
          <img @click="handleSwitchClick" src="../assets/exchange-alt-solid.svg" class="switch"/>
        </div>


        <div>
          <div>Player 2 (black) ({{ player2History.length }})</div>
          <Select
              v-model="player2"
              allow-create
              clearable
              filterable
              no-data-text="No endpoints here..."
              placeholder="Select or enter endpoint">
            <Option
                v-for="item in endpointsMemory"
                :key="item"
                :label="item"
                :value="item">
              <div class="dropdown-option-container">
                {{item}}
                <button v-if="item !== 'Manual'" @click="handleRemoveClick(item)">remove</button>
              </div>
            </Option>
          </Select>
          <div v-if="player2 !== 'Manual'" class="player-move-history">
            <div v-for="(move, index) in player2History" :key="index">{{ move }}</div>
          </div>
          <div v-else-if="player2 === 'Manual' && currentPlayer === 'b' && isPlaying" class="player-available-moves">
            <button v-for="(move, index) in currentMoves" :key="index" class="move-button" @click="handleManualMoveClick(move)">
              {{ move }}
            </button>
          </div>
          <div v-else class="player-move-history"></div>
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
        {{ 9 - i }}
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
import {Select, Option} from "element-ui";

export default {

  name: 'Board',
  components: {Piece, Select, Option},
  data() {
    return {
      delayInMs: 1000,
      player2: "",
      player1: "",
      allHistory: [],
      chess: new Chess(),
      currentPlayer: "w",
      isPlaying: false,
      isStart: true,
      isEndOfSimulations: false,
      gamesToBePlayed: 1,
      gameCounter: 0,
      moveLimitPerPlayer: 100,
      moveTriggerer: false,
      scores: {},
      autoSwitchOnGames: true,
      endpointsMemory: []
    }
  },

  methods: {
    handleRemoveClick(item){
      const index = this.endpointsMemory.indexOf(item);
      if (index > -1) {
        this.endpointsMemory.splice(index, 1);
      }
      localStorage.setItem("endpoints-memory", JSON.stringify(this.endpointsMemory));
      if (this.player1 === item)  this.player1 = "";
      if (this.player2 === item)  this.player2 = "";
    },
    handleManualMoveClick(move){
      this.executeMove(move);
      this.checkGameStatus();
    },
    executeMove(move){
      this.chess.move(move);
      if (this.currentPlayer === "w") {
        this.currentPlayer = "b";
        this.allHistory.push(move);
      } else if (this.currentPlayer === "b") {
        this.currentPlayer = "w";
        this.allHistory.push(move);
      }
    },
    checkGameStatus(){
      const moveLimitExceeded = Number(this.moveLimitPerPlayer) <= this.allHistory.length / 2;
      if (this.chess.game_over() || moveLimitExceeded) {
        this.gameCounter++;
        if (this.chess.in_draw() || this.chess.in_stalemate() || moveLimitExceeded) {
          this.scores[this.player1]["ties"] += 0.5;
          this.scores[this.player2]["ties"] += 0.5;
        } else {
          if (this.currentPlayer === "w") this.scores[this.player2]["wins"]++;
          if (this.currentPlayer !== "w") this.scores[this.player1]["wins"]++;
        }
        this.scores = JSON.parse(JSON.stringify(this.scores));
        this.isPlaying = false;
        this.isEndOfSimulations = true;
        if (Number(this.gameCounter) < Number(this.gamesToBePlayed)) {
          this.handleRestartClick(false);
          if (this.autoSwitchOnGames)this.handleSwitchClick();
          this.handlePlayClick();
        }
      } else {
        this.moveTriggerer = !this.moveTriggerer;
      }
    },
    handleSwitchClick() {
      const helper = this.player2;
      this.player2 = this.player1;
      this.player1 = helper;
    },
    makeAutomaticTurn() {
      const endpoint = this.currentPlayer === "w" ? this.player1 : this.player2;

      axios.post(endpoint, this.allHistory.join(" "),
          {
            headers: {
              'Content-Type': 'text/plain'
            }
          }
      )
          .then(response => {
            if (this.isStart && !this.isPlaying && !this.isEndOfSimulations) return;
            this.executeMove(response.data);
            this.checkGameStatus();
          }).catch(
          error => console.log(error)
      )
    },
    handlePlayClick() {
      this.updateEndpointsMemory();
      this.isStart = false;
      this.isPlaying = true;
      this.isEndOfSimulations = false;
      if (this.scores[this.player1] === undefined){
        this.scores[this.player1] = {wins: 0, ties: 0};
        this.scores[this.player2] = {wins: 0, ties: 0};
      }
      this.moveTriggerer = !this.moveTriggerer;
    },
    handlePauseClick() {
      this.isPlaying = false;
      this.isEndOfSimulations = false;
    },
    handleResumeClick() {
      this.isPlaying = true;
      this.isEndOfSimulations = false;
      this.moveTriggerer = !this.moveTriggerer;
    },
    handleRestartClick(hardReset) {
      this.isPlaying = false;
      this.isStart = true;
      this.chess = new Chess();
      this.currentPlayer = "w";
      this.allHistory = [];
      this.isEndOfSimulations = false;
      if (hardReset) {
        this.scores = {};
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
    updateEndpointsMemory(){
      if (!this.endpointsMemory.includes(this.player1) && this.player1.trim() !== ""){
          this.endpointsMemory.push(this.player1);
      }
      if (!this.endpointsMemory.includes(this.player2) && this.player2.trim() !== ""){
        this.endpointsMemory.push(this.player2);
      }
      localStorage.setItem("endpoints-memory", JSON.stringify(this.endpointsMemory));
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
      if (this.isPlaying) {
        if (!(this.currentPlayer === 'w' && this.player1 === 'Manual' || this.currentPlayer === 'b' && this.player2 === 'Manual')){
          setTimeout(() => {
            if (this.isPlaying) this.makeAutomaticTurn();
          }, Number(this.delayInMs))
        }
      }
    }
  },

  computed: {
    player1History() {
      const moves = [];
      for (let i = 0; i < this.allHistory.length; i++) {
        if (i % 2 === 0) {
          moves.push(this.allHistory[i]);
        }
      }
      return moves;
    },
    player2History() {
      const moves = [];
      for (let i = 0; i < this.allHistory.length; i++) {
        if (i % 2 !== 0) {
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
    },
    scoresData(){
      const data = [0 ,0 ,0 ,0];
      if (this.scores[this.player1]){
        data[0] = this.scores[this.player1]["wins"];
        data[1] = this.scores[this.player1]["ties"];
      }
      if (this.scores[this.player2]){
        data[2] = this.scores[this.player2]["wins"];
        data[3] = this.scores[this.player2]["ties"];
      }
      return data;
    },
    currentMoves: {
      cache: false,
      get() {
        return this.chess.moves();
      },
    },
  },
  mounted() {
    if (localStorage.getItem("endpoints-memory"))
      this.endpointsMemory = JSON.parse(localStorage.getItem("endpoints-memory"));
    if (!this.endpointsMemory.includes("Manual"))
      this.endpointsMemory.push("Manual");
  }
}
</script>

<style scoped>
button {
  margin: 10px;
}

.board-coords {
  font-size: 25px;
}

.player-move-history {
  border: solid 1px black;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 14em;
  width: 14em;
  max-height: 14em;
  overflow-y: scroll;
}

.player-available-moves{
  border: solid 1px black;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  height: 14em;
  width: 14em;
  max-height: 14em;
  overflow-y: scroll;
}

.move-button:hover{
  opacity: 0.7;
  cursor: pointer;
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
  gap: 2em;
}

.controls-inner-container{
  display: flex;
  flex-direction: column;
  gap: 1em;
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

.switch-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.switch {
  width: 1.2em;
  height: 1.2em;
}

.switch:hover {
  cursor: pointer;
  opacity: 0.7;
}

.dropdown-option-container{
  display: flex;
  justify-content: space-between;
}

button:hover{
  opacity: 0.7;
  cursor: pointer;
}
</style>
