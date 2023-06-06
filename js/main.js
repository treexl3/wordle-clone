import './confetti.js';
import { windowLoadTheme } from './changeTheme.js';

windowLoadTheme();

document.addEventListener("DOMContentLoaded", () => {
   // also in local storage
   let currentWordIndex = 0;
   let guessedWordCount = 0;
   let availableSpace = 1;
   let guessedWords = [[]];

   const words = [
      "sweet", "onion", "shoes", "heavy", "couch", "apple", "beach", "brain", "bread", "brush",
      "chair", "chest", "chord", "click", "clock", "cloud", "dance", "audio", "aware", "brown",
      "outer", "rough", "rapid", "music", "plant", "house", "earth", "image", "table", "mango",
      "tiger", "water", "sunny", "lemon", "storm", "piano", "light", "grape", "hotel", "smile",
      "honey", "juice", "cloud", "money", "cheer", "fairy", "flame", "thick", "vivid", "frost",
      "route", "quiet", "witty", "magic", "party", "speak", "globe", "jelly", "river", "spark",
   ];

   let currentWord = words[currentWordIndex];

   const keys = document.querySelectorAll(".keyboard-row button");

   initLocalStorage();
   initHelpModal();
   initStatsModal();
   initSettingsModal();
   initConfetti();
   createSquares();
   addKeyboardClicks();
   handleSettingsChanger()
   loadLocalStorage();

   document.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();

      if (!document.getElementById('help-modal').classList.contains('active') &&
         !document.getElementById('stats-modal').classList.contains('active') &&
         !document.getElementById('settings-modal').classList.contains('active')) {

         if (key === "enter") {
            handleSubmitWord();
            return;
         }

         if (key === "backspace") {
            handleDelete();
            return;
         }

         if (/^[a-z]$/.test(key) && !document.getElementById('finish-modal').classList.contains('finished')) {
            updateGuessedLetters(key);
         }
      }
   });

   function addKeyboardClicks() {
      for (let i = 0; i < keys.length; i++) {
         keys[i].addEventListener("click", ({ target }) => {
            const key = target.getAttribute("data-key") || target.closest('[data-key]').getAttribute('data-key');

            if (key === "enter") {
               handleSubmitWord();
               return;
            }

            if (key === "del") {
               handleDelete();
               return;
            }

            if (!document.getElementById('finish-modal').classList.contains('finished')) {
               updateGuessedLetters(key);
            }
         });
      }
   }

   function initLocalStorage() {
      const storedCurrentWordIndex = window.localStorage.getItem('currentWordIndex');
      if (!storedCurrentWordIndex) {
         window.localStorage.setItem('currentWordIndex', currentWordIndex);
      } else {
         currentWordIndex = Number(storedCurrentWordIndex);
         currentWord = words[currentWordIndex];
      }
   }

   function loadLocalStorage() {
      const storageWordArr = JSON.parse(window.localStorage.getItem('guessedWords')) || [];
      const storageWord = storageWordArr[storageWordArr.length - 2] || null;

      currentWordIndex = Number(window.localStorage.getItem('currentWordIndex')) || currentWordIndex;
      if (currentWordIndex + 1 > words.length) {
         currentWordIndex = 0;
         resetGameFullState();
      }
      if (storageWordArr && storageWord) {
         if (storageWordArr.length < 7 && storageWord.join('') !== words[currentWordIndex - 1]) {
            guessedWordCount = Number(window.localStorage.getItem('guessedWordCount')) || guessedWordCount;
            availableSpace = Number(window.localStorage.getItem('availableSpace')) || availableSpace;
            guessedWords = JSON.parse(window.localStorage.getItem('guessedWords')) || guessedWords;

            currentWord = words[currentWordIndex];

            const storedBoardContainer = window.localStorage.getItem('boardContainer');
            if (storedBoardContainer) {
               document.getElementById('board-container').innerHTML = storedBoardContainer;
            }

            const storedKeyboardContainer = window.localStorage.getItem('keyboardContainer');
            if (storedKeyboardContainer) {
               document.getElementById('keyboard-container').innerHTML = storedKeyboardContainer;
            }
         }
      }

      // Setting checked to true or false for checkboxes which are inside of settings-modal
      const checkboxInputs = Array.from(document.querySelectorAll('.label_check input[type="checkbox"'));
      const storedCheckboxDarkMode = window.localStorage.getItem('checkboxDarkMode');
      const checkboxColorBlindMode = window.localStorage.getItem('checkboxColorBlindMode');
      const storedCheckboxConfettiMode = window.localStorage.getItem('checkboxConfettiMode');
      const storedCheckboxLetterHints = window.localStorage.getItem('checkboxLetterHints');
      const storedCheckboxButtonSwap = window.localStorage.getItem('checkboxButtonSwap');

      checkboxInputs.map(checkbox => {
         // storedCheckboxDarkMode
         if (storedCheckboxDarkMode) {
            if (checkbox.id === 'darkMode' && storedCheckboxDarkMode === 'true') {
               checkbox.setAttribute('checked', storedCheckboxDarkMode);
            } else if ((checkbox.id === 'darkMode' && storedCheckboxDarkMode === 'false')) {
               checkbox.removeAttribute('checked');
            }
         }

         // checkboxColorBlindMode
         if (checkboxColorBlindMode) {
            const helpModalImage = document.getElementById('help-modal').querySelector('img');
            if (checkbox.id === 'colorBlindMode' && checkboxColorBlindMode === 'true') {
               checkbox.setAttribute('checked', storedCheckboxDarkMode);
               document.documentElement.classList.add('color-blind-mode');
               helpModalImage.src = 'img/examples-color-blind-mode.png';
            } else if (checkbox.id === 'colorBlindMode' && checkboxColorBlindMode === 'false') {
               checkbox.removeAttribute('checked');
               document.documentElement.classList.remove('color-blind-mode');
               helpModalImage.src = 'img/examples.png';
            }
         }

         // storedCheckboxConfettiMode
         if (storedCheckboxConfettiMode) {
            const confettiCanvas = document.getElementById('confetti-canvas');
            if (checkbox.id === 'confettiMode' && storedCheckboxConfettiMode === 'true') {
               checkbox.setAttribute('checked', storedCheckboxConfettiMode);
               confettiCanvas.style.display = 'block';
            } else if ((checkbox.id === 'confettiMode' && storedCheckboxConfettiMode === 'false')) {
               checkbox.removeAttribute('checked');
               confettiCanvas.style.display = 'none';
            }
         }

         // storedCheckboxLetterHints
         if (storedCheckboxLetterHints) {
            if (checkbox.id === 'letterHints' && storedCheckboxLetterHints === 'true') {
               checkbox.setAttribute('checked', storedCheckboxLetterHints);
            } else if (checkbox.id === 'letterHints' && storedCheckboxLetterHints === 'false') {
               checkbox.removeAttribute('checked');
            }
         }

         // storedCheckboxButtonSwap
         if (storedCheckboxButtonSwap) {
            const swappedRow = document.getElementById('swappedRow');
            const enterButton = document.querySelector('.keyboard-row button[data-key="enter"]');
            const delButton = document.querySelector('.keyboard-row button[data-key="del"]');
            if (checkbox.id === 'buttonSwap' && storedCheckboxButtonSwap === 'true') {
               checkbox.setAttribute('checked', storedCheckboxButtonSwap);
               swappedRow.append(delButton);
               swappedRow.prepend(enterButton);
            } else if (checkbox.id === 'buttonSwap' && storedCheckboxButtonSwap === 'false') {
               checkbox.removeAttribute('checked');
               swappedRow.append(enterButton);
               swappedRow.prepend(delButton);
            }
         }
      });
   }

   function createSquares() {
      const gameBoard = document.getElementById("board");

      for (let i = 0; i < 30; i++) {
         let square = document.createElement("div");
         square.classList.add("animate__animated", "animate__faster");
         square.classList.add("square");
         square.setAttribute("id", i + 1);
         gameBoard.appendChild(square);
      }
   }

   function preserveGameState() {
      window.localStorage.setItem('guessedWords', JSON.stringify(guessedWords));

      const keyboardContainer = document.getElementById('keyboard-container');
      window.localStorage.setItem('keyboardContainer', keyboardContainer.innerHTML);

      const boardContainer = document.getElementById('board-container');
      window.localStorage.setItem('boardContainer', boardContainer.innerHTML);
   }

   function getCurrentWordArr() {
      const numberOfGuessedWords = guessedWords.length;
      return guessedWords[numberOfGuessedWords - 1];
   }

   function updateGuessedLetters(letter) {
      const currentWordArr = getCurrentWordArr();

      if (currentWordArr && currentWordArr.length < 5) {
         currentWordArr.push(letter);

         const availableSpaceEl = document.getElementById(availableSpace);
         const keyboardEl = document.querySelector(`[data-key=${letter}]`);
         if (availableSpaceEl) {
            availableSpaceEl.classList.add('animate__bounceIn');
            keyboardEl.classList.add('animate__bounceIn');

            availableSpaceEl.textContent = letter;
            availableSpace = availableSpace + 1;
         }
         setTimeout(() => keyboardEl.classList.remove('animate__bounceIn'), 500);
      }
   }

   function updateTotalGames() {
      const totalGames = window.localStorage.getItem('totalGames') || 0;
      window.localStorage.setItem('totalGames', Number(totalGames) + 1);
   }

   function showResult() {
      const totalWins = window.localStorage.getItem('totalWins') || 0;
      window.localStorage.setItem('totalWins', Number(totalWins) + 1);

      const currentStreak = window.localStorage.getItem('currentStreak') || 0;
      window.localStorage.setItem('currentStreak', Number(currentStreak) + 1);
   }

   function showLosingResult() {
      window.localStorage.setItem('currentStreak', 0);
   }

   function clearBoard() {
      const keys = Array.from(document.querySelectorAll(".keyboard-row button"));
      for (let i = 0; i < 30; i++) {
         let square = document.getElementById(i + 1);
         square.textContent = "";
         square.classList.remove('incorrect-letter', 'correct-letter-in-place', 'correct-letter', 'exists-twice', 'exists-three-times', 'animate__flipInX', 'animate__bounceIn');
      }
      keys.map(key => key.classList.remove('incorrect-letter', 'correct-letter-in-place', 'correct-letter', 'exists-twice', 'exists-three-times'));
   }

   function resetGameState() {
      // LocalStorage removing items
      window.localStorage.removeItem('guessedWordCount');
      window.localStorage.removeItem('guessedWords');
      window.localStorage.removeItem('keyboardContainer');
      window.localStorage.removeItem('boardContainer');
      window.localStorage.removeItem('availableSpace');

      guessedWordCount = 0;
      availableSpace = 1;
      guessedWords = [[]];

      currentWord = words[currentWordIndex += 1];
   }

   function resetGameFullState() {
      window.localStorage.removeItem('guessedWordCount');
      window.localStorage.removeItem('guessedWords');
      window.localStorage.removeItem('keyboardContainer');
      window.localStorage.removeItem('boardContainer');
      window.localStorage.removeItem('availableSpace');
      window.localStorage.removeItem('totalWins');
      window.localStorage.removeItem('currentStreak');
      window.localStorage.removeItem('totalGames');

      guessedWordCount = 0;
      availableSpace = 1;
      guessedWords = [[]];
   }

   function getIndicesOfLetter(letter, arr) {
      const indices = [];
      let idx = arr.indexOf(letter);
      while (idx != -1) {
         indices.push(idx);
         idx = arr.indexOf(letter, idx + 1);
      }
      return indices;
   }

   function getTileClass(letter, index, currentWordArr) {
      const isCorrectLetter = currentWord
         .toUpperCase()
         .includes(letter.toUpperCase());

      if (!isCorrectLetter) {
         return "incorrect-letter";
      }

      const letterInThatPosition = currentWord.charAt(index);
      const isCorrectPosition =
         letter.toLowerCase() === letterInThatPosition.toLowerCase();

      if (isCorrectPosition) {
         return "correct-letter-in-place";
      }

      const checkboxInputs = Array.from(document.querySelectorAll('.label_check input[type="checkbox"'));
      let existsTwice = false;
      let existsThreeTimes = false;

      checkboxInputs.map(checkbox => {
         if (checkbox.id === 'letterHints') {
            if (checkbox.checked) {
               existsTwice =
                  currentWord.split("").filter((l) => l === letter).length == 2;
               existsThreeTimes =
                  currentWord.split("").filter((l) => l === letter).length == 3;
            }
         }
      });

      // is guessed twice and exists twice
      if (existsTwice) {
         return "exists-twice";
      }

      // is guessed twice and exists twice
      if (existsThreeTimes) {
         return "exists-three-times";
      }

      const hasBeenGuessedAlready = currentWordArr.indexOf(letter) < index;

      const indices = getIndicesOfLetter(letter, currentWord.split(""));
      const otherIndices = indices.filter((i) => i !== index);
      const isGuessedCorrectlyLater = otherIndices.some(
         (i) => i > index && currentWordArr[i] === letter
      );

      if (!hasBeenGuessedAlready && !isGuessedCorrectlyLater) {
         return "correct-letter";
      }

      return "incorrect-letter";
   }

   function updateWordIndex() {
      window.localStorage.setItem('currentWordIndex', currentWordIndex + 1);
   }

   async function handleSubmitWord() {
      const currentWordArr = getCurrentWordArr();
      const guessedWord = currentWordArr.join("");

      try {
         /*  
         const res = await fetch(
             `https://wordsapiv1.p.rapidapi.com/words/${guessedWord.toLowerCase()}`,
             {
                method: "GET",
                headers: {
                   'X-RapidAPI-Key': 'cde00f3896msh5a9a22b62bc7d77p1cd956jsn19ee1e737043',
                   'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
                },
             }
          ); 
          */

         const firstLetterId = guessedWordCount * 5 + 1;

         const alert = document.getElementById('alert');
         if (guessedWord.length !== 5) {
            alert.innerHTML = 'Too short!';
            if (!alert.classList.contains('active')) {
               alert.classList.add('active');
            }
            setTimeout(() => alert.classList.remove('active'), 850);

            currentWordArr.forEach((letter, index) => {
               const letterId = firstLetterId + index;
               const letterEl = document.getElementById(letterId);
               if (letterEl) {
                  letterEl.classList.remove("animate__bounceIn");
                  letterEl.classList.add("animate__headShake");
               }
               setTimeout(() => letterEl.classList.remove('animate__headShake'), 500);
            });

            return;
         }

         /*  
         if (!res.ok) {
             alert.innerHTML = 'Word not found!';
             if (!alert.classList.contains('active')) {
                alert.classList.add('active');
             }
             setTimeout(() => alert.classList.remove('active'), 850);
 
             currentWordArr.forEach((letter, index) => {
                const letterId = firstLetterId + index;
                const letterEl = document.getElementById(letterId);
                if (letterEl) {
                   letterEl.classList.remove("animate__bounceIn");
                   letterEl.classList.add("animate__headShake");
                }
                setTimeout(() => letterEl.classList.remove('animate__headShake'), 500);
             });
 
 
             return;
          } 
          */

         window.localStorage.setItem('availableSpace', availableSpace);

         const interval = 200;
         currentWordArr.forEach((letter, index) => {
            setTimeout(() => {
               const tileClass = getTileClass(letter, index, currentWordArr);
               if (tileClass) {
                  const letterId = firstLetterId + index;
                  const letterEl = document.getElementById(letterId);
                  if (letterEl) {
                     letterEl.classList.add("animate__flipInX");
                     letterEl.classList.add(tileClass);
                  }

                  const keyboardEl = document.querySelector(`[data-key=${letter}]`);
                  if (keyboardEl) {
                     keyboardEl.classList.add(tileClass);
                  }
               }
               if (index === 4) {
                  preserveGameState();
               }
            }, index * interval);
         });

         guessedWordCount += 1;
         window.localStorage.setItem('guessedWordCount', guessedWordCount);

         const finishModal = document.getElementById('finish-modal');
         const finishModalContent = finishModal.querySelector('.modal-content');
         if (guessedWord === currentWord) {
            startConfetti();
            updateWordIndex();

            // Show message element immedidately when the statement executes
            const message = document.getElementById('message');
            message.innerHTML = '<b>You Won!</b>';
            message.classList.add('active');

            setTimeout(() => {
               finishModalContent.innerHTML =
                  `
                  <div class="titleClose">
                     <h2>You Won!</h2>
                     <span class="close" id="close-finish">&times;</span>
                  </div>
                  <div class="cont">
                     <div class="desc">You are right! The word is:</div>
                     <div class="word">
                        <span>${currentWord}</span>
                     </div>
                     <a class="definition" href="https://dictionary.cambridge.org/dictionary/english/${currentWord}" target="_blank">
                        What does this word mean?
                     </a>
                     <button type="button" class="new-game-btn" id="newGameBtn">New game</button>
                     <div class="or-text">or press Enter to play again</div>
                  </div>
                  `;
               initFinishModal();
               showResult();
               updateTotalGames();

               // finishModalButton
               const finishModalButton = document.getElementById('newGameBtn');
               finishModalButton.addEventListener('click', () => {
                  clearBoard();
                  resetGameState();
                  message.classList.remove('active');
                  alert.classList.remove('removed');
                  finishModal.classList.remove('finished');
                  finishModalButton.disabled = 'true';
                  if (currentWordIndex + 1 > words.length) {
                     currentWordIndex = 0;
                     resetGameFullState();
                     currentWord = words[currentWordIndex];
                  }
               });

               // retryButton
               const retryButton = document.querySelector('.retry-button');
               retryButton.innerHTML = '<i class="fas fa-location-arrow" style="font-size: 26px;"></i>';
               retryButton.addEventListener('click', () => {
                  clearBoard();
                  resetGameState();
                  message.classList.remove('active');
                  retryButton.classList.remove('active');
                  alert.classList.remove('removed');
                  finishModal.classList.remove('finished');
                  finishModalButton.disabled = 'true';
                  if (currentWordIndex + 1 > words.length) {
                     currentWordIndex = 0;
                     resetGameFullState();
                     currentWord = words[currentWordIndex];
                  }
               });

               window.addEventListener('keydown', (e) => {
                  if (e.key === 'Enter') {
                     finishModalButton.click();
                  }
               });

               return;
            }, 1200);
         } else if (guessedWords.length === 6 && guessedWord !== currentWord) {
            updateWordIndex();

            // Show message element immedidately when the statement executes
            const message = document.getElementById('message');
            message.innerHTML = '<b>You Lost!</b>';
            message.classList.add('active');

            setTimeout(() => {
               finishModalContent.innerHTML =
                  `
                  <div class="titleClose">
                     <h2>You Lost!</h2>
                     <span class="close" id="close-finish">&times;</span>
                  </div>
                  <div class="cont">
                     <div class="desc">The answer was:</div>
                     <div class="word">
                        <span>${currentWord}</span>
                     </div>
                     <a class="definition" href="https://dictionary.cambridge.org/dictionary/english/${currentWord}" target="_blank">
                        What does this word mean?
                     </a>
                     <button type="button" class="new-game-btn" id="newGameBtn">New game</button>
                     <div class="or-text">or press Enter to play again</div>
                  </div>
               `;
               initFinishModal();
               updateTotalGames();
               showLosingResult();

               // finishModalButton
               const finishModalButton = document.getElementById('newGameBtn');
               finishModalButton.addEventListener('click', () => {
                  clearBoard();
                  resetGameState();
                  finishModalButton.disabled = 'true';
                  message.classList.remove('active');
                  alert.classList.remove('removed');
                  finishModal.classList.remove('finished');
                  finishModalButton.disabled = 'true';
                  if (currentWordIndex + 1 > words.length) {
                     currentWordIndex = 0;
                     resetGameFullState();
                     currentWord = words[currentWordIndex];
                  }
               });

               // retryButton
               const retryButton = document.querySelector('.retry-button');
               retryButton.innerHTML = '<i class="fas fa-location-arrow" style="font-size: 26px;"></i>';
               retryButton.addEventListener('click', () => {
                  clearBoard();
                  resetGameState();
                  finishModalButton.disabled = 'true';
                  message.classList.remove('active');
                  retryButton.classList.remove('active');
                  finishModal.classList.remove('finished');
                  alert.classList.remove('removed');
                  finishModalButton.disabled = 'true';
                  if (currentWordIndex + 1 > words.length) {
                     currentWordIndex = 0;
                     resetGameFullState();
                     currentWord = words[currentWordIndex];
                  }
               });

               window.addEventListener('keydown', (e) => {
                  if (e.key === 'Enter') {
                     finishModalButton.click();
                  }
               });

               return;
            }, 1200);
         }

         guessedWords.push([]);
      } catch (error) {
         window.alert(error);
      }
   }

   function handleDelete() {
      const currentWordArr = getCurrentWordArr();

      if (!currentWordArr.length) {
         return;
      }

      currentWordArr.pop();

      guessedWords[guessedWords.length - 1] = currentWordArr;

      const lastLetterEl = document.getElementById(availableSpace - 1);

      lastLetterEl.classList.remove('animate__bounceIn', 'animate__headShake');
      lastLetterEl.innerHTML = "";
      availableSpace = availableSpace - 1;
   }

   function handleSettingsChanger() {
      const checkboxInputs = Array.from(document.querySelectorAll('.label_check input[type="checkbox"'));

      if (checkboxInputs) {
         checkboxInputs.map(checkbox => checkbox.addEventListener('change', () => {

            // darkMode
            if (checkbox.id === 'darkMode') {
               if (checkbox.checked) {
                  window.localStorage.setItem('checkboxDarkMode', true);
               } else {
                  window.localStorage.setItem('checkboxDarkMode', false);
               }
            }

            // colorBlindMode
            if (checkbox.id === 'colorBlindMode') {
               const helpModalImage = document.getElementById('help-modal').querySelector('img');
               if (checkbox.checked) {
                  window.localStorage.setItem('checkboxColorBlindMode', true);
                  document.documentElement.classList.add('color-blind-mode');
                  helpModalImage.src = 'img/examples-color-blind-mode.png';
               } else {
                  window.localStorage.setItem('checkboxColorBlindMode', false);
                  document.documentElement.classList.remove('color-blind-mode');
                  helpModalImage.src = 'img/examples.png';
               }
            }

            // letterHints
            if (checkbox.id === 'letterHints') {
               if (checkbox.checked) {
                  window.localStorage.setItem('checkboxLetterHints', true);
               } else {
                  window.localStorage.setItem('checkboxLetterHints', false);
               }
            }

            // confettiMode
            if (checkbox.id === 'confettiMode') {
               const confettiCanvas = document.getElementById('confetti-canvas');
               if (!checkbox.checked) {
                  window.localStorage.setItem('checkboxConfettiMode', false);
                  confettiCanvas.style.display = 'none';
               } else {
                  window.localStorage.setItem('checkboxConfettiMode', true);
                  confettiCanvas.style.display = 'block';
               }
            }

            // buttonSwap (Enter and Backspace)
            if (checkbox.id === 'buttonSwap') {
               const swappedRow = document.getElementById('swappedRow');
               const enterButton = document.querySelector('.keyboard-row button[data-key="enter"]');
               const delButton = document.querySelector('.keyboard-row button[data-key="del"]');
               if (!checkbox.checked) {
                  window.localStorage.setItem('checkboxButtonSwap', false);
                  swappedRow.append(enterButton);
                  swappedRow.prepend(delButton);
               } else {
                  window.localStorage.setItem('checkboxButtonSwap', true);
                  swappedRow.append(delButton);
                  swappedRow.prepend(enterButton);
               }
            }
         }));
      }
   }

   function initHelpModal() {
      const modal = document.getElementById("help-modal");

      // Get the button that opens the modal
      const btn = document.getElementById("help");

      // Get the <span> element that closes the modal
      const span = document.getElementById("close-help");

      // When the user clicks on the button, open the modal
      btn.addEventListener("click", function () {
         modal.classList.add('active');
         modal.style.opacity = "1";
         modal.style.visibility = "visible";
      });

      // When the user clicks on <span> (x), close the modal
      span.addEventListener("click", function () {
         modal.classList.remove('active');
         modal.style.opacity = "0";
         modal.style.visibility = "hidden";
      });

      // When the user clicks anywhere outside of the modal, close it
      window.addEventListener("click", function (event) {
         if (event.target == modal) {
            modal.classList.remove('active');
            modal.style.opacity = "0";
            modal.style.visibility = "hidden";
         }
      });
   }

   function updateStatsModal() {
      const totalGames = window.localStorage.getItem('totalGames');
      const totalWins = window.localStorage.getItem('totalWins');
      const currentStreak = window.localStorage.getItem('currentStreak');

      document.getElementById('total-played').textContent = totalGames;
      document.getElementById('total-wins').textContent = totalWins;
      document.getElementById('current-streak').textContent = currentStreak;

      const winPct = Math.round((totalWins / totalGames) * 100) || 0;
      document.getElementById('win-pct').textContent = winPct + '%';
   }

   function initStatsModal() {
      const modal = document.getElementById("stats-modal");

      // Get the button that opens the modal
      const btn = document.getElementById("stats");

      // Get the <span> element that closes the modal
      const span = document.getElementById("close-stats");

      // When the user clicks on the button, open the modal
      btn.addEventListener("click", function () {
         // update stats here
         updateStatsModal();
         modal.classList.add('active');
         modal.style.opacity = "1";
         modal.style.visibility = "visible";
      });

      // When the user clicks on <span> (x), close the modal
      span.addEventListener("click", function () {
         modal.classList.remove('active');
         modal.style.opacity = "0";
         modal.style.visibility = "hidden";
      });

      // When the user clicks anywhere outside of the modal, close it
      window.addEventListener("click", function (event) {
         if (event.target == modal) {
            modal.classList.remove('active');
            modal.style.opacity = "0";
            modal.style.visibility = "hidden";
         }
      });
   }

   function initSettingsModal() {
      const modal = document.getElementById("settings-modal");

      // Get the button that opens the modal
      const btn = document.getElementById("settings");

      // Get the <span> element that closes the modal
      const span = document.getElementById("close-settings");

      // When the user clicks on the button, open the modal
      btn.addEventListener("click", function () {
         modal.classList.add('active');
         modal.style.opacity = "1";
         modal.style.visibility = "visible";
      });

      // When the user clicks on <span> (x), close the modal
      span.addEventListener("click", function () {
         modal.classList.remove('active');
         modal.style.opacity = "0";
         modal.style.visibility = "hidden";
      });

      // When the user clicks anywhere outside of the modal, close it
      window.addEventListener("click", function (event) {
         modal.classList.remove('active');
         if (event.target == modal) {
            modal.style.opacity = "0";
            modal.style.visibility = "hidden";
         }
      });
   }

   function initFinishModal() {
      const modal = document.getElementById("finish-modal");

      // Get the <span> element that closes the modal
      const span = document.getElementById("close-finish");

      const buttonNewGame = document.getElementById('newGameBtn');
      const retryButton = document.querySelector('.retry-button');
      const finishModalButton = document.getElementById('newGameBtn');
      const alert = document.getElementById('alert');

      modal.classList.add('finished')
      modal.style.opacity = "1";
      modal.style.visibility = "visible";

      // When the user clicks on <span> (x), close the modal
      span.addEventListener("click", function () {
         stopConfetti();
         retryButton.classList.add('active');
         modal.style.opacity = "0";
         modal.style.visibility = "hidden";
         finishModalButton.disabled = 'true';
         alert.classList.add('removed');
      });

      // When the user clicks on <button> (new game), close the modal
      buttonNewGame.addEventListener("click", function () {
         stopConfetti();
         modal.classList.remove('finished')
         modal.style.opacity = "0";
         modal.style.visibility = "hidden";
      });

      // When the user clicks anywhere outside of the modal, close it
      window.addEventListener("click", function (event) {
         if (event.target == modal) {
            stopConfetti();
            retryButton.classList.add('active');
            modal.style.opacity = "0";
            modal.style.visibility = "hidden";
            finishModalButton.disabled = 'true';
            alert.classList.add('removed');
         }
      });
   }

});