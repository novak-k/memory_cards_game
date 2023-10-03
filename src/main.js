const cardsContainer = document.querySelector(".cards-container");
const remainingPairsElement = document.querySelector(".pairs");
const scoreElement = document.querySelector(".score");
const timerElement = document.getElementById("timer");
const startButton = document.getElementById("startButton");
const timerMessage = document.getElementById("timer-message");
const winnerMessage = document.getElementById("winner-message");

let cards = [];
let firstCard, secondCard;
let lockBoard = false;
let score = 0;
let timeInSeconds = 60;
let gameStarted = false;

scoreElement.textContent = score;

fetch("../data/cards.json")
  .then((res) => res.json())
  .then((data) => {
    cards = [...data, ...data];

    shuffleCards();
    generateCards();
  });

function shuffleCards() {
  let currentIndex = cards.length,
    randomIndex,
    temporaryValue;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = cards[currentIndex];
    cards[currentIndex] = cards[randomIndex];
    cards[randomIndex] = temporaryValue;
  }
}

function generateCards() {
  for (let card of cards) {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.setAttribute("data-name", card.name);
    cardElement.innerHTML = `
      <div class="front">
        <img class="front-image" src=${card.image} />
      </div>
      <div class="back"></div>
    `;
    cardsContainer.appendChild(cardElement);
    cardElement.addEventListener("click", flipCard);
  }

  remainingPairs = cards.length / 2;
  remainingPairsElement.textContent = remainingPairs;
}

function flipCard() {
  if (!gameStarted) return;
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add("flipped");

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  score++;
  document.querySelector(".score").textContent = score;
  lockBoard = true;

  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard.dataset.name === secondCard.dataset.name;

  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  firstCard.removeEventListener("click", flipCard);
  secondCard.removeEventListener("click", flipCard);

  remainingPairs--;
  remainingPairsElement.textContent = remainingPairs;

  if (remainingPairs === 0) {
    winnerMessage.textContent = "Congratulations! You've won.";
    timerElement.classList.add('won');
    stopTimer();
  }

  resetBoard();
}

function unflipCards() {
  setTimeout(() => {
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");
    resetBoard();
  }, 1000);
}

function resetBoard() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function restart() {
  resetBoard();
  shuffleCards();
  score = 0;
  document.querySelector(".score").textContent = score;
  cardsContainer.innerHTML = "";
  generateCards();
  restartTimer()
}

let timerInterval = null;

function updateTimer() {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;

  timerElement.querySelector('.minutes').textContent = minutes.toString().padStart(2, '0');
  timerElement.querySelector('.seconds').textContent = seconds.toString().padStart(2, '0');

  if (timeInSeconds === 0) {
    clearInterval(timerInterval);
    timerElement.classList.add('expired');
    timerMessage.textContent = "Time's up!";
    gameStarted = false;
  } else {
    timeInSeconds--;
  }
}

function startTimer() {
  gameStarted = true;
  if (timerInterval === null) {
    timerInterval = setInterval(updateTimer, 1000);
  }
}

function restartTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timeInSeconds = 60;
  timerElement.classList.remove('expired');
  timerElement.classList.remove('won');
  timerMessage.textContent = "";
  winnerMessage.textContent = "";
  updateTimer();
  gameStarted = false;
}

startButton.addEventListener("click", startTimer);

function stopTimer() {
  clearInterval(timerInterval);
}
