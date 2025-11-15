// src/main.js
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { CrashedMetro } from "./scenes/CrashedMetro.js";
import { DIALOGUES, OBJECTIVES } from "./data/dialogues.js";
import { ENDINGS } from "./data/text.js";
import {
  GAME_SETTINGS,
  PLAYER_SETTINGS,
  STARTING_STATE,
  SCENE_SETTINGS,
  WORLD_BOUNDS,
} from "./config.js";
import { audioManager } from "./utils/audioManager.js";
import { uiManager } from "./utils/uiManager.js";
import "./style.css";

// Game variables
let scene, camera, renderer, controls;
const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();

// Scene and player
let activeScene;
let currentScene = "crashed";
let player = { height: PLAYER_SETTINGS.HEIGHT, speed: PLAYER_SETTINGS.SPEED };
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let moveForward = false,
  moveBackward = false,
  moveLeft = false,
  moveRight = false;

// Game logic
let currentLevel = STARTING_STATE.LEVEL;
const totalLevels = GAME_SETTINGS.TOTAL_LEVELS;
let playerInventory = { ...STARTING_STATE.INVENTORY };
let gameInProgress = true;
let uiActionInProgress = false;

// Interactions
let currentInteractable = null;
let raycaster = new THREE.Raycaster();
const survivorBBox = new THREE.Box3();
const intersectionPoint = new THREE.Vector3();

// Initialize
init();
animate();

//------------------------------------------------------------

// Update Level and Objective
// function updateObjective(level, text = null) {
//   if (level > totalLevels) level = totalLevels;
//   currentLevel = level;

//   const newText = text || OBJECTIVES[level] || `Objective ${level}???`;

//   if (levelEl) {
//     levelEl.textContent = `${currentLevel} / ${totalLevels}`;
//   }
//   if (objectiveTextEl) {
//     objectiveTextEl.innerHTML = newText;
//   }
// }

// function updateInventoryUI() {
//   if (!inventoryItemsEl) return;
//   inventoryItemsEl.innerHTML = "";
//   let itemsFound = false;

//   if (playerInventory.water > 0) {
//     inventoryItemsEl.innerHTML += `
//       <div class="item">
//         <span class="item-icon">💧</span>
//         <span class="item-name">Water Bottle (1)</span>
//       </div>
//     `;
//     itemsFound = true;
//   }
//   if (playerInventory.lollipop > 0) {
//     inventoryItemsEl.innerHTML += `
//       <div class="item">
//         <span class="item-icon">🍭</span>
//         <span class="item-name">Lollipop (1)</span>
//       </div>
//     `;
//     itemsFound = true;
//   }

//   if (!itemsFound) {
//     inventoryItemsEl.innerHTML += `
//       <div class="item">
//         <span class="item-name">(empty)</span>
//       </div>
//     `;
//   }
// }

function init() {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.Fog(
    SCENE_SETTINGS.FOG_COLOR,
    SCENE_SETTINGS.FOG_NEAR,
    SCENE_SETTINGS.FOG_FAR
  );

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(
    SCENE_SETTINGS.STARTING_POSITION.x,
    SCENE_SETTINGS.STARTING_POSITION.y,
    SCENE_SETTINGS.STARTING_POSITION.z
  );
  scene.add(camera);

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#game-canvas"),
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;

  // Controls
  controls = new PointerLockControls(camera, document.body);

  // UI manager init
  const uiElements = {
    dialogueBox: document.getElementById("dialogue-box"),
    dialogueSpeaker: document.getElementById("dialogue-speaker"),
    dialogueText: document.getElementById("dialogue-text"),
    interactionPrompt: document.getElementById("interaction-prompt"),
    pauseMenu: document.getElementById("pause-menu"),
    crosshair: document.getElementById("crosshair"),
    inventoryItemsEl: document.getElementById("inventory-items"),
    choiceBox: document.getElementById("choice-box"),
    choiceSpeaker: document.getElementById("choice-speaker"),
    choicePrompt: document.getElementById("choice-prompt"),
    choiceBtn1: document.getElementById("choice-btn-1"),
    choiceBtn2: document.getElementById("choice-btn-2"),
    endScreen: document.getElementById("end-screen"),
    endTitle: document.getElementById("end-title"),
    endSubtitle: document.getElementById("end-subtitle"),
    levelEl: document.getElementById("level"),
    objectiveTextEl: document.getElementById("objective-text"),
  };
  uiManager.init(uiElements);

  // --- Event listeners ---
  controls.addEventListener("unlock", () => {
    const choiceBox = document.getElementById("choice-box");
    if (gameInProgress && !choiceBox.classList.contains("active")) {
      audioManager.pauseGameAudio();
      uiManager.showPauseMenu();
    }
  });

  controls.addEventListener("lock", () => {
    uiManager.hidePauseMenu();
    if (gameInProgress) {
      audioManager.playMusic();
    }
  });

  // --- Launch the game ---
  const startScreen = document.getElementById("start-screen");
  const startButton = startScreen.querySelector(".start-button");
  const hasStartedBefore = sessionStorage.getItem("gameStarted");

  if (!hasStartedBefore) {
    startScreen.classList.remove("hidden");
    startButton.addEventListener("click", () => {
      startScreen.classList.add("hidden");
      sessionStorage.setItem("gameStarted", "true");
      audioManager.playMusic();
      controls.lock();
    });
  } else {
    startScreen.classList.add("hidden");
    const lockOnClick = () => {
      if (gameInProgress && !controls.isLocked) {
        controls.lock();
        renderer.domElement.removeEventListener("click", lockOnClick);
      }
    };
    renderer.domElement.addEventListener("click", lockOnClick);
  }

  loadCrashedScene();
  setupInput();
  window.addEventListener("resize", onWindowResize);

  uiManager.updateInventoryUI(playerInventory);
  uiManager.updateObjective(
    STARTING_STATE.LEVEL,
    OBJECTIVES[STARTING_STATE.LEVEL],
    totalLevels
  );
}

function loadCrashedScene() {
  clearScene();
  currentScene = "crashed";
  scene.fog = new THREE.Fog(
    SCENE_SETTINGS.FOG_COLOR,
    SCENE_SETTINGS.FOG_NEAR,
    SCENE_SETTINGS.FOG_FAR
  );
  scene.background = new THREE.Color(0x000000);
  const crashedMetro = new CrashedMetro(scene, textureLoader);
  crashedMetro.create();
  activeScene = crashedMetro;
  camera.position.set(
    SCENE_SETTINGS.STARTING_POSITION.x,
    SCENE_SETTINGS.STARTING_POSITION.y,
    SCENE_SETTINGS.STARTING_POSITION.z
  );
}

function clearScene() {
  const objectsToRemove = [];
  scene.children.forEach((child) => {
    if (child !== camera) {
      objectsToRemove.push(child);
    }
  });

  objectsToRemove.forEach((object) => {
    if (object.geometry) object.geometry.dispose();
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach((mat) => mat.dispose());
      } else {
        object.material.dispose();
      }
    }
    scene.remove(object);
  });
}

function setupInput() {
  document.addEventListener("keydown", (e) => {
    const choiceBox = document.getElementById("choice-box");
    if (e.code === "Escape" && gameInProgress && controls.isLocked) {
      controls.unlock();
      return;
    }

    // Prevent movement if the choice box is open or the game is over
    if (choiceBox.classList.contains("active") || !gameInProgress) {
      moveForward = false;
      moveBackward = false;
      moveLeft = false;
      moveRight = false;
      return;
    }

    switch (e.code) {
      case "KeyW":
        moveForward = true;
        break;
      case "KeyS":
        moveBackward = true;
        break;
      case "KeyA":
        moveLeft = true;
        break;
      case "KeyD":
        moveRight = true;
        break;
      case "KeyE":
        if (currentInteractable && !uiActionInProgress) {
          interact(currentInteractable);
        }
        break;
    }
  });

  document.addEventListener("keyup", (e) => {
    switch (e.code) {
      case "KeyW":
        moveForward = false;
        break;
      case "KeyS":
        moveBackward = false;
        break;
      case "KeyA":
        moveLeft = false;
        break;
      case "KeyD":
        moveRight = false;
        break;
    }
  });

  // Close dialogue
  const dialogueBox = document.getElementById("dialogue-box");
  dialogueBox.addEventListener("click", () => {
    audioManager.stopDialogueAudio();
    uiManager.hideDialogue();
  });

  // Resume button
  const resumeButton = document.getElementById("resume-button");
  resumeButton.addEventListener("click", () => {
    controls.lock();
  });

  // Restart button (from pause)
  const restartButton = document.getElementById("restart-button");
  restartButton.addEventListener("click", () => {
    location.reload();
  });

  // Restart button (from end screen)
  const restartButtonEnd = document.getElementById("restart-button-end");
  restartButtonEnd.addEventListener("click", () => {
    location.reload();
  });
}

// --- Basic game logic ---
function interact(object) {
  if (!gameInProgress || uiActionInProgress) return;
  uiManager.hideDialogue();

  const dialogueKey = object.userData.dialogue;
  if (!dialogueKey) return;

  const dialogueSet = DIALOGUES[currentScene];
  if (!dialogueSet) return;

  const dialogue = dialogueSet[dialogueKey];
  if (!dialogue) return;

  const onChoice = (type, key, choice) => {
    uiManager.hideChoiceBox(controls);
    audioManager.pauseInterfaceAudio();
    uiActionInProgress = false;
    handleChoice(type, key, choice);
  };

  // Lvl 1 Clue
  if (currentLevel === 1 && dialogueKey === "david" && dialogue.text_lvl1) {
    audioManager.playDialogueAudio(dialogue.text_lvl1_audio);
    uiActionInProgress = true;
    uiManager.showChoiceBox(
      dialogue.name,
      dialogue.text_lvl1,
      dialogue.choice1_lvl1,
      () => onChoice("david_quest", dialogueKey, 1)
    );
    controls.unlock();
    return;
  }

  // Lvl 2 Water
  if (
    currentLevel === 2 &&
    playerInventory.water > 0 &&
    dialogue.water_prompt
  ) {
    audioManager.playDialogueAudio(dialogue.water_prompt_audio);
    uiActionInProgress = true;
    uiManager.showChoiceBox(
      dialogue.name,
      dialogue.water_prompt,
      dialogue.water_choice1,
      () => onChoice("water", dialogueKey, 1),
      dialogue.water_choice2,
      () => onChoice("water", dialogueKey, 2)
    );
    controls.unlock();
    return;
  }

  // Lvl 3 Lollipop
  if (
    currentLevel === 3 &&
    playerInventory.lollipop > 0 &&
    dialogue.lollipop_prompt
  ) {
    audioManager.playDialogueAudio(dialogue.lollipop_prompt_audio);
    uiActionInProgress = true;
    uiManager.showChoiceBox(
      dialogue.name,
      dialogue.lollipop_prompt,
      dialogue.lollipop_choice1,
      () => onChoice("lollipop", dialogueKey, 1),
      dialogue.lollipop_choice2,
      () => onChoice("lollipop", dialogueKey, 2)
    );
    controls.unlock();
    return;
  }

  // Lvl 4 Door
  if (currentLevel === 4 && dialogue.door_prompt) {
    audioManager.playDialogueAudio(dialogue.door_prompt_audio);
    uiActionInProgress = true;
    uiManager.showChoiceBox(
      dialogue.name,
      dialogue.door_prompt,
      dialogue.door_choice1,
      () => onChoice("door", dialogueKey, 1),
      dialogue.door_choice2,
      () => onChoice("door", dialogueKey, 2)
    );
    controls.unlock();
    return;
  }

  // Lvl 5 Carry
  if (currentLevel === 5 && dialogue.carry_prompt) {
    audioManager.playDialogueAudio(dialogue.carry_prompt_audio);
    uiActionInProgress = true;
    uiManager.showChoiceBox(
      dialogue.name,
      dialogue.carry_prompt,
      dialogue.carry_choice1,
      () => onChoice("carry", dialogueKey, 1),
      dialogue.carry_choice2,
      () => onChoice("carry", dialogueKey, 2)
    );
    controls.unlock();
    return;
  }

  // 6. DEFAULT DIALOGUE (Lvl 1)
  if (currentLevel === 1 && dialogue.text_lvl1 && dialogueKey !== "david") {
    audioManager.playDialogueAudio(dialogue.text_lvl1_audio);
    uiManager.showChoiceBox(
      dialogue.name,
      dialogue.text_lvl1,
      dialogue.clue_choice1,
      () => onChoice("clue_ack", dialogueKey, 1)
    );
    controls.unlock();
    return;
  }

  // 7. DEFAULT DIALOGUE
  uiManager.showDialogue(dialogue.name, dialogue.text);
  if (dialogue.text) {
    audioManager.playDialogueAudio(dialogue.text_audio);
  }
}

function handleChoice(type, dialogueKey, choice) {
  // hideChoiceBox();

  if (type === "clue_ack") {
    return;
  }

  // --- Lvl 1 Clue ---
  if (type === "david_quest") {
    if (choice === 1) {
      audioManager.playSFX("/audio/sfx/item_pickup.mp3", 0.7);
      playerInventory.water = 1;
      uiManager.updateInventoryUI(playerInventory);
      uiManager.updateObjective(2, OBJECTIVES[2], totalLevels);
      currentLevel = 2;
    }
    return;
  }

  // --- Lvl 2 Water ---
  if (type === "water") {
    if (choice === 2) return; // Player saved the water

    playerInventory.water = 0;
    uiManager.updateInventoryUI(playerInventory);

    if (dialogueKey === "martha") {
      // RIGHT CHOICE
      uiActionInProgress = true;

      audioManager.playSFX("/audio/sfx/drink.mp3", 1);
      activeScene.playAnimationFor("martha", "Drinking", THREE.LoopOnce, () => {
        const lexaPosition = { x: 0.3, y: 0, z: -1.4 };
        const character = activeScene.survivorsMap.get("martha");

        if (character && character.model) {
          const dx = lexaPosition.x - character.model.position.x;
          const dz = lexaPosition.z - character.model.position.z;
          const targetAngle = Math.atan2(dx, dz);
          character.model.rotation.y = targetAngle;
        }

        const marthaSteps = new Audio("/audio/sfx/footstep_npc.mp3");
        marthaSteps.loop = true;
        marthaSteps.volume = 1;
        marthaSteps.play();
        activeScene.playAnimationFor("martha", "Walking", THREE.LoopRepeat);

        playerInventory.lollipop = 1; // Get lollipop

        activeScene.moveCharacterTo("martha", lexaPosition, 3000, () => {
          marthaSteps.pause();
          activeScene.playAnimationFor(
            "martha",
            "CrouchingIdle",
            THREE.LoopRepeat
          );
          audioManager.playSFX("/audio/sfx/item_pickup.mp3", 0.7);
          uiManager.updateInventoryUI(playerInventory);
          uiManager.updateObjective(3, OBJECTIVES[3], totalLevels);
          currentLevel = 3;
          uiActionInProgress = false;
        });
      });
    } else {
      runBadEnding(ENDINGS.WATER_WRONG.title, ENDINGS.WATER_WRONG.subtitle);
    }
    return;
  }

  // --- Lvl 3 Lollipop ---
  if (type === "lollipop") {
    if (choice === 2) return; // Saved the lollipop

    playerInventory.lollipop = 0;
    uiManager.updateInventoryUI(playerInventory);

    if (dialogueKey === "axton") {
      // RIGHT CHOICE
      uiActionInProgress = true;
      audioManager.playSFX("/audio/sfx/eat.mp3", 1);

      activeScene.playAnimationFor("axton", "StandingUp", THREE.LoopOnce);
      activeScene.playAnimationFor(
        "martha",
        "StandingUp_Martha",
        THREE.LoopOnce
      );
      activeScene.playAnimationFor("david", "StandingUp_David", THREE.LoopOnce);

      const lexaCharacter = activeScene.survivorsMap.get("lexa");
      if (lexaCharacter && lexaCharacter.model) {
        lexaCharacter.model.rotation.y = -Math.PI / 2;
      }

      activeScene.playAnimationFor("lexa", "Pointing", THREE.LoopRepeat);

      setTimeout(() => {
        audioManager.playSFX("/audio/sfx/door_reveal.mp3", 1);
        activeScene.showDoor();
        uiManager.updateObjective(4, OBJECTIVES[4], totalLevels);
        currentLevel = 4;
        uiActionInProgress = false;
      }, 3000);
    } else {
      runBadEnding(
        ENDINGS.LOLLIPOP_WRONG.title,
        ENDINGS.LOLLIPOP_WRONG.subtitle
      );
    }
    return;
  }

  // --- Lvl 4 Door ---
  if (type === "door") {
    if (choice === 2) return; // Player remained silent

    if (dialogueKey === "axton") {
      // RIGHT CHOICE
      const newText = "Unlocked.";
      const newColor = "rgba(50, 255, 50, 1.0)";

      activeScene.updateDoorSign(newText, newColor);
      audioManager.playSFX("/audio/sfx/door_unlock.mp3", 1);

      uiActionInProgress = true;
      setTimeout(() => {
        try {
          uiManager.updateObjective(5, OBJECTIVES[5], totalLevels);
          currentLevel = 5;
        } catch (e) {
          console.error("Error updating to Level 5:", e);
        } finally {
          uiActionInProgress = false;
        }
      }, GAME_SETTINGS.OBJECTIVE_UPDATE_DELAY);
    } else {
      runBadEnding(ENDINGS.DOOR_WRONG.title, ENDINGS.DOOR_WRONG.subtitle);
    }
    return;
  }

  // --- Lvl 5 Carry ---
  if (type === "carry") {
    if (dialogueKey === "maya" && choice === 1) {
      runBadEnding(ENDINGS.CARRY_WRONG.title, ENDINGS.CARRY_WRONG.subtitle);
      return;
    }

    if (choice === 2) return; // Nevermind

    if (dialogueKey === "david") {
      // FINALE
      runGoodEnding(
        ENDINGS.DEMO_COMPLETE.title,
        ENDINGS.DEMO_COMPLETE.subtitle
      );
    } else {
      runBadEnding(ENDINGS.CARRY_WRONG.title, ENDINGS.CARRY_WRONG.subtitle);
    }
    return;
  }
}

function runBadEnding(title, subtitle) {
  audioManager.playSFX("/audio/sfx/game_over_fail.mp3", 0.8);
  gameInProgress = false;
  moveForward = false;
  moveBackward = false;
  moveLeft = false;
  moveRight = false;
  uiManager.showEnding(title, subtitle);
  controls.unlock();
}

function runGoodEnding(title, subtitle) {
  audioManager.playSFX("/audio/sfx/game_over_win.mp3", 0.8);
  gameInProgress = false;
  moveForward = false;
  moveBackward = false;
  moveLeft = false;
  moveRight = false;
  uiManager.showEnding(title, subtitle);
  controls.unlock();
}

function checkInteractions() {
  const choiceBox = document.getElementById("choice-box");
  const interactionPrompt = document.getElementById("interaction-prompt");
  if (
    choiceBox.classList.contains("active") ||
    !gameInProgress ||
    uiActionInProgress
  ) {
    interactionPrompt.classList.remove("active");
    currentInteractable = null;
    return;
  }

  if (!activeScene || !activeScene.getSurvivors) {
    return;
  }
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

  const survivorsList = activeScene.getSurvivors();
  if (!survivorsList || survivorsList.length === 0) {
    return;
  }

  let foundInteractable = null;
  let closestDistance = PLAYER_SETTINGS.INTERACTION_DISTANCE;

  for (const entity of survivorsList) {
    if (!entity.userData.isInteractable) {
      continue;
    }

    survivorBBox.setFromObject(entity);

    if (raycaster.ray.intersectBox(survivorBBox, intersectionPoint)) {
      const distance = intersectionPoint.distanceTo(camera.position);

      if (distance < closestDistance) {
        closestDistance = distance;
        foundInteractable = entity;
      }
    }
  }

  if (foundInteractable) {
    currentInteractable = foundInteractable;
    interactionPrompt.classList.add("active");
  } else {
    currentInteractable = null;
    interactionPrompt.classList.remove("active");
  }
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (activeScene && activeScene.update) {
    activeScene.update(delta);
  }

  const isMoving = moveForward || moveBackward || moveLeft || moveRight;
  audioManager.manageFootstepAudio(isMoving);

  if (controls.isLocked) {
    // Display coordinates
    // console.log(camera.position);

    velocity.x -= velocity.x * PLAYER_SETTINGS.MOVEMENT_DAMPING * delta;
    velocity.z -= velocity.z * PLAYER_SETTINGS.MOVEMENT_DAMPING * delta;

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    if (moveForward || moveBackward)
      velocity.z -= direction.z * player.speed * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * player.speed * delta;

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    if (camera.position.z < WORLD_BOUNDS.MIN_Z) {
      camera.position.z = WORLD_BOUNDS.MIN_Z;
    } else if (camera.position.z > WORLD_BOUNDS.MAX_Z) {
      camera.position.z = WORLD_BOUNDS.MAX_Z;
    }

    if (camera.position.x < WORLD_BOUNDS.MIN_X) {
      camera.position.x = WORLD_BOUNDS.MIN_X;
    } else if (camera.position.x > WORLD_BOUNDS.MAX_X) {
      camera.position.x = WORLD_BOUNDS.MAX_X;
    }
    checkInteractions();
  }

  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

