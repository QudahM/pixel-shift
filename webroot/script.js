// Color Puzzle Game: Full JS Logic from Scratch

class ColorPuzzle {
  constructor() {
    this.gridSize = 4;
    this.colors = ["red", "blue", "yellow"];
    this.targetPattern = this.generatePattern();
    this.currentPattern = [...this.targetPattern];
    this.selectedTile = null;
    this.moveCount = 0;

    this.grid = document.getElementById("puzzle-grid");
    this.targetGrid = document.getElementById("target-grid");
    this.moveCounter = document.getElementById("move-count");
    this.shuffleBtn = document.getElementById("shuffle-btn");
    this.submitBtn = document.getElementById("submit-btn");
    this.leaderboard = document.getElementById("leaderboard");

    this.buildGrid();
    this.renderTargetPattern();
    this.shuffleTiles();
    this.bindEvents();
    this.listenForLeaderboardUpdates();
  }

  generatePattern() {
    const pattern = [];
    for (let i = 0; i < this.gridSize * this.gridSize; i++) {
      pattern.push(this.colors[i % this.colors.length]);
    }
    return pattern;
  }

  buildGrid() {
    this.grid.innerHTML = "";
    this.tiles = [];

    for (let i = 0; i < this.gridSize * this.gridSize; i++) {
      const tile = document.createElement("div");
      tile.className = "puzzle-tile";
      tile.dataset.index = i;
      tile.addEventListener("click", () => this.handleTileClick(i));
      this.grid.appendChild(tile);
      this.tiles.push(tile);
    }
    this.renderTiles();
  }

  renderTiles() {
    this.currentPattern.forEach((color, i) => {
      this.tiles[i].style.backgroundColor = color;
      this.tiles[i].classList.remove("selected");
    });
  }

  renderTargetPattern() {
    this.targetGrid.innerHTML = "";
    this.targetPattern.forEach((color) => {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.style.backgroundColor = color;
      this.targetGrid.appendChild(tile);
    });
  }

  shuffleTiles() {
    for (let i = this.currentPattern.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.currentPattern[i], this.currentPattern[j]] = [
        this.currentPattern[j],
        this.currentPattern[i],
      ];
    }
    this.moveCount = 0;
    this.moveCounter.textContent = this.moveCount;
    this.renderTiles();
  }

  handleTileClick(index) {
    if (this.selectedTile === null) {
      this.selectedTile = index;
      this.tiles[index].classList.add("selected");
    } else {
      if (index !== this.selectedTile && this.areAdjacent(index, this.selectedTile)) {
        [this.currentPattern[this.selectedTile], this.currentPattern[index]] = [
          this.currentPattern[index],
          this.currentPattern[this.selectedTile],
        ];
        this.moveCount++;
        this.moveCounter.textContent = this.moveCount;
      }
      this.tiles[this.selectedTile].classList.remove("selected");
      this.selectedTile = null;
      this.renderTiles();
    }
  }

  areAdjacent(i1, i2) {
    const row1 = Math.floor(i1 / this.gridSize);
    const col1 = i1 % this.gridSize;
    const row2 = Math.floor(i2 / this.gridSize);
    const col2 = i2 % this.gridSize;

    const rowDiff = Math.abs(row1 - row2);
    const colDiff = Math.abs(col1 - col2);

    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  }

  bindEvents() {
    this.shuffleBtn.addEventListener("click", () => this.shuffleTiles());
    this.submitBtn.addEventListener("click", () => this.checkWin());
  }

  checkWin() {
    const isWin = this.currentPattern.every(
      (color, idx) => color === this.targetPattern[idx]
    );

    if (isWin) {
      this.triggerWinEffect();
      this.sendScoreToDevvit();
    } else {
      alert("❌ Not yet! Keep trying.");
    }
  }

  triggerWinEffect() {
    const overlay = document.createElement("div");
    overlay.className = "win-overlay";
    overlay.innerHTML = `<div class="win-message">🎉 You solved it in ${this.moveCount} moves!</div>`;
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.classList.add("fade-out");
      setTimeout(() => overlay.remove(), 1000);
    }, 2000);
  }

  sendScoreToDevvit() {
    window.parent.postMessage(
      {
        type: "devvit-message",
        message: {
          type: "submitScore",
          data: { moves: this.moveCount }
        }
      },
      "*"
    );
  }

  listenForLeaderboardUpdates() {
    window.addEventListener("message", (event) => {
      if (!event.data || !event.data.message) return;

      const msg = event.data.message;
      if (msg.type === "updateLeaderboard") {
        const scores = msg.data.topScores;
        this.leaderboard.innerHTML = "";
        scores.forEach((entry) => {
          const li = document.createElement("li");
          li.textContent = `${entry.username}: ${entry.moves} moves`;
          this.leaderboard.appendChild(li);
        });
      }
    });
  }
}

const colorPuzzle = new ColorPuzzle();
