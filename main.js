var targetWord;
var cState = ["0","0","0","0","0"];
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
    console.log(word);
    startInteraction();
    targetWord = word;
  } catch (error) {
    getWord();
  }
}

//checks player guess is valid word
async function checkGuess() {
  const activeTiles = [...aTiles()];
  cState = ["0","0","0","0","0"];
  const guess = activeTiles.reduce((word, tile) =>{
    return word + tile.dataset.letter;
  }, "")

  const url = "https://api.dictionaryapi.dev/api/v2/entries/en/" + guess;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      showAlert("Not a valid word", 500);
      return;
    }
    
    stopInteraction();
    compareGuess(guess);
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
    showAlert("Invalid guess", 500);
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
    showAlert("Invalid guess", 500);
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
function showAlert(message, duration) {
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
  const key = keyboard.querySelector(`[data-key="${letter}"i]`);
  setTimeout(() => {
    tile.classList.add("flip");
  }, index * FLIP_ANIMATION_DURATION/2 )
  tile.addEventListener("transitionend", () => {
    tile.classList.remove("flip");
    if (cState[index] === "0") {
      tile.dataset.state = "wrong";
      key.classList.add("wrong");
    } 
    else if (cState[index] === "1") {
      tile.dataset.state = "correct";
      key.classList.add("correct");
    }
    else if (cState[index] === "2") {
      tile.dataset.state = "wposition";
      key.classList.add("present");
    }

    if (index === array.length - 1) {
      tile.addEventListener("transitionend", () => {
        startInteraction();
        checkWinLose(array);
      }, {once : true})
    }
      
  }, {once : true})
}

function checkWinLose(tiles) {
  const remainingTiles = gGrid.querySelectorAll(":not([data-letter])");
  if (cState.includes("0") || cState.includes("0")) {
    if (remainingTiles.length === 0) {
      showAlert(targetWord[0].toUpperCase(), null);
      stopInteraction();
    }
  } else {
    showAlert("You win", 5000);
    stopInteraction();
    danceTiles(tiles);
  }
}

//checks guess against target word and changes target word to prevent dupe letters showing as correct/in word
function compareGuess(guess) {
  //split guess and target word into array
  let Gguess = guess.split("");
  var tWord = targetWord[0].split("");

  //compare arrays to see if letters in same position
  for(let i = 0; i<tWord.length; i++) {
    if (Gguess[i] === tWord[i].toUpperCase()) {
      tWord[i] ="1";
      cState[i] = "1";
    }
  }

  //check target word to see if word from guess is there
  for (let i = 0; i < tWord.length; i++) {
    for (let x = 0; x < tWord.length; x++) {
      if (Gguess[i] === tWord[x].toUpperCase()) {
          tWord[x] = "2";
          cState[i] = "2";
          x = 5;
        }
      }
    }
}

function danceTiles(tiles) {
  tiles.forEach((tile, index) => {
    setTimeout(() => {
     tile.classList.add("dance");
     tile.addEventListener(
      "animationend",
      () => {
        tile.classList.remove("dance");
      },
      { once: true }
    );
  }, index * FLIP_ANIMATION_DURATION / 5);
});
}

getWord();
