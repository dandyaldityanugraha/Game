let selectedCharacter = "";
const startBtn = document.getElementById("start-btn");
const player = document.getElementById("player");
const gameScreen = document.getElementById("game-screen");
const startScreen = document.getElementById("start-screen");
const gameContainer = document.getElementById("game-container");
const scoreDisplay = document.getElementById("score-display");

let score = 0;

let misses = 0;
const maxMisses = 3; 


// Character selection
document.querySelectorAll(".char-option").forEach(option => {
  option.addEventListener("click", () => {
    document.querySelectorAll(".char-option").forEach(o => o.classList.remove("selected"));
    option.classList.add("selected");
    selectedCharacter = option.dataset.char;
    startBtn.disabled = false;
  });
});

// Start game
startBtn.addEventListener("click", () => {
  startScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  player.innerHTML = `<img src="images/player-${selectedCharacter}.png" alt="${selectedCharacter}" class="player-sprite">`;
  score = 0;
  updateScoreDisplay();
  startDroppingBooks();

  misses = 0;
  updateHearts();

});

// Move player
let playerX = 175;
const moveAmount = 20;

document.addEventListener("keydown", (e) => {
  if (!gameScreen.classList.contains("hidden")) {
    if (e.key === "ArrowLeft" && playerX > 0) {
      playerX -= moveAmount;
    } else if (e.key === "ArrowRight" && playerX < 360) {
      playerX += moveAmount;
    }
    player.style.left = playerX + "px";
  }
});

// Score formatter
function updateScoreDisplay() {
  scoreDisplay.textContent = score.toString().padStart(6, '0');
}

// Blessings and misses
const blessings = [
  " Alma 37:6 — Small and simple things bring great things.",
  " Mosiah 2:41 — Obedience brings joy.",
  " 2 Nephi 2:25 — Men are that they might have joy.",
];

const missed = [
  "😔 Missed a moment of peace.",
  "😢 Without scriptures, hope fades.",
  "💭 Feeling spiritually lost.",
];

function randomBlessing() {
  return blessings[Math.floor(Math.random() * blessings.length)];
}

function randomMissed() {
  return missed[Math.floor(Math.random() * missed.length)];
}

function showPopup(message, isBlessing = false) {
  const popupText = document.getElementById("popup-text");

  if (isBlessing) {
    popupText.innerHTML = `
      <img src="images/bookofmormon.png" alt="Book of Mormon" class="popup-book">
      <span>${message}</span>
    `;
  } else {
    popupText.textContent = message;
  }

  const popup = document.getElementById("popup");
  popup.classList.remove("hidden");

  // Auto-hide after 2 seconds
  setTimeout(() => {
    popup.classList.add("hidden");
  }, 2000);

  document.getElementById("popup").classList.remove("hidden");
}


function closePopup() {
  document.getElementById("popup").classList.add("hidden");
}

// Drop books
function dropBook() {
  const book = document.createElement("div");
  book.classList.add("book");
  book.innerHTML = `<img src="images/bookofmormon.png" alt="Book of Mormon" class="book-sprite">`;

  let bookX = Math.floor(Math.random() * 360);
  book.style.left = bookX + "px";
  gameContainer.appendChild(book);

  let check = setInterval(() => {
    const bookTop = parseInt(window.getComputedStyle(book).top);
    const playerLeft = parseInt(player.style.left);

    if (bookTop >= 440 && bookTop <= 500) {
      if (Math.abs(playerLeft - bookX) < 40) {
        score += 100;
        updateScoreDisplay();
        showPopup(randomBlessing(), true); // show book image
        book.remove();
        clearInterval(check);
      }
    }

    if (bookTop > 490) {
      misses++;
      updateHearts();
      book.remove();
      clearInterval(check);
      
      if (misses >= maxMisses) {
        setTimeout(() => {
          showPopup("💔 You've missed too many. Game over.");
          setTimeout(() => endGame(), 100); // allow time for popup
        }, 100);
      } else {
        showPopup(randomMissed(), false);
      }
    }  
  }, 100);

  book.addEventListener("animationend", () => {
    book.remove();
    clearInterval(check);
  });
}


function startDroppingBooks() {
  setInterval(() => {
    if (!gameScreen.classList.contains("hidden")) {
      dropBook();
    }
  }, 3000);
}

function endGame() {
  gameScreen.classList.add("hidden");
  document.getElementById("final-score").textContent = score.toString().padStart(6, '0');
  document.getElementById("reflection-screen").classList.remove("hidden");
}

function updateHearts() {
  for (let i = 1; i <= maxMisses; i++) {
    const heart = document.getElementById(`heart-${i}`);
    heart.textContent = i <= (maxMisses - misses) ? "❤️" : "🖤";
  }
}
