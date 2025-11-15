// src/utils/audioManager.js

let currentDialogueAudio = null;
const footstepAudio = new Audio("/audio/sfx/footstep_player_loop.mp3");
footstepAudio.loop = true;

const music = new Audio("/audio/music/background_music.mp3");
music.loop = true;
music.volume = 0.2;

function playDialogueAudio(audioPath) {
  stopDialogueAudio();
  if (!audioPath) return;

  currentDialogueAudio = new Audio(audioPath);
  const playPromise = currentDialogueAudio.play();

  if (playPromise !== undefined) {
    playPromise.catch((error) => {
      if (error.name !== "AbortError") {
        console.error("Audio play failed:", error);
      }
    });
  }
}

function stopDialogueAudio() {
  if (currentDialogueAudio) {
    currentDialogueAudio.pause();
    currentDialogueAudio.currentTime = 0;
    currentDialogueAudio = null;
  }
}

/**
 * Plays a short sound effect (SFX).
 * @param {string} audioPath - Path to the .mp3 file
 * @param {number} [volume=1.0] - Volume from 0.0 to 1.0
 */
function playSFX(audioPath, volume = 1) {
  const sfx = new Audio(audioPath);
  sfx.volume = volume;
  sfx.play().catch((e) => console.error("SFX play failed:", e));
}

function manageFootstepAudio(isMoving) {
  if (isMoving && footstepAudio.paused) {
    footstepAudio.play().catch((e) => console.warn("Footstep audio error:", e));
  } else if (!isMoving && !footstepAudio.paused) {
    footstepAudio.pause();
  }
}

/**
 * For dialogues (doesn't touch the music).
 */
function pauseInterfaceAudio() {
  stopDialogueAudio();
  footstepAudio.pause();
}

/**
 * For the "Esc" menu - it stops everything.
 */
function pauseGameAudio() {
  stopDialogueAudio();
  footstepAudio.pause();
  music.pause();
}

function playMusic() {
  music.play().catch((e) => console.error("Music play failed:", e));
}

export const audioManager = {
  playDialogueAudio,
  stopDialogueAudio,
  playSFX,
  manageFootstepAudio,
  pauseInterfaceAudio,
  pauseGameAudio,
  playMusic,
};
