// ===== script.js =====
(function() {
  // ---------- STATE ----------
  const boardEl = document.getElementById('boardContainer');
  const statusEl = document.getElementById('statusMessage');
  const restartBtn = document.getElementById('restartBtn');
  
  // New win screen elements
  const winScreen = document.getElementById('winScreen');
  const winMessage = document.getElementById('winMessage');
  const winNewGameBtn = document.getElementById('winNewGameBtn');

  let board = Array(9).fill(null);          // 'X', 'O' or null
  let currentPlayer = 'X';
  let gameActive = true;
  let winnerInfo = null;                      // { winner, winCombo } or null (draw: winner='draw')

  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  // helper: evaluate win/draw from current board
  function checkWinner() {
    for (let p of winPatterns) {
      const [a, b, c] = p;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], winCombo: p };
      }
    }
    if (board.every(cell => cell !== null)) {
      return { winner: 'draw', winCombo: null };
    }
    return null; // game still on
  }

  // Show win screen with appropriate message
  function showWinScreen(message) {
    winMessage.textContent = message;
    winScreen.classList.add('show');
  }

  // Hide win screen
  function hideWinScreen() {
    winScreen.classList.remove('show');
  }

  // render board & status based on state
  function render() {
    boardEl.innerHTML = '';

    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('button');
      cell.className = 'cell';
      cell.dataset.index = i;
      
      // Set the text content and data-value attribute for coloring
      const cellValue = board[i];
      cell.textContent = cellValue || '';
      if (cellValue) {
        cell.dataset.value = cellValue;  // 'X' or 'O' for CSS
      } else {
        cell.removeAttribute('data-value');
      }

      // disable if game inactive / cell taken / winner exists
      const free = board[i] === null;
      if (!gameActive || !free || winnerInfo !== null) {
        cell.disabled = true;
      } else {
        cell.disabled = false;
      }

      // highlight winning cells
      if (winnerInfo && winnerInfo.winCombo && winnerInfo.winCombo.includes(i)) {
        cell.classList.add('win-glow');
      } else {
        cell.classList.remove('win-glow');
      }

      cell.addEventListener('click', handleClick);
      // kill any touch zoom on cell
      cell.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });

      boardEl.appendChild(cell);
    }

    // update status message (only if game active and no winner screen yet)
    if (!gameActive || winnerInfo) {
      if (winnerInfo && winnerInfo.winner && winnerInfo.winner !== 'draw') {
        statusEl.textContent = `🏆 Player ${winnerInfo.winner} wins! 🏆`;
        // Show the win screen with victory message
        showWinScreen(`🏆 PLAYER ${winnerInfo.winner} WINS! 🏆`);
      } else if (winnerInfo && winnerInfo.winner === 'draw') {
        statusEl.textContent = `😲 It's a draw!`;
        // Show the win screen with draw message
        showWinScreen(`🤝 IT'S A DRAW! 🤝`);
      } else {
        statusEl.textContent = `Game over`;
      }
    } else {
      statusEl.textContent = `Player ${currentPlayer}'s turn`;
    }
  }

  // click handler
  function handleClick(e) {
    const idx = parseInt(e.currentTarget.dataset.index, 10);
    if (!gameActive || board[idx] !== null || winnerInfo !== null) return;

    // apply move
    board[idx] = currentPlayer;

    const result = checkWinner();
    if (result) {
      winnerInfo = result;    // contains winner + combo (or draw)
      gameActive = false;
    } else {
      // no win, no draw: switch player
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    }

    render();
  }

  // reset everything (used by both buttons)
  function resetGame() {
    board = Array(9).fill(null);
    currentPlayer = 'X';
    gameActive = true;
    winnerInfo = null;
    hideWinScreen();          // hide win/draw modal
    render();
  }

  // attach restart buttons
  restartBtn.addEventListener('click', resetGame);
  restartBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    resetGame();
  }, { passive: false });

  // Win screen "PLAY AGAIN" button
  winNewGameBtn.addEventListener('click', resetGame);
  winNewGameBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    resetGame();
  }, { passive: false });

  // disable context menu on all interactive elements
  document.querySelectorAll('.cell, .restart-btn, .win-newgame-btn').forEach(el => {
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  });

  // initial render
  render();
})();