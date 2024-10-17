let targetWord = "";
let guessWord = "";
const gGrid = document.querySelector("[data-guess-grid]");
const aContainer = document.querySelector("[data-alert-container]");
const keyboard = document.querySelector("[data-keyboard]");
const FLIP_ANIMATION_DURATION = 500;

//get random word to be guessed
async function getWord() {
  const url = "https://random-word-api.herokuapp.com/word?length=5";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    targetWord = json;
    //check that generated word is in dictionary
    checkWord(targetWord);
  } catch (error) {
    console.error(error.message);
  }
}

//checks dictionary for generated word if not in dictionary requires a new word to be generated
async function checkWord(word) {
  const url = "https://api.dictionaryapi.dev/api/v2/entries/en/" + word;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      getWord();
    }
    const json = await response.json();
    startInteraction();
    targetWord = word;
  } catch (error) {
    getWord();
  }
}

//checks player guess is valid word
async function checkGuess() {
  const activeTiles = [...aTiles()];

  const guess = activeTiles.reduce((word, tile) =>{
    return word + tile.dataset.letter;
  }, "")

  const url = "https://api.dictionaryapi.dev/api/v2/entries/en/" + guess;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      showAlert("Not a valid word");
      return
    }

    stopInteraction();
    activeTiles.forEach((...params) => flipTile(...params, guess));
  } catch (error) {}
}

//adds event listeners to page for user to interact
function startInteraction() {
  document.addEventListener("click", handleClick);
  document.addEventListener("keydown", handleKey);
}

//stops game being played once game over state reached
function stopInteraction() {
  document.removeEventListener("click", handleClick);
  document.removeEventListener("keydown", handleKey);
}

//performs function depending on what player has clicked
function handleClick(e) {
  if (e.target.matches("[data-key]")) {
    pressKey(e.target.dataset.key);
    return;
  }
  //checks that right number of letters have been entered
  if (e.target.matches("[data-enter]")) {
    const activeTiles = aTiles();
    if (activeTiles.length == 5) {
      checkGuess();
      return;
    }
    showAlert("Invalid guess");
    shakeTiles(activeTiles);
  }

  if (e.target.matches("[data-delete]")) {
    deleteKey();
    return;
  }
}

//performs function depending on what player has pressed on keyboard
function handleKey(e) {
  if (e.key === "Enter") {
    const activeTiles = aTiles();
    if (activeTiles.length == 5) {
      checkGuess();
      return;
    }
    showAlert("Invalid guess");
    shakeTiles(activeTiles);
  }

  if (e.key === "Backspace" || e.key === "Delete") {
    deleteKey();
    return;
  }

  if (e.key.match(/^[a-z]$/)) {
    pressKey(e.key);
    return;
  }
}

//adds letter to guess when clicked or pressed
function pressKey(key) {
  const activeTiles = aTiles();
  //checks that we are not adding more letters than allowed
  if (activeTiles.length >= 5) return;
  const nextTile = gGrid.querySelector(":not([data-letter])");
  nextTile.dataset.letter = key.toUpperCase();
  nextTile.textContent = key;
  nextTile.dataset.state = "active";
}

function deleteKey() {
  const activeTiles = aTiles();
  const lTile = activeTiles[activeTiles.length - 1];
  if (lTile == null) return;
  lTile.textContent = "";
  delete lTile.dataset.state;
  delete lTile.dataset.letter;
}

//returns all active tiles
function aTiles() {
  return gGrid.querySelectorAll('[data-state="active"]');
}

//shows alert on screen at top of element then once faded out removed from page
function showAlert(message, duration = 1000) {
  const alert = document.createElement("div");
  alert.textContent = message;
  alert.classList.add("alert");
  aContainer.prepend(alert);
  if (duration == null) return;
  setTimeout(() => {
    alert.classList.add("hide");
    alert.addEventListener("transitionend", () => {
      alert.remove();
    });
  }, duration);
}

//adds class for tiles to shake then removes once shake completed
function shakeTiles(tiles) {
  tiles.forEach(tile => {
    tile.classList.add("shake");
    tile.addEventListener(
      "animationend",
      () => {
        tile.classList.remove("shake");
      },
      { once: true }
    );
  });
}

function flipTile(tile, index, array, guess) {
  const letter = tile.dataset.letter;
  const key = keyboard.querySelector(`[data-key="${letter}"]`);
  setTimeout(() => {

  }, index * FLIP_ANIMATION_DURATION/2 )
}

getWord();
