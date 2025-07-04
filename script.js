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
let lightLevel = 1;
let gameActive = false;

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
  lightLevel = 1; // Start at level 1 (dark blue background)
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

// Book dropping and collision detection
function dropBook() {
  if (!gameActive || misses >= maxMisses) {
    return;
  }

  const book = document.createElement("div");
  book.classList.add("book");
  book.innerHTML = `<img src="images/bookofmormon.png" alt="Book of Mormon" class="book-sprite">`;

  // Get actual container dimensions for responsive sizing
  const containerRect = gameContainer.getBoundingClientRect();
  const containerWidth = containerRect.width;
  const containerHeight = containerRect.height;
  
  // Fixed book dimensions (matches CSS)
  const bookWidth = 40;
  const bookHeight = 40;

  // Random X position for the book (responsive to container width)
  const maxBookX = containerWidth - bookWidth;
  const bookX = Math.floor(Math.random() * maxBookX);
  book.style.left = bookX + "px";
  book.style.top = "-40px"; // Start above the container

  gameContainer.appendChild(book);

  // Animation variables
  let bookY = -40;
  const fallSpeed = getSpeed(score);
  const animationStep = containerHeight / (fallSpeed / 16); // Responsive animation step

  // Animation loop
  function animateBook() {
    if (!gameActive || !book.parentNode) {
      return; // Stop if game ended or book removed
    }

    bookY += animationStep;
    book.style.top = bookY + "px";

    // Get current player position (responsive)
    const currentPlayerRect = player.getBoundingClientRect();
    const currentContainerRect = gameContainer.getBoundingClientRect();
    
    // Calculate positions relative to the game container
    const playerLeft = currentPlayerRect.left - currentContainerRect.left;
    const playerRight = playerLeft + currentPlayerRect.width;
    const playerTop = currentPlayerRect.top - currentContainerRect.top;
    const playerBottom = playerTop + currentPlayerRect.height;
    
    const bookLeft = bookX;
    const bookRight = bookX + bookWidth;
    const bookTop = bookY;
    const bookBottom = bookY + bookHeight;
    
    // Check horizontal overlap
    const horizontalOverlap = bookRight > playerLeft && bookLeft < playerRight;
    
    // Check vertical overlap (book is near player's level)
    const verticalOverlap = bookBottom >= playerTop && bookTop <= playerBottom;
    
    const collision = horizontalOverlap && verticalOverlap;

    if (collision) {
      // CATCH! - Book disappears immediately
      book.remove();
      score += 10; // Changed from 100 to 10 points
      lightLevel = Math.min(4, lightLevel + 1); // Increase light level (brighter)
      updateScoreDisplay();
      updateBackground();
      showPopup(randomBlessing(), true);
      
      // Restart dropping with new speed (faster)
      startDroppingBooks();
      return;
    }

    // Check if book reached the bottom without being caught
    if (bookY >= containerHeight) {
      book.remove();
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
      return;
    }

    // Continue animation
    requestAnimationFrame(animateBook);
  }

  // Start animation
  requestAnimationFrame(animateBook);
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

// Enhanced reflection submission using email
function submitReflection() {
  const playerName = document.getElementById("player-name").value;
  const reflection1 = document.getElementById("reflection-input").value;
  const reflection2 = document.getElementById("reflection-input-2").value;
  const reflection3 = document.getElementById("reflection-input-3").value;
  
  if (playerName.trim() === "" || reflection1.trim() === "" || reflection2.trim() === "" || reflection3.trim() === "") {
    alert("Please complete your name and all reflection questions before submitting.");
    return;
  }
  
  // Prepare email content
  const emailSubject = `Book of Mormon Game Reflection - ${playerName}`;
  const emailBody = `
New reflection submitted from the Book of Mormon Game!

Player Name: ${playerName}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}
Score: ${score}
Books Caught: ${Math.floor(score / 10)}

How has studying the Book of Mormon blessed your life?
${reflection1}

What would your life be like without the Book of Mormon?
${reflection2}

What specific principle or teaching has impacted you most?
${reflection3}

---
Sent from the Book of Mormon Game
  `.trim();

  // Send email using mailto link (opens user's email client)
  const mailtoLink = `mailto:dandyalditya@go.byuh.edu?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
  
  // Open email client
  window.open(mailtoLink);
  
  // Show simple thank you message
  showPopup(`🎉 Thank you, ${playerName}! Your email client should open automatically. Please send the email to share your reflection.`, false);
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

// Speed function for book dropping - smooth gradual acceleration
function getSpeed(score) {
  // Start very slow (6000ms = 6 seconds) and smoothly accelerate
  // Use a mathematical curve for smooth transitions
  
  // Base speed: 6000ms (6 seconds)
  const baseSpeed = 6000;
  
  // Minimum speed: 800ms (0.8 seconds) - very fast
  const minSpeed = 800;
  
  // Calculate books caught (each book = 10 points)
  const booksCaught = score / 10;
  
  // Use exponential decay for smooth acceleration
  // The more books caught, the faster the speed
  // Formula: speed = minSpeed + (baseSpeed - minSpeed) * e^(-booksCaught / 8)
  // This creates a smooth curve that starts slow and gradually speeds up
  
  const speed = minSpeed + (baseSpeed - minSpeed) * Math.exp(-booksCaught / 8);
  
  // Ensure speed stays within bounds
  return Math.max(minSpeed, Math.min(baseSpeed, speed));
}
