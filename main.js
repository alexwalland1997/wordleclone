let targetWord = "";
let guessword="catch"

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
  } catch (error) {
    getWord();
  }
}

//checks player guess is valid word
async function checkGuess(guess) {
    const url = "https://api.dictionaryapi.dev/api/v2/entries/en/" + guess;
    try {
      const response = await fetch(url);
      if (!response.ok) {
      }
  
      const json = await response.json();
    } catch (error) {
    }
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
        return
    }

    if (e.target.matches("[data-enter]")) {
        checkGuess();
        return;
    }

    if (e.target.matches("[data-delete]")) {
        deleteKey();
        return;
    }
}

//performs function depending on what player has pressed on keyboard
function handleKey(e) {
    if (e.key ==="Enter") {
        checkGuess();
        return;
    }

    if (e.key ==="Backspace" || e.key === "Delete") {
        deleteKey();
        return;
    }   
    
    if (e.key.match(/^[a-z]$/)) {
        pressKey(e.key);
        return;
    } 
}

getWord();
startInteraction();
