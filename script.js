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
  gameContainer.classList.remove("bg-level-1", "bg-level-2", "bg-level-3", "bg-level-4");
  gameContainer.classList.add("bg-level-1");

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
  updateDifficultyIndicator();
}

// Difficulty indicator
function updateDifficultyIndicator() {
  // Update the game title to show difficulty
  const gameTitle = document.getElementById("game-title");
  gameTitle.textContent = `🛤️ Life with or without the Book of Mormon`;
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
  setTimeout(() => popup.classList.add("hidden"), 4000);
}

// Book drop logic
function dropBook() {
  const book = document.createElement("div");
  book.classList.add("book");
  let fallSpeed = getSpeed(score);
  book.style.animation = `fall ${fallSpeed}ms linear`;
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

  let currentInterval = getSpeed(score);
  dropInterval = setInterval(() => {
    if (!gameScreen.classList.contains("hidden")) dropBook();
  }, currentInterval);
}

//Background changing
function updateBackground() {
  gameContainer.className = "";

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

  gameContainer.classList.add(classMap[lightLevel]);
}

// End game
function endGame() {
  gameScreen.classList.add("hidden");
  document.getElementById("final-score").textContent = score.toString().padStart(6, '0');
  
  // Calculate insights based on performance
  const booksCaught = Math.floor(score / 100);
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
        <h3>🤔 Deep Reflection</h3>
        <p><strong>How has studying the Book of Mormon blessed your life this semester?</strong></p>
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
        <button onclick="clearAllReflections()" class="secondary-btn">🗑️ Clear All Reflections</button>
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

// Enhanced reflection submission
function submitReflection() {
  const reflection1 = document.getElementById("reflection-input").value;
  const reflection2 = document.getElementById("reflection-input-2").value;
  const reflection3 = document.getElementById("reflection-input-3").value;
  
  if (reflection1.trim() === "" || reflection2.trim() === "" || reflection3.trim() === "") {
    alert("Please complete all reflection questions before submitting.");
    return;
  }
  
  // Save reflections to local storage
  const reflections = {
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    blessings: reflection1,
    lifeWithout: reflection2,
    principle: reflection3,
    score: score,
    booksCaught: Math.floor(score / 100)
  };
  
  // Get existing reflections or create new array
  let allReflections = JSON.parse(localStorage.getItem("bookOfMormonReflections") || "[]");
  allReflections.push(reflections);
  localStorage.setItem("bookOfMormonReflections", JSON.stringify(allReflections));
  
  // Show success message with personal insights (no email submission box)
  const reflectionScreen = document.getElementById("reflection-screen");
  reflectionScreen.innerHTML = `
    <div class="success-message">
      <h2>🎉 Thank You for Your Reflection!</h2>
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
          <li>Review your reflections regularly</li>
        </ul>
      </div>
      
      <div class="action-buttons">
        <button onclick="submitReflectionToEmail()" class="primary-btn">📤 Submit Reflection</button>
        <button onclick="viewAllReflections()" class="secondary-btn">📖 View All Reflections</button>
        <button onclick="clearAllReflections()" class="secondary-btn">🗑️ Clear All Reflections</button>
        <button onclick="window.location.reload()" class="primary-btn">🔄 Play Again</button>
      </div>
    </div>
  `;
}

// Submit reflection to email
function submitReflectionToEmail() {
  const reflections = JSON.parse(localStorage.getItem("bookOfMormonReflections") || "[]");
  const latestReflection = reflections[reflections.length - 1];
  
  if (!latestReflection) {
    alert("No reflection found. Please complete the reflection questions first.");
    return;
  }
  
  // Create email content for notification
  const subject = "New Game Reflection Submitted - Catch the Book of Mormon";
  const body = `
Hello,

Someone has completed the "Catch the Book of Mormon" game and submitted their reflection.

Game Details:
- Date: ${latestReflection.date}
- Time: ${latestReflection.time}
- Game Score: ${latestReflection.score} (${latestReflection.booksCaught} books caught)

Player's Reflection:

1. How has studying the Book of Mormon blessed your life this semester?
${latestReflection.blessings}

2. What would your life be like without the Book of Mormon?
${latestReflection.lifeWithout}

3. What specific principle or teaching has impacted you most?
${latestReflection.principle}

This reflection was submitted through the interactive "Catch the Book of Mormon" game.

Best regards,
Your Game Notification System
  `;
  
  // Open email client with pre-filled content (sending to your email for notification)
  const mailtoLink = `mailto:dandyalditya@go.byuh.edu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoLink);
  
  // Show confirmation
  alert("Email notification opened! This will send you a notification about the submitted reflection. If your email client didn't open, you can copy the content and send it manually.");
}

// View all reflections function
function viewAllReflections() {
  const reflections = JSON.parse(localStorage.getItem("bookOfMormonReflections") || "[]");
  
  if (reflections.length === 0) {
    alert("No reflections found. Complete a game and submit your reflection to see them here!");
    return;
  }
  
  let reflectionsHTML = `
    <div class="reflections-history">
      <h2>📚 Your Reflection History</h2>
      <p>Here are all your reflections from playing this game:</p>
  `;
  
  reflections.reverse().forEach((reflection, index) => {
    reflectionsHTML += `
      <div class="reflection-entry">
        <h3>Reflection #${reflections.length - index} - ${reflection.date}</h3>
        <p><strong>Score:</strong> ${reflection.score} (${reflection.booksCaught} books caught)</p>
        <p><strong>Blessings:</strong> ${reflection.blessings}</p>
        <p><strong>Life Without BOM:</strong> ${reflection.lifeWithout}</p>
        <p><strong>Key Principle:</strong> ${reflection.principle}</p>
      </div>
    `;
  });
  
  reflectionsHTML += `
      <div class="action-buttons">
        <button onclick="restoreReflectionScreen()" class="primary-btn">← Back to Reflection</button>
        <button onclick="clearAllReflections()" class="secondary-btn">🗑️ Clear All Reflections</button>
      </div>
    </div>
  `;
  
  document.getElementById("reflection-screen").innerHTML = reflectionsHTML;
}

// Clear all reflections function
function clearAllReflections() {
  console.log("Clear all reflections function called");
  
  try {
    const reflections = JSON.parse(localStorage.getItem("bookOfMormonReflections") || "[]");
    console.log("Found reflections:", reflections.length);
    
    if (reflections.length === 0) {
      const forceClear = confirm("No reflections found in storage. Do you want to clear the storage anyway?");
      if (forceClear) {
        localStorage.removeItem("bookOfMormonReflections");
        console.log("Storage cleared even though no reflections were found");
        alert("Storage cleared successfully!");
      }
      return;
    }
    
    const confirmDelete = confirm(`Are you sure you want to delete all ${reflections.length} reflections? This action cannot be undone.`);
    
    if (confirmDelete) {
      localStorage.removeItem("bookOfMormonReflections");
      console.log("Reflections cleared from localStorage");
      alert("All reflections have been cleared successfully!");
      
      // If we're on the reflections history page, go back to the main reflection screen
      const reflectionScreen = document.getElementById("reflection-screen");
      if (reflectionScreen && reflectionScreen.innerHTML.includes("reflections-history")) {
        console.log("Returning to main reflection screen");
        restoreReflectionScreen();
      } else {
        console.log("Not on reflections history page, staying on current screen");
      }
    } else {
      console.log("User cancelled deletion");
    }
  } catch (error) {
    console.error("Error in clearAllReflections:", error);
    alert("An error occurred while clearing reflections. Please try again.");
  }
}

// Test function to check reflections (you can call this in browser console)
function checkReflections() {
  const reflections = JSON.parse(localStorage.getItem("bookOfMormonReflections") || "[]");
  console.log("Current reflections:", reflections);
  console.log("Number of reflections:", reflections.length);
  return reflections;
}

// Restore reflection screen function
function restoreReflectionScreen() {
  const originalContent = document.getElementById("reflection-screen").getAttribute("data-original-content");
  if (originalContent) {
    document.getElementById("reflection-screen").innerHTML = originalContent;
  } else {
    // If no original content, reload the page
    window.location.reload();
  }
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
  " Alma 48:17 — If all men had been, and were, and ever would be like unto Moroni.",
  " Alma 50:23 — The people of Nephi did multiply and spread.",
  " Alma 56:47 — They had been taught by their mothers.",
  " Alma 57:21 — They were firm and undaunted.",
  " Alma 58:11 — We trust God will deliver us.",
  " Alma 60:23 — The Lord will not suffer that the words shall not be verified.",
  " Alma 61:21 — The Lord will bless us and deliver us.",
  " Helaman 3:35 — Sanctification cometh because of their yielding their hearts unto God.",
  " Helaman 5:12 — Remember, remember that it is upon the rock of our Redeemer.",
  " Helaman 6:3 — The people of the church did have great joy.",
  " Helaman 7:28 — Blessed are they who will repent and turn unto me.",
  " Helaman 8:15 — Behold, I testify unto you that I do know.",
  " Helaman 10:5 — Thou art blessed, Alma.",
  " Helaman 12:1 — The Lord in his great infinite goodness doth bless and prosper.",
  " Helaman 13:38 — But behold, your days of probation are past.",
  " Helaman 14:30 — And now remember, remember, my brethren.",
  " Helaman 15:7 — Behold, I say unto you that the good shepherd doth call after you.",
  " Helaman 16:25 — And thus ended the eighty and sixth year.",
  " 3 Nephi 1:13 — On the morrow come I into the world.",
  " 3 Nephi 5:13 — Behold, I am a disciple of Jesus Christ.",
  " 3 Nephi 9:14 — Yea, verily I say unto you, if ye will come unto me.",
  " 3 Nephi 11:7 — Behold my Beloved Son, in whom I am well pleased.",
  " 3 Nephi 12:3 — Blessed are the poor in spirit who come unto me.",
  " 3 Nephi 13:33 — But seek ye first the kingdom of God.",
  " 3 Nephi 14:7 — Ask, and it shall be given unto you.",
  " 3 Nephi 15:9 — Behold, I am the law, and the light.",
  " 3 Nephi 16:20 — And I will remember the covenant which I have made.",
  " 3 Nephi 17:3 — Therefore, go ye unto your homes, and ponder upon the things.",
  " 3 Nephi 18:11 — And this shall ye always do to those who repent.",
  " 3 Nephi 19:9 — And they did pray for that which they most desired.",
  " 3 Nephi 20:35 — And then shall the work of the Father commence.",
  " 3 Nephi 21:9 — For in that day, for my sake shall the Father work a work.",
  " 3 Nephi 22:7 — For a small moment have I forsaken thee.",
  " 3 Nephi 23:1 — And now, behold, I say unto you, that ye ought to search these things.",
  " 3 Nephi 24:10 — Bring ye all the tithes into the storehouse.",
  " 3 Nephi 25:6 — And he shall turn the heart of the fathers to the children.",
  " 3 Nephi 26:9 — And when they shall have received this.",
  " 3 Nephi 27:21 — Verily, verily, I say unto you, this is my gospel.",
  " 3 Nephi 28:9 — And ye shall never endure the pains of death.",
  " 3 Nephi 29:6 — Turn, all ye Gentiles, from your wicked ways.",
  " 3 Nephi 30:2 — Turn, all ye Gentiles, from your wicked ways.",
  " 4 Nephi 1:15 — And it came to pass that there was no contention.",
  " 4 Nephi 1:16 — And there were no envyings, nor strifes.",
  " Mormon 1:15 — And I, being fifteen years of age.",
  " Mormon 2:19 — And wo is me because of their wickedness.",
  " Mormon 3:12 — Behold, I had led them, notwithstanding their wickedness.",
  " Mormon 4:5 — And it came to pass that the Lamanites did come against us.",
  " Mormon 5:24 — And now behold, I would speak somewhat unto the remnant.",
  " Mormon 6:17 — O ye fair ones, how could ye have departed from the ways of the Lord.",
  " Mormon 7:10 — And ye will also know that ye are a remnant of the seed of Jacob.",
  " Mormon 8:35 — Behold, I speak unto you as if ye were present.",
  " Mormon 9:31 — Condemn me not because of mine imperfection.",
  " Ether 1:33 — Which Jared came forth with his brother and their families.",
  " Ether 2:12 — Behold, this is a choice land.",
  " Ether 3:5 — Behold, O Lord, thou canst do this.",
  " Ether 4:19 — And blessed is he that is found faithful.",
  " Ether 5:4 — And in the mouth of three witnesses shall these things be established.",
  " Ether 6:12 — And they did land upon the shore of the promised land.",
  " Ether 7:27 — And the people began to be very numerous.",
  " Ether 8:19 — And now I, Moroni, do not write the manner of their oaths.",
  " Ether 9:22 — And they did have silks, and fine-twined linen.",
  " Ether 10:28 — And there was no poor among them.",
  " Ether 11:23 — And the Lord said unto the brother of Jared.",
  " Ether 12:4 — Wherefore, whoso believeth in God might with surety hope.",
  " Ether 12:6 — And now, I, Moroni, would speak somewhat concerning these things.",
  " Ether 12:27 — And if men come unto me I will show unto them their weakness.",
  " Ether 12:41 — And what is it that ye shall hope for?",
  " Ether 13:4 — Behold, Ether saw the days of Christ.",
  " Ether 14:25 — And it came to pass that they fought for the space of many days.",
  " Ether 15:34 — And it came to pass that the army of Coriantumr did pitch their tents.",
  " Moroni 1:4 — Therefore I will write and hide up the records in the earth.",
  " Moroni 2:2 — And Jesus called his little children.",
  " Moroni 3:4 — And after this manner did they ordain priests and teachers.",
  " Moroni 4:3 — O God, the Eternal Father, we ask thee in the name of thy Son.",
  " Moroni 5:2 — The manner of administering the wine.",
  " Moroni 6:9 — And their meetings were conducted by the church.",
  " Moroni 7:3 — And I, Moroni, write a few of the words of my father.",
  " Moroni 7:12 — Wherefore, all things which are good cometh of God.",
  " Moroni 7:16 — For behold, the Spirit of Christ is given to every man.",
  " Moroni 7:33 — And Christ hath said: If ye will have faith in me.",
  " Moroni 7:45 — And charity suffereth long, and is kind.",
  " Moroni 7:48 — Wherefore, my beloved brethren, pray unto the Father.",
  " Moroni 8:8 — Listen to the words of Christ, your Redeemer.",
  " Moroni 8:17 — I am filled with charity, which is everlasting love.",
  " Moroni 8:26 — And the remission of sins bringeth meekness.",
  " Moroni 9:6 — And now, my beloved son, notwithstanding their hardness.",
  " Moroni 9:25 — My son, be faithful in Christ.",
  " Moroni 10:4 — And when ye shall receive these things, I would exhort you.",
  " Moroni 10:5 — And by the power of the Holy Ghost ye may know the truth.",
  " Moroni 10:32 — Yea, come unto Christ, and be perfected in him.",
  " Moroni 10:33 — And then shall ye know that I have seen Jesus.",
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
});

// Unified speed function for both fall and drop speeds
function getSpeed(score) {
  // Adjusted for 100 points per book - much more gradual progression
  if (score >= 2000) return 1200;
  if (score >= 1500) return 1400;
  if (score >= 1200) return 1600;
  if (score >= 1000) return 1800;
  if (score >= 800) return 2000;
  if (score >= 600) return 2200;
  if (score >= 500) return 2400;
  if (score >= 400) return 2600;
  if (score >= 300) return 2800;
  if (score >= 200) return 3000;
  if (score >= 100) return 3200;
  return 4000; // Start very slow - 4 seconds
}
