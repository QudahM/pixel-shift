class ColorPuzzle {
  constructor() {
    this.difficultySelect = document.getElementById("difficulty");
    this.grid = document.getElementById("puzzle-grid");
    this.targetGrid = document.getElementById("target-grid");
    this.moveCounter = document.getElementById("move-count");
    this.shuffleBtn = document.getElementById("shuffle-btn");
    this.submitBtn = document.getElementById("submit-btn");
    this.leaderboard = document.getElementById("leaderboard");
    this.completionStatus = document.getElementById("completion-status");
    this.timerDisplay = document.getElementById("timer");
    this.startTime = null;
    this.timerInterval = null;

    this.difficultySelect.addEventListener("change", () => this.applyDifficulty());

    const savedDifficulty = localStorage.getItem("difficulty");
    if (savedDifficulty) this.difficultySelect.value = savedDifficulty;

    this.applyDifficulty();
    this.bindEvents();
  }

  applyDifficulty() {
    const mode = this.difficultySelect.value;
    localStorage.setItem("difficulty", mode);
    this.completionStatus.style.display = "none";
    this.grid.classList.remove("glow", "glow-fade");

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
    this.loadLeaderboard();

    this.timerDisplay.textContent = "0:00";
    this.startTime = null;
    clearInterval(this.timerInterval);
    this.timerInterval = null;

    const key = `completed_${this.getDaySeed()}_${mode}`;
    if (localStorage.getItem(key)) {
      this.completionStatus.style.display = "block";
    }
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

  loadDailyPattern() {
    const seed = this.getDaySeed() + this.difficultySelect.value;
    const rng = this.seededRandom(seed);
    const pattern = [];
    for (let i = 0; i < this.gridSize * this.gridSize; i++) {
      pattern.push(this.colors[Math.floor(rng() * this.colors.length)]);
    }
    return pattern;
  }

  buildGrid() {
    this.grid.innerHTML = "";
    this.tiles = [];

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
    this.timerDisplay.textContent = "0:00";
    this.startTime = null;
    clearInterval(this.timerInterval);
    this.timerInterval = null;
  }

  handleTileClick(index) {
    if (this.selectedTile === null) {
      this.selectedTile = index;
      this.tiles[index].classList.add("selected");

      if (!this.startTime) {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
      }
    } else {
      if (index !== this.selectedTile && this.areAdjacent(index, this.selectedTile)) {
        const tileA = this.tiles[this.selectedTile];
        const tileB = this.tiles[index];
        tileA.classList.add("swap-animation");
        tileB.classList.add("swap-animation");

        [this.currentPattern[this.selectedTile], this.currentPattern[index]] = [
          this.currentPattern[index],
          this.currentPattern[this.selectedTile],
        ];

        this.moveCount++;
        this.moveCounter.textContent = this.moveCount;

        this.renderTiles();

        setTimeout(() => {
          tileA.classList.remove("swap-animation");
          tileB.classList.remove("swap-animation");
        }, 250);
      }

      this.tiles[this.selectedTile].classList.remove("selected");
      this.selectedTile = null;
    }
  }

  updateTimer() {
    if (!this.startTime) return;
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    this.timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
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
    this.shuffleBtn.addEventListener("click", () => {
      this.grid.classList.remove("glow", "glow-fade");
      this.shuffleTiles();
    });
    this.submitBtn.addEventListener("click", () => this.checkWin());
  }

  checkWin() {
    const isWin = this.currentPattern.every(
      (color, idx) => color === this.targetPattern[idx]
    );

    if (isWin) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      this.updateTimer();

      this.triggerWinEffect();
      this.saveToLeaderboard();
      const key = `completed_${this.getDaySeed()}_${this.difficultySelect.value}`;
      localStorage.setItem(key, "true");
      this.completionStatus.style.display = "block";
    } else {
      alert("❌ Not yet! Keep trying.");
    }
  }

  triggerWinEffect() {
    const overlay = document.createElement("div");
    overlay.className = "win-overlay";
    overlay.innerHTML = `<div class="win-message">🎉 You solved it in ${this.moveCount} moves!</div>`;
    document.body.appendChild(overlay);

    this.grid.classList.add("glow");

    setTimeout(() => {
      overlay.classList.add("fade-out");
      overlay.addEventListener("transitionend", () => overlay.remove(), { once: true });
    }, 2000);

    setTimeout(() => {
      this.grid.classList.add("glow-fade");
    }, 4000);
  }

  saveToLeaderboard() {
    const difficulty = this.difficultySelect.value;
    const dateKey = this.getDaySeed();
    const key = `leaderboard_${difficulty}_${dateKey}`;
    const stored = JSON.parse(localStorage.getItem(key)) || [];

    stored.push({ moves: this.moveCount, date: new Date().toISOString() });
    stored.sort((a, b) => a.moves - b.moves);
    const top5 = stored.slice(0, 5);
    localStorage.setItem(key, JSON.stringify(top5));
    this.renderLeaderboard(top5);
  }

  loadLeaderboard() {
    const difficulty = this.difficultySelect.value;
    const dateKey = this.getDaySeed();
    const key = `leaderboard_${difficulty}_${dateKey}`;
    const stored = JSON.parse(localStorage.getItem(key)) || [];
    this.renderLeaderboard(stored);
  }

  renderLeaderboard(entries) {
    this.leaderboard.innerHTML = "";
    entries.forEach((entry, index) => {
      const li = document.createElement("li");
      const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🎮";
      const date = new Date(entry.date).toLocaleDateString();
      li.textContent = `${medal} ${entry.moves} moves (${date})`;
      this.leaderboard.appendChild(li);
    });
  }
}

const colorPuzzle = new ColorPuzzle();