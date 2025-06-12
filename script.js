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
let isTouching = false;
let dropInterval;
let playerX = 175;
const moveAmount = 20;
let lightLevel = 0


// Character selection
function detectInstructions() {
  const instructions = [
    "🕹️ Move your character left and right to catch the books.",
    "📱 On smartphone: Hold and drag your character left/right",
    "👆 Tap and hold directly on your character to move",
    "🖱️ Using mouse: Click and hold on your character to drag left/right.",
    "⌨️ On Keyboard: Use Left ⬅️ and Right ➡️ arrow keys to move"
  ];

  const instructionList = document.getElementById("instruction-list");
  instructionList.innerHTML = "";
  instructions.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    instructionList.appendChild(li);
  });
}

document.querySelectorAll(".char-option").forEach(option => {
  option.addEventListener("click", () => {
    document.querySelectorAll(".char-option").forEach(o => o.classList.remove("selected"));
    option.classList.add("selected");
    selectedCharacter = option.dataset.char;
    startBtn.disabled = false;
  });
});

// Call it when page loads
detectInstructions();

// Start game
startBtn.addEventListener("click", () => {
  startScreen.style.display = "none";
  gameScreen.classList.remove("hidden");

  // Always start at level 1 background
  const container = document.getElementById("game-container");
  container.classList.remove("bg-level-1", "bg-level-2", "bg-level-3", "bg-level-4");
  container.classList.add("bg-level-1");

  player.innerHTML = `<img src="images/player-${selectedCharacter}.png" alt="${selectedCharacter}" class="player-sprite">`;

  score = 0;
  misses = 0;
  playerX = 175;
  player.style.left = `${playerX}px`;

  updateScoreDisplay();
  updateHearts();
  startDroppingBooks();
});


// Keyboard movement
document.addEventListener("keydown", (e) => {
  if (!gameScreen.classList.contains("hidden")) {
    if (e.key === "ArrowLeft" && playerX > 0) {
      playerX -= moveAmount;
    } else if (e.key === "ArrowRight" && playerX < 350) {
      playerX += moveAmount;
    }
    player.style.left = `${playerX}px`;
  }
});

// Touch movement
gameContainer.addEventListener("touchstart", (e) => {
  isTouching = true;
  moveToTouch(e.touches[0]);
});
gameContainer.addEventListener("touchmove", (e) => {
  if (isTouching) moveToTouch(e.touches[0]);
});
gameContainer.addEventListener("touchend", () => {
  isTouching = false;
});
function moveToTouch(touch) {
  const rect = gameContainer.getBoundingClientRect();
  const relativeX = touch.clientX - rect.left;
  const clampedX = Math.max(0, Math.min(relativeX - 25, 350));
  playerX = clampedX;
  player.style.left = `${playerX}px`;
}

// Mouse drag movement
let isMouseDragging = false;

player.addEventListener("mousedown", (e) => {
  isMouseDragging = true;
});

document.addEventListener("mouseup", () => {
  isMouseDragging = false;
});

document.addEventListener("mousemove", (e) => {
  if (isMouseDragging) {
    const rect = gameContainer.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const clampedX = Math.max(0, Math.min(relativeX - 25, 350));
    playerX = clampedX;
    player.style.left = `${playerX}px`;
  }
});


// Score display
function updateScoreDisplay() {
  scoreDisplay.textContent = score.toString().padStart(6, '0');
}

// Heart display
function updateHearts() {
  for (let i = 1; i <= maxMisses; i++) {
    const heart = document.getElementById(`heart-${i}`);
    heart.textContent = i <= (maxMisses - misses) ? "❤️" : "🖤";
  }
}

// Popup messages
function showPopup(message, isBlessing = false) {
  const popupText = document.getElementById("popup-text");
  popupText.innerHTML = isBlessing
    ? `<img src="images/bookofmormon.png" alt="Book of Mormon" class="popup-book"><span>${message}</span>`
    : message;

  const popup = document.getElementById("popup");
  popup.classList.remove("hidden");
  setTimeout(() => popup.classList.add("hidden"), 2000);
}

// Book drop logic
function dropBook() {
  const book = document.createElement("div");
  book.classList.add("book");
  let fallSpeed = getFallSpeed (score);
  book.style.animation = 'fall ${fallSpeed}ms linear';
  book.innerHTML = `<img src="images/bookofmormon.png" alt="Book of Mormon" class="book-sprite">`;

  let bookX = Math.floor(Math.random() * 360);
  book.style.left = bookX + "px";
  gameContainer.appendChild(book);

  let check = setInterval(() => {
    const bookRect = book.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();
    
    // Get relative positions inside game container
    const bookTop = bookRect.top - containerRect.top;
    const bookLeft = bookRect.left - containerRect.left;
    const playerLeft = playerRect.left - containerRect.left;

    const playerRight = playerLeft + playerRect.width;
    const bookCenter = bookLeft + (bookRect.width / 2);

   if (bookTop >= 440 && bookTop <= 500) {
  const isCaught = bookCenter >= playerLeft && bookCenter <= playerRight;
  clearInterval(check); // stop checking once it's caught or missed
  book.remove(); // remove the book either way
  
  
  if (isCaught) {
    score += 100;
    if (lightLevel < 4) lightLevel++; 
    updateScoreDisplay();
    updateBackground();
    clearInterval(dropInterval);
    startDroppingBooks();
    showPopup(randomBlessing(), true);
  } else {
    misses++;
    lightLevel = -3;
    updateHearts();
    updateBackground();
    clearInterval(dropInterval);
    startDroppingBooks();
    
    if (misses >= maxMisses) {
      showPopup("💔 You've missed too many. Game over.");
      setTimeout(() => endGame(), 2000);
    } else {
      showPopup(randomMissed(), false);
    }
  }
}
}, 100);

  book.addEventListener("animationend", () => {
    book.remove();
    clearInterval(check);
  });
}

// Start dropping
function startDroppingBooks() {
  clearInterval(dropInterval);

  let currentInterval = getDropSpeed (score);
  dropInterval = setInterval(() => {
    if (!gameScreen.classList.contains("hidden")) dropBook();
  }, currentInterval);
}

//Background changing
function updateBackground() {
  const container = document.getElementById("game-container");
  //container.classList.remove("bg-level-0", "bg-level-1", "bg-level-2", "bg-level-3"); 
  container.className = "";

  // Clamp lightLevel between -3 (black) and 4 (white)
  lightLevel = Math.max(-3, Math.min(4, lightLevel));

  const classMap = {
    "-3": "bg-dark-3",
    "-2": "bg-dark-2",
    "-1": "bg-dark-1",
     0: "bg-level-0",
     1: "bg-level-1",
     2: "bg-level-2",
     3: "bg-level-3",
     4: "bg-level-4"
  };

  container.classList.add(classMap[lightLevel]);
}
//   // Light levels based on score (progression toward white)
//   if (score >= 400) {
//     container.classList.add("bg-level-4");
//   } else if (score >= 300) {
//     container.classList.add("bg-level-3");
//   } else if (score >= 200) {
//     container.classList.add("bg-level-2");
//   } else if (score >= 100) {
//     container.classList.add("bg-level-1");
//   } else {
//     container.classList.add("bg-level-0");
//   }

//   // If player missed, override it with darker backgrounds
//   if (misses === 1) {
//     container.classList.remove("bg-level-4", "bg-level-3", "bg-level-2", "bg-level-1", "bg-level-0");
//     container.classList.add("bg-dark-1");
//   } else if (misses === 2) {
//     container.classList.remove("bg-dark-1");
//     container.classList.add("bg-dark-2");
//   } else if (misses >= 3) {
//     container.classList.remove("bg-dark-2");
//     container.classList.add("bg-dark-3");
//   }
// }

// End game
function endGame() {
  gameScreen.classList.add("hidden");
  document.getElementById("final-score").textContent = score.toString().padStart(6, '0');
  document.getElementById("reflection-screen").classList.remove("hidden");
}

// Scripture messages
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

document.getElementById("howto-continue").addEventListener("click", () => {
  document.getElementById("how-to-play").style.display = "none";
  document.getElementById("start-screen").style.display = "block";
});

document.addEventListener("DOMContentLoaded", () => {
  detectInstructions();
  // any other startup logic
});

function getFallSpeed (score) {
  if (score >= 400) return 1000;
  if (score >= 300) return 1200;
  if (score >= 200) return 1400;
  if (score >= 100) return 1600;
  return 2000;
}

function getDropSpeed (score) {
  if (score >= 400) return 1000;
  if (score >= 300) return 1200;
  if (score >= 200) return 1400;
  if (score >= 100) return 1600;
  return 2000;
}
