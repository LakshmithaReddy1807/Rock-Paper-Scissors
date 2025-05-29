// Game state
let playerName = '';
let playerScore = 0;
let winStreak = 0;
const choices = ['rock', 'paper', 'scissors'];

// Speech Recognition setup
let recognition = null;
if ('webkitSpeechRecognition' in window) {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
}

// Sound effects
const sounds = {
  win: new Audio('https://assets.mixkit.co/active_storage/sfx/2018/win-musical-alert.wav'),
  lose: new Audio('https://assets.mixkit.co/active_storage/sfx/2019/lose-musical-alert.wav'),
  tie: new Audio('https://assets.mixkit.co/active_storage/sfx/2020/tie-musical-alert.wav')
};

// AI Commentary phrases
const commentaryPhrases = {
  win: [
    "Impressive move! You're on fire! 🔥",
    "The student becomes the master! 🎓",
    "You're making this look easy! 👏",
    "Three wins in a row? Are you a Rock-Paper-Scissors master? 🏆"
  ],
  lose: [
    "Oof! Tough loss — the AI saw that coming! 🤖",
    "Nice try, but the computer's got your number! 📱",
    "Don't worry, even champions have off days! 🌟",
    "The AI is learning your patterns... 🧠"
  ],
  tie: [
    "Great minds think alike! 🤝",
    "A perfect match! What are the odds? 🎲",
    "Neither winner nor loser - perfectly balanced! ⚖️",
    "You're reading each other's minds! 🔮"
  ]
};

// DOM Elements
const playerRegistration = document.getElementById('player-registration');
const gameSection = document.getElementById('game-section');
const playerNameInput = document.getElementById('player-name');
const startGameButton = document.getElementById('start-game');
const currentPlayerDisplay = document.getElementById('current-player');
const playerScoreDisplay = document.getElementById('player-score');
const resultSection = document.getElementById('result');
const playerChoiceDisplay = document.getElementById('player-choice-display');
const computerChoiceDisplay = document.getElementById('computer-choice-display');
const resultText = document.getElementById('result-text');
const newPlayerButton = document.getElementById('new-player');
const toggleLeaderboardButton = document.getElementById('toggle-leaderboard');
const toggleVoiceButton = document.getElementById('toggle-voice');
const leaderboardContainer = document.getElementById('leaderboard-container');
const aiCommentary = document.getElementById('ai-commentary');
const commentaryText = document.getElementById('commentary-text');

// Choice emojis mapping
const choiceEmojis = {
  rock: '✊',
  paper: '✋',
  scissors: '✌️'
};

// Game rules
const gameRules = {
  rock: 'scissors',
  paper: 'rock',
  scissors: 'paper'
};

// Initialize game
function initGame() {
  loadLeaderboard();
  setupEventListeners();
  setupVoiceRecognition();
}

// Event listeners setup
function setupEventListeners() {
  startGameButton.addEventListener('click', startGame);
  newPlayerButton.addEventListener('click', switchPlayer);
  toggleLeaderboardButton.addEventListener('click', toggleLeaderboard);
  toggleVoiceButton.addEventListener('click', toggleVoiceControl);
  document.querySelectorAll('.choice').forEach(button => {
    button.addEventListener('click', () => playRound(button.dataset.choice));
  });

  playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      startGame();
    }
  });
}

// Voice recognition setup
function setupVoiceRecognition() {
  if (!recognition) return;

  recognition.onresult = (event) => {
    const command = event.results[0][0].transcript.toLowerCase();
    if (command.includes('rock')) {
      playRound('rock');
    } else if (command.includes('paper')) {
      playRound('paper');
    } else if (command.includes('scissors')) {
      playRound('scissors');
    }
  };

  recognition.onend = () => {
    toggleVoiceButton.classList.remove('active');
  };
}

// Toggle voice control
function toggleVoiceControl() {
  if (!recognition) {
    alert('Voice recognition is not supported in your browser.');
    return;
  }

  if (toggleVoiceButton.classList.contains('active')) {
    recognition.stop();
  } else {
    recognition.start();
    toggleVoiceButton.classList.add('active');
  }
}

// Toggle leaderboard visibility
function toggleLeaderboard() {
  leaderboardContainer.classList.toggle('hidden');
  toggleLeaderboardButton.classList.toggle('active');
}

// Switch to new player
function switchPlayer() {
  playerRegistration.classList.remove('hidden');
  gameSection.classList.add('hidden');
  resultSection.classList.add('hidden');
  playerNameInput.value = '';
  playerNameInput.focus();
  winStreak = 0;
}

// Start game
function startGame() {
  const name = playerNameInput.value.trim();
  if (!name) {
    alert('Please enter your name to start the game!');
    return;
  }

  playerName = name;
  playerScore = 0;
  winStreak = 0;
  currentPlayerDisplay.textContent = playerName;
  playerScoreDisplay.textContent = playerScore;
  
  playerRegistration.classList.add('hidden');
  gameSection.classList.remove('hidden');
  resultSection.classList.add('hidden');
}

// Play a round
function playRound(playerChoice) {
  const computerChoice = getComputerChoice();
  const result = determineWinner(playerChoice, computerChoice);
  
  displayResult(playerChoice, computerChoice, result);
  updateScore(result);
  updateLeaderboard();
  playSound(result);
  showCommentary(result);
  if (result === 'win') {
    createConfetti();
  }
}

// Get computer's choice
function getComputerChoice() {
  return choices[Math.floor(Math.random() * choices.length)];
}

// Determine the winner
function determineWinner(playerChoice, computerChoice) {
  if (playerChoice === computerChoice) return 'tie';
  return gameRules[playerChoice] === computerChoice ? 'win' : 'lose';
}

// Display round result
function displayResult(playerChoice, computerChoice, result) {
  playerChoiceDisplay.textContent = choiceEmojis[playerChoice];
  computerChoiceDisplay.textContent = choiceEmojis[computerChoice];
  
  let resultMessage = '';
  switch (result) {
    case 'win':
      resultMessage = 'You Win! 🎉';
      break;
    case 'lose':
      resultMessage = 'You Lose! 😢';
      break;
    case 'tie':
      resultMessage = "It's a Tie! 🤝";
      break;
  }
  
  resultText.textContent = resultMessage;
  resultSection.classList.remove('hidden');
}

// Update score
function updateScore(result) {
  if (result === 'win') {
    playerScore++;
    winStreak++;
    playerScoreDisplay.textContent = playerScore;
  } else if (result === 'lose') {
    winStreak = 0;
  }
}

// Play sound effect
function playSound(result) {
  sounds[result].currentTime = 0;
  sounds[result].play().catch(err => console.log('Audio play failed:', err));
}

// Show AI commentary
function showCommentary(result) {
  const phrases = commentaryPhrases[result];
  const phrase = phrases[Math.floor(Math.random() * phrases.length)];
  
  commentaryText.textContent = phrase;
  aiCommentary.classList.remove('hidden');
  
  setTimeout(() => {
    aiCommentary.classList.add('hidden');
  }, 3000);
}

// Create confetti effect
function createConfetti() {
  const confettiCount = 50;
  const container = document.getElementById('confetti-container');
  container.innerHTML = '';

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.animationDuration = (Math.random() * 2 + 1) + 's';
    confetti.style.animationDelay = (Math.random() * 2) + 's';
    confetti.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
    container.appendChild(confetti);
  }

  setTimeout(() => {
    container.innerHTML = '';
  }, 5000);
}

// Leaderboard functions
function loadLeaderboard() {
  const leaderboard = JSON.parse(localStorage.getItem('rpsLeaderboard')) || [];
  displayLeaderboard(leaderboard);
}

function updateLeaderboard() {
  let leaderboard = JSON.parse(localStorage.getItem('rpsLeaderboard')) || [];
  
  const playerIndex = leaderboard.findIndex(entry => entry.name === playerName);
  if (playerIndex !== -1) {
    if (leaderboard[playerIndex].score < playerScore) {
      leaderboard[playerIndex].score = playerScore;
    }
  } else {
    leaderboard.push({ name: playerName, score: playerScore });
  }
  
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 5);
  
  localStorage.setItem('rpsLeaderboard', JSON.stringify(leaderboard));
  displayLeaderboard(leaderboard);
}

function displayLeaderboard(leaderboard) {
  const leaderboardList = document.getElementById('leaderboard-list');
  leaderboardList.innerHTML = '';
  
  leaderboard.forEach((entry, index) => {
    const entryElement = document.createElement('div');
    entryElement.className = 'leaderboard-entry fade-in';
    entryElement.innerHTML = `
      <span>${index + 1}. ${entry.name}</span>
      <span>${entry.score} points</span>
    `;
    leaderboardList.appendChild(entryElement);
  });
}

// Initialize the game
initGame();