import { words_10k } from "./lib/words_10k";
import { words_5k } from "./lib/words_5k";
import "./style.scss";

const input = document.querySelector<HTMLInputElement>(".type input")!;
const random = document.querySelector<HTMLDivElement>(".random")!;
const answer = document.querySelector<HTMLHeadingElement>(".answer h1")!;
const p = document.querySelector<HTMLParagraphElement>(".answer p")!;
const outer = document.querySelector<HTMLDivElement>(".outer")!;
const userInput = document.querySelector<HTMLInputElement>(".inner input")!;
const userName = document.querySelector(".user p")!;
const wrong = document.querySelector<HTMLDivElement>(".user .wrong")!;
const correct = document.querySelector<HTMLDivElement>(".user .correct")!;
const gameOver = document.querySelector<HTMLDivElement>(".over")!;
const currentScore = document.querySelector<HTMLParagraphElement>(
  ".over .currentscore"
)!;
const timer = document.querySelector<HTMLDivElement>(".timer")!;
const startBtn = document.querySelector<HTMLButtonElement>(".start")!;
const mic = document.querySelector<HTMLDivElement>(".type button")!;
const retryBtn = document.querySelector<HTMLDivElement>(".gameover button")!;
const selectUserBtn = document.querySelector<HTMLDivElement>(".outer button")!;

const wordsCollection: string[] = [...words_5k, ...words_10k];
const uniqueWordsCollection: string[] = [...new Set(wordsCollection)];
const words: string[] = uniqueWordsCollection.filter((w) => w.length >= 4);
// const words = ["love", "loves", "dove", "pove", "dope", "pope"];

let correctWord: string = "";
let correctScore: number = 0;
let wrongScore: number = 0;
let isUserSelected: boolean = false;
let intervalTimer: number | undefined;
let intervalCouter: number | undefined;
let intervalTicker: number | undefined;
let timeCount: number = 15;
let isInterval: boolean = false;
let isGameOver: boolean = false;
let isMicOn: boolean = false;

interface HiddenLetterIndices {
  [index: number]: boolean;
  hidddenIndicesCount: number;
}

function generateRandomLetters() {
  const randomWordIndex: number = Math.floor(Math.random() * words.length);
  const randomWord: string[] = words[randomWordIndex].split("");
  const randomWordLength: number = randomWord.length;
  const hiddenLetterIndices: HiddenLetterIndices = { hidddenIndicesCount: 0 };
  let hideLetterCount: number = 0;

  if (randomWordLength >= 14) hideLetterCount = 5;
  else if (randomWordLength >= 11) hideLetterCount = 4;
  else if (randomWordLength >= 8) hideLetterCount = 3;
  else hideLetterCount = 2;

  while (hiddenLetterIndices.hidddenIndicesCount < hideLetterCount) {
    const randomLetterIndex: number = Math.floor(
      Math.random() * randomWordLength
    );
    if (randomLetterIndex in hiddenLetterIndices) continue;
    hiddenLetterIndices[randomLetterIndex] = true;
    hiddenLetterIndices.hidddenIndicesCount++;
  }

  random.innerHTML = "";

  randomWord.forEach((letter, index) => {
    const letterDiv: HTMLDivElement = document.createElement("div");
    letterDiv.classList.add("letter");

    if (index in hiddenLetterIndices) letterDiv.textContent = " ";
    else letterDiv.textContent = letter.toUpperCase();

    random?.appendChild(letterDiv);
  });

  correctWord = randomWord.join("").toUpperCase();
}

function submit() {
  if (isGameOver) return;
  p!.textContent = "Last Answer";
  const inputWord: string = input.value.toUpperCase();
  const promtWordWithBlanks: string[] = [...(random.textContent || [])];

  const altPossibleCorrectWords: string[] = words.filter(
    (word: string): boolean => {
      const isAltWordSameInLength: boolean = word.length === correctWord.length;
      const doesAltWordEqualToInput: boolean = word.toUpperCase() === inputWord;

      return isAltWordSameInLength && doesAltWordEqualToInput;
    }
  );

  let altCorrectWord: string = "";

  const isValidAltWord = (): boolean => {
    for (const word of altPossibleCorrectWords) {
      let validMatchFound: boolean = true;

      for (let idx = 0; idx < promtWordWithBlanks.length; idx++) {
        const promtLetter: string = promtWordWithBlanks[idx];

        if (promtLetter !== " " && promtLetter !== word[idx].toUpperCase()) {
          validMatchFound = false;
        }
      }

      if (validMatchFound) {
        altCorrectWord = word.toUpperCase();
        return true;
      }
    }
    return false;
  };

  if (inputWord === correctWord) {
    answer.textContent = correctWord;
    answer.style.color = "greenyellow";
    correctScore++;
  } else if (isValidAltWord()) {
    correctScore++;
    answer.textContent = altCorrectWord;
    answer.style.color = "greenyellow";
  } else {
    wrongScore++;
    answer.textContent = correctWord;
    answer.style.color = "darkred";
  }
  input.value = "";

  wrong.textContent = wrongScore + "";
  correct.textContent = correctScore + "";

  clearInterval(intervalTimer);
  timeCount = 16;

  intervalTimer = setInterval(() => {
    submit();
    timeCount = 15;
    timer.textContent = timeCount + "";
  }, 15000);

  if (wrongScore >= 10) {
    isGameOver = true;
    gameOverFn();
    return;
  }
  generateRandomLetters();
}

function gameOverFn() {
  gameOver.classList.add("open");
  currentScore.textContent = `Your Score: ${correctScore}`;

  clearInterval(intervalTicker);
  clearInterval(intervalCouter);
  clearInterval(intervalTimer);

  isInterval = false;

  timer.textContent = "0";
  answer.textContent = "Correct Answer";
  p.textContent = "";
  isMicOn && mic.classList.remove("ripple");
  isMicOn = false;
}

function selectUser() {
  if (!userInput.value) return;
  userName.textContent = userInput.value.toUpperCase();
  isUserSelected = true;
  outer.classList.add("close");
}

function start(e?: MouseEvent) {
  e?.preventDefault();

  if (isInterval) return;
  input.focus();
  isGameOver = false;
  isInterval = true;
  input.value = "";
  generateRandomLetters();

  intervalTicker = setInterval(() => {
    timer.classList.toggle("tick");
  }, 500);

  intervalTimer = setInterval(() => {
    submit();
    timeCount = 15;
    timer.textContent = timeCount + "";
  }, 15000);

  intervalCouter = setInterval(() => {
    timeCount--;
    timer.textContent = timeCount + "";
  }, 1000);
}

function retry() {
  gameOver.classList.remove("open");
  correctScore = 0;
  wrongScore = 0;
  wrong.textContent = wrongScore + "";
  correct.textContent = correctScore + "";
  timeCount = 15;
  timer.textContent = timeCount + "";
  start();
}

const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

function startSpeechReco() {
  if (!SpeechRecognition) {
    alert(`Sorry! Your browser does NOT support speech recignition :(`);
    return;
  }
  if (!isInterval) return;
  isMicOn ? mic.classList.remove("ripple") : mic.classList.add("ripple");
  isMicOn = !isMicOn;

  if (!isMicOn) return;
  const recognition = new SpeechRecognition();
  console.log(recognition);
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.onresult = handleResult;
  recognition.start();
}

function handleResult({ results }: { results: SpeechRecognitionResultList }) {
  console.log("word");
  const word: string = results[results.length - 1][0].transcript.toUpperCase();
  input.value = word.replace(/\s/g, "");
}

window.addEventListener("keyup", (e: KeyboardEvent) => {
  e.preventDefault();
  if (e.key === "Enter") {
    if (isUserSelected && !isGameOver && isInterval) submit();
    if (!isUserSelected) selectUser();
  }
});

startBtn.addEventListener("click", start);
mic.addEventListener("click", startSpeechReco);
retryBtn.addEventListener("click", retry);
selectUserBtn.addEventListener("click", selectUser);
