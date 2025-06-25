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
let lightLevel = 0;
let gameActive = false;

// Add test mode for collision debugging
let testMode = false; // Disable test mode

// Utility functions for fixed sizing
function getContainerWidth() {
  return 400; // Fixed width from CSS
}
function getContainerHeight() {
  return 500; // Fixed height from CSS
}
function getPlayerWidth() {
  return 50; // Fixed player width from CSS
}
function getBookWidth() {
  return 40; // Fixed book width from CSS
}

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
  gameActive = true;

  // Always start at level 1 background
  gameContainer.classList.remove("bg-level-1", "bg-level-2", "bg-level-3", "bg-level-4");
  gameContainer.classList.add("bg-level-1");

  player.innerHTML = `<img src="images/player-${selectedCharacter}.png" alt="${selectedCharacter}" class="player-sprite">`;

  score = 0;
  misses = 0;
  lightLevel = 0;
  // Fixed initial player position (centered)
  playerX = 175; // Fixed center position
  player.style.left = `${playerX}px`;

  updateScoreDisplay();
  updateHearts();
  updateBackground();
  startDroppingBooks();
});

// Keyboard movement
document.addEventListener("keydown", (e) => {
  if (!gameActive) return;
  
  const maxX = 400 - 50; // Fixed container width - player width
  if (e.key === "ArrowLeft" && playerX > 0) {
    playerX -= moveAmount;
  } else if (e.key === "ArrowRight" && playerX < maxX) {
    playerX += moveAmount;
  }
  playerX = Math.max(0, Math.min(playerX, maxX));
  player.style.left = `${playerX}px`;
});

// Touch movement for mobile
gameContainer.addEventListener("touchstart", (e) => {
  if (!gameActive) return;
  e.preventDefault();
  isTouching = true;
  moveToTouch(e.touches[0]);
});
gameContainer.addEventListener("touchmove", (e) => {
  if (!gameActive) return;
  e.preventDefault();
  if (isTouching) moveToTouch(e.touches[0]);
});
gameContainer.addEventListener("touchend", (e) => {
  if (!gameActive) return;
  e.preventDefault();
  isTouching = false;
});

function moveToTouch(touch) {
  const rect = gameContainer.getBoundingClientRect();
  const relativeX = touch.clientX - rect.left;
  const clampedX = Math.max(0, Math.min(relativeX - 25, 400 - 50));
  playerX = clampedX;
  player.style.left = `${playerX}px`;
}

// Mouse drag movement
let isMouseDragging = false;

player.addEventListener("mousedown", (e) => {
  if (!gameActive) return;
  isMouseDragging = true;
});

document.addEventListener("mouseup", () => {
  isMouseDragging = false;
});

document.addEventListener("mousemove", (e) => {
  if (!gameActive || !isMouseDragging) return;
  const rect = gameContainer.getBoundingClientRect();
  const relativeX = e.clientX - rect.left;
  const clampedX = Math.max(0, Math.min(relativeX - 25, 400 - 50));
  playerX = clampedX;
  player.style.left = `${playerX}px`;
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
  setTimeout(() => popup.classList.add("hidden"), 3000);
}

// NEW GAME LOGIC - Book dropping and collision detection
function dropBook() {
  if (!gameActive || misses >= maxMisses) {
    return;
  }

  const book = document.createElement("div");
  book.classList.add("book");
  book.innerHTML = `<img src="images/bookofmormon.png" alt="Book of Mormon" class="book-sprite">`;

  // Random X position for the book
  const bookX = Math.floor(Math.random() * (400 - 40));
  book.style.left = bookX + "px";
  book.style.top = "-40px"; // Start above the container

  gameContainer.appendChild(book);

  // Animation variables
  let bookY = -40;
  const fallSpeed = getSpeed(score);
  const animationStep = 500 / (fallSpeed / 16); // 60fps animation

  // Animation loop
  function animateBook() {
    if (!gameActive || !book.parentNode) {
      return; // Stop if game ended or book removed
    }

    bookY += animationStep;
    book.style.top = bookY + "px";

    // Check if book reached the bottom
    if (bookY >= 450) { // Player is at bottom 10px, so check at 450
      checkCollision(book, bookX, bookY);
      return;
    }

    // Continue animation
    requestAnimationFrame(animateBook);
  }

  // Start animation
  requestAnimationFrame(animateBook);
}

// NEW COLLISION DETECTION
function checkCollision(book, bookX, bookY) {
  // Remove the book from DOM
  if (book.parentNode) {
    book.remove();
  }

  // Check if book overlaps with player
  const playerLeft = playerX;
  const playerRight = playerX + 50;
  const bookLeft = bookX;
  const bookRight = bookX + 40;

  // Check horizontal overlap
  const collision = bookRight > playerLeft && bookLeft < playerRight;

  if (collision) {
    // CATCH!
    score += 10;
    lightLevel = Math.min(4, lightLevel + 1); // Increase light level (brighter)
    updateScoreDisplay();
    updateBackground();
    showPopup(randomBlessing(), true);
    
    // Restart dropping with new speed (faster)
    startDroppingBooks();
  } else {
    // MISS!
    misses++;
    lightLevel = -3; // Immediately go to darkest level (black background)
    updateHearts();
    updateBackground();
    
    if (misses >= maxMisses) {
      gameOver();
    } else {
      showPopup(randomMissed(), false);
    }
  }
}

// Game over function
function gameOver() {
  gameActive = false;
  clearInterval(dropInterval);
  showPopup("💔 You've missed too many. Game over.");
  setTimeout(endGame, 2000);
}

// Start dropping books
function startDroppingBooks() {
  clearInterval(dropInterval);
  const interval = getSpeed(score);
  dropInterval = setInterval(() => {
    if (gameActive) {
      dropBook();
    }
  }, interval);
}

// Background changing
function updateBackground() {
  gameContainer.className = "";
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

  gameContainer.classList.add(classMap[lightLevel]);
}

// End game
function endGame() {
  gameScreen.classList.add("hidden");
  
  // Calculate insights based on performance
  const booksCaught = Math.floor(score / 10);
  const personalMessage = getPersonalMessage(booksCaught);
  
  // Update reflection screen with more meaningful content
  const reflectionScreen = document.getElementById("reflection-screen");
  reflectionScreen.innerHTML = `
    <div class="reflection-content">
      <h2>🌅 Your Journey</h2>
      
      <div class="final-stats">
        <p>📚 Books of Mormon Caught: <span class="highlight">${booksCaught}</span></p>
        <p>🌟 Your Score: <span class="highlight">${score.toString().padStart(6, '0')}</span></p>
      </div>
      
      <div class="personal-message">
        <h3>💝 A Message for You</h3>
        <p>${personalMessage}</p>
      </div>
      
      <div class="reflection-prompts">
        <h3>Deep Reflection</h3>
        <p><strong>Your Name:</strong></p>
        <input type="text" id="player-name" placeholder="Enter your name..." style="width: 100%; padding: 10px; margin-bottom: 15px; border: 2px solid #9c27b0; border-radius: 5px; font-family: 'Press Start 2P', monospace; font-size: 12px;">
        
        <p><strong>How has studying the Book of Mormon blessed your life?</strong></p>
        <textarea id="reflection-input" rows="4" cols="50" placeholder="Share your thoughts about the blessings you've experienced..."></textarea>
        
        <p><strong>What would your life be like without the Book of Mormon?</strong></p>
        <textarea id="reflection-input-2" rows="4" cols="50" placeholder="Reflect on how the Book of Mormon has guided and protected you..."></textarea>
        
        <p><strong>What specific principle or teaching has impacted you most?</strong></p>
        <textarea id="reflection-input-3" rows="3" cols="50" placeholder="Share a specific doctrine or verse that has changed you..."></textarea>
      </div>
      
      <div class="scripture-reminder">
        <h3>📖 Remember This Promise</h3>
        <p>"And when ye shall receive these things, I would exhort you that ye would ask God, the Eternal Father, in the name of Christ, if these things are not true; and if ye shall ask with a sincere heart, with real intent, having faith in Christ, he will manifest the truth of it unto you, by the power of the Holy Ghost."</p>
        <p class="scripture-reference">— Moroni 10:4</p>
      </div>
      
      <div class="action-buttons">
        <button onclick="submitReflection()" class="primary-btn">📤 Submit Reflection</button>
        <button onclick="viewAllReflections()" class="secondary-btn">📖 View All Reflections</button>
        <button onclick="window.location.reload()" class="primary-btn">🔄 Play Again</button>
      </div>
    </div>
  `;
  
  reflectionScreen.classList.remove("hidden");
}

// Get personalized message based on performance
function getPersonalMessage(booksCaught) {
  if (booksCaught >= 20) {
    return "You have shown remarkable dedication to spiritual growth! Your consistent study of the Book of Mormon has brought you great light and understanding. Continue to let these sacred words guide your daily decisions and relationships.";
  } else if (booksCaught >= 15) {
    return "Your faithful study of the Book of Mormon has strengthened your testimony and brought you closer to Christ. You are building a solid foundation of faith that will sustain you through life's challenges.";
  } else if (booksCaught >= 10) {
    return "You are developing a beautiful relationship with the Book of Mormon! Each time you study these sacred words, you invite the Spirit into your life and receive guidance for your daily walk with Christ.";
  } else if (booksCaught >= 5) {
    return "You are beginning to experience the power of the Book of Mormon in your life. As you continue to study and apply its teachings, you will discover greater peace, direction, and spiritual strength.";
  } else if (booksCaught >= 1) {
    return "You have taken the first step on a beautiful spiritual journey! The Book of Mormon has the power to transform your life as you study it regularly and apply its teachings with faith.";
  } else {
    return "Every journey begins with a single step. The Book of Mormon is waiting to bless your life with its powerful teachings and divine guidance. Start today, and watch how it transforms your perspective and brings you closer to Christ.";
  }
}

// Enhanced reflection submission using localStorage
function submitReflection() {
  const playerName = document.getElementById("player-name").value;
  const reflection1 = document.getElementById("reflection-input").value;
  const reflection2 = document.getElementById("reflection-input-2").value;
  const reflection3 = document.getElementById("reflection-input-3").value;
  
  if (playerName.trim() === "" || reflection1.trim() === "" || reflection2.trim() === "" || reflection3.trim() === "") {
    alert("Please complete your name and all reflection questions before submitting.");
    return;
  }
  
  // Save reflections to localStorage
  const reflections = {
    name: playerName,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    blessings: reflection1,
    lifeWithout: reflection2,
    principle: reflection3,
    score: score,
    booksCaught: Math.floor(score / 10)
  };

  // Get existing reflections from localStorage
  let existingReflections = JSON.parse(localStorage.getItem('reflections') || '[]');
  existingReflections.push(reflections);
  localStorage.setItem('reflections', JSON.stringify(existingReflections));

  // Show success message with personal insights
  const reflectionScreen = document.getElementById("reflection-screen");
  reflectionScreen.innerHTML = `
    <div class="success-message">
      <h2>🎉 Thank You, ${playerName}!</h2>
      <p>Your insights have been saved and will help you remember this important moment in your journey.</p>
      
      <div class="reflection-summary">
        <h3>📝 Your Reflection Summary</h3>
        <div class="summary-item">
          <strong>Blessings This Semester:</strong>
          <p>"${reflection1.substring(0, 100)}${reflection1.length > 100 ? '...' : ''}"</p>
        </div>
        <div class="summary-item">
          <strong>Life Without the Book of Mormon:</strong>
          <p>"${reflection2.substring(0, 100)}${reflection2.length > 100 ? '...' : ''}"</p>
        </div>
        <div class="summary-item">
          <strong>Most Impactful Principle:</strong>
          <p>"${reflection3.substring(0, 100)}${reflection3.length > 100 ? '...' : ''}"</p>
        </div>
      </div>
      
      <p><strong>Keep studying, keep growing, and keep letting the light of Christ shine through you!</strong></p>
      
      <div class="final-encouragement">
        <h3>🌟 Your Next Steps</h3>
        <ul>
          <li>Continue daily Book of Mormon study</li>
          <li>Apply the principles you've learned</li>
          <li>Share your testimony with others</li>
          <li>Trust in the Lord's promises</li>
          <li>Listening to the Living Prophets</li>
        </ul>
      </div>
      
      <div class="action-buttons">
        <button onclick="viewAllReflections()" class="secondary-btn">📖 View All Reflections</button>
        <button onclick="window.location.reload()" class="primary-btn">🔄 Play Again</button>
      </div>
    </div>
  `;
}

// View all reflections function using localStorage
function viewAllReflections() {
  const existingReflections = JSON.parse(localStorage.getItem('reflections') || '[]');
  
  if (existingReflections.length === 0) {
    alert("No reflections found. Complete a game and submit your reflection to see them here!");
    return;
  }

  let reflectionsHTML = `
    <div class="reflections-header">
      <h2>📚 Reflection Gallery</h2>
      <p class="reflection-summary">Total Reflections: <span class="reflection-count">${existingReflections.length}</span></p>
      <button onclick="clearAllReflections()" class="admin-clear-btn">🗑️ Clear All</button>
    </div>
    <div class="reflections-gallery">
  `;

  let count = existingReflections.length;
  existingReflections.reverse().forEach((reflection) => {
    reflectionsHTML += `
      <div class="reflection-card">
        <div class="reflection-card-header">
          <span class="reflection-number">#${count--}</span>
          <span class="reflection-date">${reflection.date} <span class="reflection-time">${reflection.time || ''}</span></span>
        </div>
        <div class="reflection-card-body">
          <div class="reflection-player"><span class="icon">👤</span> <strong>${reflection.name}</strong></div>
          <div class="reflection-score"><span class="icon">⭐</span> Score: <span class="highlight">${reflection.score}</span> (<span class="highlight">${reflection.booksCaught}</span> books caught)</div>
          <div class="reflection-section">
            <span class="icon">🙏</span> <strong>Blessings:</strong>
            <p class="reflection-text">${reflection.blessings}</p>
          </div>
          <div class="reflection-section">
            <span class="icon">🌑</span> <strong>Life Without the Book of Mormon:</strong>
            <p class="reflection-text">${reflection.lifeWithout}</p>
          </div>
          <div class="reflection-section">
            <span class="icon">💡</span> <strong>Most Impactful Principle:</strong>
            <p class="reflection-text">${reflection.principle}</p>
          </div>
        </div>
      </div>
    `;
  });

  reflectionsHTML += `
    </div>
    <div class="action-buttons">
      <button onclick="restoreReflectionScreen()" class="primary-btn">← Play Again</button>
    </div>
  `;

  document.getElementById("reflection-screen").innerHTML = reflectionsHTML;
}

// Clear all reflections function
function clearAllReflections() {
  if (confirm("Are you sure you want to clear all reflections? This cannot be undone.")) {
    localStorage.removeItem('reflections');
    alert("All reflections have been cleared.");
    viewAllReflections();
  }
}

// Restore reflection screen function
function restoreReflectionScreen() {
  window.location.reload();
}

// Scripture messages
const blessings = [
  " Alma 37:6 — Small and simple things bring great things.",
  " Mosiah 2:41 — Obedience brings joy.",
  " Alma 29:9 — I know that which the Lord hath commanded me.",
  " Alma 30:44 — All things denote there is a God.",
  " Alma 32:21 — Faith is not to have a perfect knowledge.",
  " Alma 32:28 — The word is good, for it beginneth to enlarge my soul.",
  " Alma 34:32 — This life is the time to prepare to meet God.",
  " Alma 37:35 — Learn wisdom in thy youth.",
  " Alma 37:37 — Counsel with the Lord in all thy doings.",
  " Alma 38:5 — I trust that I shall have great joy in you.",
  " Alma 39:9 — Do not cross yourself in these things.",
  " Alma 41:10 — Wickedness never was happiness.",
  " Alma 42:31 — Mercy claimeth the penitent.",
  " Alma 43:1 — The sons of Alma did go forth among the people.",
  " Alma 46:12 — In memory of our God, our religion, and freedom.",
  " Alma 48:17 — If all men had been like unto Moroni, the powers of hell would have been shaken forever.",
  " Alma 50:23 — There never was a happier time among the people of Nephi.",
  " Alma 56:47 — They had been taught by their mothers.",
  " Alma 57:21 — They did obey and observe to perform every word with exactness.",
  " Alma 58:11 — The Lord our God did visit us with assurances.",
  " Alma 60:23 — The Lord will not suffer that the words shall not be verified.",
  " Alma 61:21 — The Lord will bless us and deliver us.",
  " Helaman 3:29 — The word of God is quick and powerful.",
  " Helaman 3:35 — Sanctification cometh because of their yielding their hearts unto God.",
  " Helaman 5:12 — Build your foundation upon the rock of our Redeemer.",
  " Helaman 6:3 — The people of the church did have great joy.",
  " Helaman 7:28 — Blessed are they who will repent and turn unto me.",
  " Helaman 8:15 — Behold, I testify unto you that I do know.",
  " Helaman 10:5 — Thou art blessed, Nephi, because of thy unwearyingness.",
  " Helaman 12:1 — The Lord in his great infinite goodness doth bless and prosper.",
  " Helaman 13:38 — Your days of probation are past.",
  " Helaman 14:30 — Ye are permitted to act for yourselves.",
  " Helaman 15:7 — The good shepherd doth call after you.",
  " 3 Nephi 1:13 — On the morrow come I into the world.",
  " 3 Nephi 5:13 — Behold, I am a disciple of Jesus Christ.",
  " 3 Nephi 9:14 — If ye will come unto me I will show unto you your weakness.",
  " 3 Nephi 11:11 — I have drunk out of that bitter cup which the Father hath given me.",
  " 3 Nephi 11:29 — He that hath the spirit of contention is not of me.",
  " 3 Nephi 12:3 — Blessed are the poor in spirit who come unto me.",
  " 3 Nephi 13:33 — Seek ye first the kingdom of God.",
  " 3 Nephi 17:3 — Ponder upon the things which I have said.",
  " 3 Nephi 18:24 — Hold up your light that it may shine unto the world.",
  " 3 Nephi 19:25 — His countenance did smile upon them.",
  " 3 Nephi 27:21 — This is my gospel.",
  " 3 Nephi 27:27 — What manner of men ought ye to be? Even as I am.",
  " 4 Nephi 1:15 — There was no contention in the land.",
  " Mormon 1:15 — I was visited of the Lord, and tasted and knew of the goodness of Jesus.",
  " Mormon 2:19 — My heart did sorrow because of their wickedness.",
  " Mormon 3:12 — I did stand as an idle witness.",
  " Mormon 5:24 — I would speak somewhat unto the remnant.",
  " Mormon 9:27 — Doubt not, but be believing.",
  " Ether 2:12 — This is a choice land.",
  " Ether 3:14 — I am he who was prepared from the foundation of the world.",
  " Ether 12:4 — Whoso believeth in God might with surety hope.",
  " Ether 12:27 — If men come unto me I will show unto them their weakness.",
  " Ether 12:41 — Seek this Jesus of whom the prophets and apostles have written.",
  " Moroni 7:45 — Charity suffereth long, and is kind.",
  " Moroni 7:48 — Pray unto the Father with all the energy of heart.",
  " Moroni 8:16 — Perfect love casteth out all fear.",
  " Moroni 9:6 — Let us labor diligently.",
  " Moroni 10:4 — Ask God... he will manifest the truth of it unto you.",
  " Moroni 10:32 — Come unto Christ, and be perfected in him.",
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

document.addEventListener("DOMContentLoaded", () => {
  // Show "How to Play" popup first
  document.getElementById("how-to-play").style.display = "flex";
  detectInstructions();
});

document.getElementById("howto-continue").addEventListener("click", () => {
  document.getElementById("how-to-play").style.display = "none";
  document.getElementById("start-screen").style.display = "block";
});

// Speed function for book dropping - starts slow and gradually increases
function getSpeed(score) {
  // Start very slow (6000ms = 6 seconds) and gradually speed up
  if (score >= 2000) return 1200; // Very fast
  if (score >= 1500) return 1400;
  if (score >= 1200) return 1600;
  if (score >= 1000) return 1800;
  if (score >= 800) return 2000;
  if (score >= 600) return 2200;
  if (score >= 500) return 2400;
  if (score >= 400) return 2600;
  if (score >= 300) return 2800;
  if (score >= 200) return 3000;
  if (score >= 100) return 3500; // Slower than before
  return 6000; // Start very slow - 6 seconds between books
}

if (testMode) {
  document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement('style');
    style.innerHTML = `
      #player { 
        background: rgba(255,0,0,0.5) !important; 
        border: 3px solid red !important; 
        position: relative !important;
      }
      #player::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 120px;
        height: 120px;
        border: 2px dashed yellow;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
      }
      .book { 
        background: rgba(0,0,255,0.5) !important; 
        border: 3px solid blue !important; 
      }
      #game-container {
        border: 2px solid green !important;
      }
    `;
    document.head.appendChild(style);
  });
}
