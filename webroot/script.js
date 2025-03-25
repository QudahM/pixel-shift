class ColorPuzzle {
  constructor() {
    this.difficultySelect = document.getElementById("difficulty");

    this.grid = document.getElementById("puzzle-grid");
    this.targetGrid = document.getElementById("target-grid");
    this.moveCounter = document.getElementById("move-count");
    this.shuffleBtn = document.getElementById("shuffle-btn");
    this.submitBtn = document.getElementById("submit-btn");
    this.leaderboard = document.getElementById("leaderboard");

    this.difficultySelect.addEventListener("change", () => this.applyDifficulty());

    const savedDifficulty = localStorage.getItem("difficulty");
    if (savedDifficulty) this.difficultySelect.value = savedDifficulty;

    this.applyDifficulty();
    this.bindEvents();
    this.listenForLeaderboardUpdates();
  }

  applyDifficulty() {
    const mode = this.difficultySelect.value;
    localStorage.setItem("difficulty", mode);

    if (mode === "easy") {
      this.gridSize = 3;
      this.colors = ["red", "blue"];
    } else if (mode === "medium") {
      this.gridSize = 4;
      this.colors = ["red", "blue", "yellow"];
    } else if (mode === "hard") {
      this.gridSize = 5;
      this.colors = ["red", "blue", "yellow", "green"];
    }

    this.targetPattern = this.loadDailyPattern();
    this.currentPattern = [...this.targetPattern];
    this.selectedTile = null;
    this.moveCount = 0;

    this.buildGrid();
    this.renderTargetPattern();
    this.shuffleTiles();
  }

  loadDailyPattern() {
    const seed = this.getDaySeed() + this.difficultySelect.value;
    const rng = this.seededRandom(seed);
    const pattern = [];
    for (let i = 0; i < this.gridSize * this.gridSize; i++) {
      pattern.push(this.colors[Math.floor(rng() * this.colors.length)]);
    }
    return pattern;
  }

  getDaySeed() {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  }

  seededRandom(seed) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return function () {
      h += h << 13;
      h ^= h >>> 7;
      h += h << 3;
      h ^= h >>> 17;
      h += h << 5;
      return ((h >>> 0) / 4294967295);
    };
  }

  buildGrid() {
    this.grid.innerHTML = "";
    this.tiles = [];

    // 🔧 Dynamic grid layout
    this.grid.style.gridTemplateColumns = `repeat(${this.gridSize}, 60px)`;
    this.grid.style.gridTemplateRows = `repeat(${this.gridSize}, 60px)`;

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

    // 🔧 Dynamic target grid layout
    this.targetGrid.style.gridTemplateColumns = `repeat(${this.gridSize}, 60px)`;
    this.targetGrid.style.gridTemplateRows = `repeat(${this.gridSize}, 60px)`;

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
        scores.forEach((entry, index) => {
          const li = document.createElement("li");
          const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🎮";
          li.textContent = `${medal} ${entry.username}: ${entry.moves} moves`;
          this.leaderboard.appendChild(li);
        });
      }
    });
  }
}

const colorPuzzle = new ColorPuzzle();
