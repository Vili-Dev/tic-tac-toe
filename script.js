window.addEventListener("DOMContentLoaded", () => {
  const board = document.getElementById("board");
  const gameStatus = document.getElementById("gameStatus");
  const restartBtn = document.getElementById("restart");
  const modePvP = document.getElementById("modePvP");
  const modeIAeasy = document.getElementById("modeIAeasy");
  const modeIAhard = document.getElementById("modeIAhard");
  const modal = document.getElementById("modalStart");
  const btnYes = document.getElementById("btnStartYes");
  const btnNo = document.getElementById("btnStartNo");

  const soundClick = new Audio("sounds/click.wav");
  const soundWin = new Audio("sounds/win.wav");
  const soundDraw = new Audio("sounds/draw.wav");

  let cells = [];
  let currentPlayer = "X";
  let gameOver = false;
  let vsAI = false;
  let difficulty = "";
  let winningCombo = [];
  let iaStarts = false;

  function createBoard() {
    board.innerHTML = "";
    cells = [];
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.index = i;
      cell.addEventListener("click", handleClick);
      board.appendChild(cell);
      cells.push(cell);
    }
    currentPlayer = "X";
    gameOver = false;
    winningCombo = [];
    restartBtn.style.display = "inline-block";
    clearWinHighlight();

    if (vsAI && iaStarts && !gameOver) {
      currentPlayer = "O";
      gameStatus.textContent = "🤖 commence...";
      setTimeout(() => {
        difficulty === "normal" ? aiRandom() : aiMinimax();
      }, 500);
    } else {
      currentPlayer = "X";
      gameStatus.textContent = vsAI ? "À ton tour ❌" : "Au tour de ❌";
    }
  }

  function handleClick(e) {
    const cell = e.target;
    if (cell.textContent !== "" || gameOver) return;

    if (vsAI && iaStarts && currentPlayer === "O") return;

    cell.textContent = currentPlayer;
    soundClick.play();

    if (checkWin()) {
      highlightWin(winningCombo);
      gameStatus.textContent = `🎉 ${currentPlayer} a gagné !`;
      soundWin.play();
      gameOver = true;
      return;
    }

    if (checkDraw()) {
      gameStatus.textContent = "Match nul 🤝";
      soundDraw.play();
      gameOver = true;
      return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    gameStatus.textContent = `Au tour de ${currentPlayer === "X" ? "❌" : "⭕"}`;

    if (vsAI && currentPlayer === "O" && !gameOver) {
      setTimeout(() => {
        difficulty === "normal" ? aiRandom() : aiMinimax();
        soundClick.play();
      }, 400);
    }
  }

  function aiRandom() {
    let empty = cells.filter(cell => cell.textContent === "");
    if (empty.length === 0) return;

    let randomCell = empty[Math.floor(Math.random() * empty.length)];
    randomCell.textContent = "O";

    if (checkWin()) {
      highlightWin(winningCombo);
      gameStatus.textContent = "🤖 L'IA a gagné !";
      gameOver = true;
      return;
    }

    if (checkDraw()) {
      gameStatus.textContent = "Match nul 🤝";
      gameOver = true;
      return;
    }

    currentPlayer = "X";
    gameStatus.textContent = "À ton tour ❌";
  }

  function aiMinimax() {
    let bestScore = -Infinity;
    let move;

    cells.forEach((cell, index) => {
      if (cell.textContent === "") {
        cell.textContent = "O";
        let score = minimax(0, false);
        cell.textContent = "";
        if (score > bestScore) {
          bestScore = score;
          move = index;
        }
      }
    });

    cells[move].textContent = "O";

    if (checkWin()) {
      highlightWin(winningCombo);
      gameStatus.textContent = "🤖 L'IA a gagné !";
      gameOver = true;
      return;
    }

    if (checkDraw()) {
      gameStatus.textContent = "Match nul 🤝";
      gameOver = true;
      return;
    }

    currentPlayer = "X";
    gameStatus.textContent = "À ton tour ❌";
  }

  function minimax(depth, isMaximizing) {
    if (checkWinFor("O")) return 10 - depth;
    if (checkWinFor("X")) return depth - 10;
    if (checkDraw()) return 0;

    if (isMaximizing) {
      let best = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (cells[i].textContent === "") {
          cells[i].textContent = "O";
          let score = minimax(depth + 1, false);
          cells[i].textContent = "";
          best = Math.max(score, best);
        }
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < 9; i++) {
        if (cells[i].textContent === "") {
          cells[i].textContent = "X";
          let score = minimax(depth + 1, true);
          cells[i].textContent = "";
          best = Math.min(score, best);
        }
      }
      return best;
    }
  }

  function checkWin() {
    const combos = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    for (let combo of combos) {
      const [a,b,c] = combo;
      if (
        cells[a].textContent &&
        cells[a].textContent === cells[b].textContent &&
        cells[b].textContent === cells[c].textContent
      ) {
        winningCombo = combo;
        return true;
      }
    }
    return false;
  }

  function checkWinFor(player) {
    const combos = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    return combos.some(([a,b,c]) =>
      cells[a].textContent === player &&
      cells[b].textContent === player &&
      cells[c].textContent === player
    );
  }

  function checkDraw() {
    return cells.every(cell => cell.textContent !== "");
  }

  function highlightWin(combo) {
    combo.forEach(i => {
      cells[i].classList.add("win");
    });
  }

  function clearWinHighlight() {
    cells.forEach(cell => {
      cell.classList.remove("win");
    });
  }

  function askWhoStarts() {
    modal.classList.remove("hidden");
  }

  restartBtn.addEventListener("click", createBoard);

  modePvP.addEventListener("click", () => {
    vsAI = false;
    iaStarts = false;
    difficulty = "";
    createBoard();
    gameStatus.textContent = "Mode joueur vs joueur - Au tour de ❌";
  });

  modeIAeasy.addEventListener("click", () => {
    vsAI = true;
    difficulty = "normal";
    askWhoStarts();
  });

  modeIAhard.addEventListener("click", () => {
    vsAI = true;
    difficulty = "hard";
    askWhoStarts();
  });

  btnYes.addEventListener("click", () => {
    iaStarts = false;
    modal.classList.add("hidden");
    createBoard();
  });

  btnNo.addEventListener("click", () => {
    iaStarts = true;
    modal.classList.add("hidden");
    createBoard();
  });

  createBoard();
});