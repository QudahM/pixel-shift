# Pixel Shift – Daily Puzzle Game

**Pixel Shift** is a web-based daily puzzle game built with [Devvit](https://developers.reddit.com/), where players rearrange colored tiles to match a target pattern in the fewest number of moves possible.

Each day presents a new randomized challenge with selectable difficulty levels. Players can monitor their top 5 personal scores per difficulty, with progress saved locally for daily challenges.

---

## Live Test Post

 [View test post on r/Pixel0Shift](https://www.reddit.com/r/Pixel0Shift/)  

---

## How It Works

- Each day, a new target color grid is generated based on the current date and difficulty.
- The player grid is shuffled and must be rearranged using adjacent swaps to match the target.
- The player can select from three difficulty levels:
  - 🟢 Easy (3x3, 2 colors)
  - 🟡 Medium (4x4, 3 colors)
  - 🔴 Hard (5x5, 4 colors)
- Each player strives for **the fewest moves**, with scores stored privately per user through Devvit Redis.

---

## Tutorial

1. **Start the Puzzle**
   - Head to the [daily puzzle post](https://www.reddit.com/r/Pixel0Shift/).
   - Click the **“Start Puzzle”** button to launch the game in a WebView.

2. **Choose a Difficulty**
   - Select your preferred mode: 🟢 Easy (3x3), 🟡 Medium (4x4), 🔴 Hard (5x5).

3. **Understand the Goal**
   - On the left is the **target pattern**.
   - On the right is your **puzzle grid**, shuffled.

4. **Make Moves**
   - Click one tile, then another **adjacent** tile to swap them.
   - Keep swapping to recreate the target pattern.

5. **Track Your Progress**
   - A **timer** starts when you make your first move.
   - Your **move count** updates live as you play.

6. **Submit Your Solution**
   - Click **“✅ Submit”** to check if your puzzle matches the target.
   - If correct, a win animation plays, and your score is recorded!

7. **Leaderboard**
   - If your move count is better than your previous best, it gets saved.
   - View your **Top 5 scores** by difficulty level in the leaderboard below the puzzle.

---

## Features

- **Daily Puzzle**: New color layout every 24 hours based on date seed.
- **Three Difficulty Levels**: Tweak complexity based on skill.
- **Leaderboard**: Tracks and displays your personal bests.
- **Timer**: Tracks how long it takes to solve each puzzle.
- **Animations & Effects**: Smooth swap transitions and win visuals.
- **Zero Setup**: Launches instantly from a Reddit post using Devvit.

---

## Tech Stack

| Technology   | Use |
|--------------|-----|
| **Devvit API** | Post creation, leaderboard syncing, and user state |
| **Redis**     | Leaderboard persistence |
| **WebView**   | Interactive UI with HTML/CSS/JS |
| **TypeScript + JSX** | Devvit UI logic & communication |
| **HTML/CSS/JS** | Frontend puzzle game |

---

## Credits

 - Inspired by classic sliding tile puzzles and daily challenge games like Wordle.

---

## License

[MIT License](https://opensource.org/licenses/MIT). Feel free to fork, remix, and expand the puzzle.
