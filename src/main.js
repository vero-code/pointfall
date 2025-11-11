import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { CrashedMetro } from './scenes/CrashedMetro.js';
import { DIALOGUES, OBJECTIVES } from './data/dialogues.js';
import { ENDINGS } from './data/text.js';
import { GAME_SETTINGS, PLAYER_SETTINGS, STARTING_STATE, SCENE_SETTINGS } from './config.js';
import './style.css';

// Game state
let scene, camera, renderer, controls;
const clock = new THREE.Clock();
let activeScene;
let currentScene = 'crashed';
let player = { height: PLAYER_SETTINGS.HEIGHT, speed: PLAYER_SETTINGS.SPEED };
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let currentInteractable = null;
let raycaster = new THREE.Raycaster();
const textureLoader = new THREE.TextureLoader();

let currentLevel = STARTING_STATE.LEVEL;
const totalLevels = GAME_SETTINGS.TOTAL_LEVELS;
let playerInventory = { ...STARTING_STATE.INVENTORY };
let gameInProgress = true;
let uiActionInProgress = false;

// UI Elements
const dialogueBox = document.getElementById('dialogue-box');
const dialogueSpeaker = document.getElementById('dialogue-speaker');
const dialogueText = document.getElementById('dialogue-text');
const interactionPrompt = document.getElementById('interaction-prompt');
const pauseMenu = document.getElementById('pause-menu');
const resumeButton = document.getElementById('resume-button');
const restartButton = document.getElementById('restart-button');
const crosshair = document.getElementById('crosshair');
const inventoryItemsEl = document.getElementById('inventory-items');

const choiceBox = document.getElementById('choice-box');
const choiceSpeaker = document.getElementById('choice-speaker');
const choicePrompt = document.getElementById('choice-prompt');
const choiceBtn1 = document.getElementById('choice-btn-1');
const choiceBtn2 = document.getElementById('choice-btn-2');

const endScreen = document.getElementById('end-screen');
const endTitle = document.getElementById('end-title');
const endSubtitle = document.getElementById('end-subtitle');
const restartButtonEnd = document.getElementById('restart-button-end');

const levelEl = document.getElementById('level');
const objectiveTextEl = document.getElementById('objective-text');
const startScreen = document.getElementById('start-screen');
const startButton = startScreen.querySelector('.start-button');

// Initialize
init();
animate();

// Update Level and Objective
function updateObjective(level, text = null) {
  if (level > totalLevels) level = totalLevels;
  currentLevel = level;

  const newText = text || OBJECTIVES[level] || `Objective ${level}???`;
  
  if (levelEl) {
    levelEl.textContent = `${currentLevel} / ${totalLevels}`;
  }
  if (objectiveTextEl) {
    objectiveTextEl.innerHTML = newText;
  }
}

function updateInventoryUI() {
  if (!inventoryItemsEl) return;
  inventoryItemsEl.innerHTML = '';
  let itemsFound = false;
  
  if (playerInventory.water > 0) {
    inventoryItemsEl.innerHTML += `
      <div class="item">
        <span class="item-icon">💧</span>
        <span class="item-name">Water Bottle (1)</span>
      </div>
    `;
    itemsFound = true;
  }
  if (playerInventory.lollipop > 0) {
    inventoryItemsEl.innerHTML += `
      <div class="item">
        <span class="item-icon">🍭</span>
        <span class="item-name">Lollipop (1)</span>
      </div>
    `;
    itemsFound = true;
  }

  if (!itemsFound) {
    inventoryItemsEl.innerHTML += `
      <div class="item">
        <span class="item-name">(empty)</span>
      </div>
    `;
  }
}

function init() {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.Fog(SCENE_SETTINGS.FOG_COLOR, SCENE_SETTINGS.FOG_NEAR, SCENE_SETTINGS.FOG_FAR);
  
  // Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(SCENE_SETTINGS.STARTING_POSITION.x, SCENE_SETTINGS.STARTING_POSITION.y, SCENE_SETTINGS.STARTING_POSITION.z);
  scene.add(camera);
  
  // Renderer
  renderer = new THREE.WebGLRenderer({ 
    canvas: document.querySelector('#game-canvas'),
    antialias: true 
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  
  // Controls
  controls = new PointerLockControls(camera, document.body);

  // Pause menu
  controls.addEventListener('unlock', () => {
    if (gameInProgress && !uiActionInProgress) {
      pauseMenu.classList.remove('hidden');
      crosshair.classList.add('hidden');
    }
    uiActionInProgress = false;
  });

  controls.addEventListener('lock', () => {
    pauseMenu.classList.add('hidden');
    crosshair.classList.remove('hidden');
  });

  // Uncomment -> Show start screen
  //startScreen.classList.remove('hidden');

  // Uncomment -> Click on "Start" button
  // startButton.addEventListener('click', () => {
  //   startScreen.classList.add('hidden');
  //   controls.lock();
  // });

  // Comment out -> Click to lock (if out of focus)
  renderer.domElement.addEventListener('click', () => {
    if (gameInProgress && !controls.isLocked && startScreen.classList.contains('hidden')) {
      controls.lock();
    }
  });

  // Load initial scene
  loadCrashedScene();
  
  // Input
  setupInput();
  
  // Window resize
  window.addEventListener('resize', onWindowResize);

  updateInventoryUI();
  updateObjective(STARTING_STATE.LEVEL);

  // setupDebugControls();
}

function loadCrashedScene() {
  clearScene();
  currentScene = 'crashed';
  scene.fog = new THREE.Fog(SCENE_SETTINGS.FOG_COLOR, SCENE_SETTINGS.FOG_NEAR, SCENE_SETTINGS.FOG_FAR);
  scene.background = new THREE.Color(0x000000);
  const crashedMetro = new CrashedMetro(scene, textureLoader);
  crashedMetro.create();
  activeScene = crashedMetro;
  camera.position.set(SCENE_SETTINGS.STARTING_POSITION.x, SCENE_SETTINGS.STARTING_POSITION.y, SCENE_SETTINGS.STARTING_POSITION.z);
}

function clearScene() {
  const objectsToRemove = [];
  scene.children.forEach(child => {
    if (child !== camera) {
      objectsToRemove.push(child);
    }
  });
  
  objectsToRemove.forEach(object => {
    if (object.geometry) object.geometry.dispose();
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach(mat => mat.dispose());
      } else {
        object.material.dispose();
      }
    }
    scene.remove(object);
  });
}

function setupInput() {
  document.addEventListener('keydown', (e) => {
    // Prevent movement if the choice box is open or the game is over
    if (choiceBox.classList.contains('active') || !gameInProgress) {
      moveForward = false;
      moveBackward = false;
      moveLeft = false;
      moveRight = false;
      return; 
    }

    switch(e.code) {
      case 'KeyW': moveForward = true; break;
      case 'KeyS': moveBackward = true; break;
      case 'KeyA': moveLeft = true; break;
      case 'KeyD': moveRight = true; break;
      case 'KeyE': 
        if (currentInteractable) {
          interact(currentInteractable);
        }
        break;
    }
  });
  
  document.addEventListener('keyup', (e) => {
    switch(e.code) {
      case 'KeyW': moveForward = false; break;
      case 'KeyS': moveBackward = false; break;
      case 'KeyA': moveLeft = false; break;
      case 'KeyD': moveRight = false; break;
    }
  });
  
  // Close dialogue
  dialogueBox.addEventListener('click', () => {
    dialogueBox.classList.remove('active');
  });

  // Resume button
  resumeButton.addEventListener('click', () => {
    controls.lock();
  });

  // Restart button (from pause)
  restartButton.addEventListener('click', () => {
    location.reload();
  });

  // Restart button (from end screen)
  restartButtonEnd.addEventListener('click', () => {
    location.reload();
  });
}

function setupDebugControls() {
  let autoTransition = false;
  
  const loadNormalBtn = document.getElementById('load-normal');
  const loadCrashedBtn = document.getElementById('load-crashed');
  const toggleAutoBtn = document.getElementById('toggle-auto');
  
  if (loadNormalBtn) {
    loadNormalBtn.addEventListener('click', () => {
      loadNormalScene();
      if (controls.isLocked === false) {
        controls.lock();
      }
    });
  }
  
  if (loadCrashedBtn) {
    loadCrashedBtn.addEventListener('click', () => {
      loadCrashedScene();
      if (controls.isLocked === false) {
        controls.lock();
      }
    });
  }
  
  if (toggleAutoBtn) {
    toggleAutoBtn.textContent = 'Auto: OFF';
    toggleAutoBtn.classList.add('off');
    
    toggleAutoBtn.addEventListener('click', () => {
      autoTransition = !autoTransition;
      toggleAutoBtn.textContent = `Auto: ${autoTransition ? 'ON' : 'OFF'}`;
      toggleAutoBtn.classList.toggle('off', !autoTransition);
    });
  }
  
  // Expose to animate function
  window.autoTransition = autoTransition;
  
  // Update getter
  Object.defineProperty(window, 'autoTransition', {
    get: () => autoTransition,
    set: (val) => autoTransition = val
  });
}

function interact(object) {
  if (!gameInProgress || uiActionInProgress) return;
  dialogueBox.classList.remove('active');

  const dialogueKey = object.userData.dialogue;
  if (!dialogueKey) return;

  const dialogueSet = DIALOGUES[currentScene];
  if (!dialogueSet) return;
  
  const dialogue = dialogueSet[dialogueKey];
  if (!dialogue) return;

  uiActionInProgress = true;
  controls.unlock();
  crosshair.classList.add('hidden');
  choiceBtn2.classList.remove('hidden');
  
  // Lvl 1 Clue
  if (currentLevel === 1 && dialogueKey === 'david' && dialogue.text_lvl1) {
    choiceSpeaker.textContent = dialogue.name;
    choicePrompt.textContent = dialogue.text_lvl1;
    choiceBtn1.textContent = dialogue.choice1_lvl1;
    choiceBtn2.classList.add('hidden');
    
    choiceBtn1.onclick = () => handleChoice('david_quest', dialogueKey, 1);
    choiceBtn2.onclick = null;
    
    choiceBox.classList.add('active');
    return;
  }

  // Lvl 2 Water
  if (currentLevel === 2 && playerInventory.water > 0 && dialogue.water_prompt) {
    choiceSpeaker.textContent = dialogue.name;
    choicePrompt.textContent = dialogue.water_prompt;
    choiceBtn1.textContent = dialogue.water_choice1;
    choiceBtn2.textContent = dialogue.water_choice2;

    choiceBtn1.onclick = () => handleChoice('water', dialogueKey, 1);
    choiceBtn2.onclick = () => handleChoice('water', dialogueKey, 2);
    
    choiceBox.classList.add('active');
    return;
  }

  // Lvl 3 Lollipop
  if (currentLevel === 3 && playerInventory.lollipop > 0 && dialogue.lollipop_prompt) {
    choiceSpeaker.textContent = dialogue.name;
    choicePrompt.textContent = dialogue.lollipop_prompt;
    choiceBtn1.textContent = dialogue.lollipop_choice1;
    choiceBtn2.textContent = dialogue.lollipop_choice2;

    choiceBtn1.onclick = () => handleChoice('lollipop', dialogueKey, 1);
    choiceBtn2.onclick = () => handleChoice('lollipop', dialogueKey, 2);
    
    choiceBox.classList.add('active');
    return;
  }
  
  // Lvl 4 Door
  if (currentLevel === 4 && dialogue.door_prompt) {
    choiceSpeaker.textContent = dialogue.name;
    choicePrompt.textContent = dialogue.door_prompt;
    choiceBtn1.textContent = dialogue.door_choice1;
    choiceBtn2.textContent = dialogue.door_choice2;

    choiceBtn1.onclick = () => handleChoice('door', dialogueKey, 1);
    choiceBtn2.onclick = () => handleChoice('door', dialogueKey, 2);
    
    choiceBox.classList.add('active');
    return;
  }

  // Lvl 5 Carry
  if (currentLevel === 5 && dialogue.carry_prompt) {
    choiceSpeaker.textContent = dialogue.name;
    choicePrompt.textContent = dialogue.carry_prompt;
    choiceBtn1.textContent = dialogue.carry_choice1;
    choiceBtn2.textContent = dialogue.carry_choice2;

    choiceBtn1.onclick = () => handleChoice('carry', dialogueKey, 1);
    choiceBtn2.onclick = () => handleChoice('carry', dialogueKey, 2);
    
    choiceBox.classList.add('active');
    return;
  }
  
  // 6. DEFAULT DIALOGUE (if no choices apply)
  uiActionInProgress = false; 
  controls.lock(); 
  crosshair.classList.remove('hidden');

  dialogueSpeaker.textContent = dialogue.name;
  
  let textToShow = dialogue.text;
  if (currentLevel === 1 && dialogue.text_lvl1 && dialogueKey !== 'david') {
      textToShow = dialogue.text_lvl1;
  }
  
  dialogueText.textContent = textToShow || "(The character is silent)";
  dialogueBox.classList.add('active');
}

function handleChoice(type, dialogueKey, choice) {
  choiceBox.classList.remove('active');
  crosshair.classList.remove('hidden');
  controls.lock();

  // --- Lvl 1 Clue ---
  if (type === 'david_quest') {
    if (choice === 1) {
      playerInventory.water = 1;
      updateInventoryUI();
      updateObjective(2); // Go to Level 2
    }
    return;
  }

  // --- Lvl 2 Water ---
  if (type === 'water') {
    if (choice === 2) return; // Player saved the water
    
    playerInventory.water = 0;
    updateInventoryUI();

    if (dialogueKey === 'martha') {
      // RIGHT CHOICE
      uiActionInProgress = true;
      playerInventory.lollipop = 1; // Get lollipop
      setTimeout(() => {
        updateInventoryUI();
        updateObjective(3); // Go to Level 3
        uiActionInProgress = false;
      }, GAME_SETTINGS.OBJECTIVE_UPDATE_DELAY);
    } else {
      runBadEnding(ENDINGS.WATER_WRONG.title, ENDINGS.WATER_WRONG.subtitle);
    }
    return;
  }

  // --- Lvl 3 Lollipop ---
  if (type === 'lollipop') {
    if (choice === 2) return; // Saved the lollipop

    playerInventory.lollipop = 0;
    updateInventoryUI();

    if (dialogueKey === 'axton') {
      // RIGHT CHOICE
      uiActionInProgress = true;
      setTimeout(() => {
        updateObjective(4); // Go to Level 4
        uiActionInProgress = false;
      }, GAME_SETTINGS.OBJECTIVE_UPDATE_DELAY);
    } else {
      runBadEnding(ENDINGS.LOLLIPOP_WRONG.title, ENDINGS.LOLLIPOP_WRONG.subtitle);
    }
    return;
  }

  // --- Lvl 4 Door ---
  if (type === 'door') {
    if (choice === 2) return; // Player remained silent

    if (dialogueKey === 'axton') {
      // RIGHT CHOICE
      uiActionInProgress = true;
      setTimeout(() => {
        updateObjective(5); // Go to Level 5
        uiActionInProgress = false;
      }, GAME_SETTINGS.OBJECTIVE_UPDATE_DELAY);
    } else {
      runBadEnding(ENDINGS.DOOR_WRONG.title, ENDINGS.DOOR_WRONG.subtitle);
    }
    return;
  }
  
  // --- Lvl 5 Carry ---
  if (type === 'carry') {
    if (dialogueKey === 'maya') {
      if (choice === 1) {
        runBadEnding(ENDINGS.CARRY_WRONG.title, ENDINGS.CARRY_WRONG.subtitle);
      }
      return;
    }
    
    // Other characters
    if (choice === 2) return;
   
    if (dialogueKey === 'david') {
      // FINALE
      runGoodEnding(ENDINGS.DEMO_COMPLETE.title, ENDINGS.DEMO_COMPLETE.subtitle);
    } else {
      runBadEnding(ENDINGS.CARRY_WRONG.title, ENDINGS.CARRY_WRONG.subtitle);
    }
    return;
  }
}

function runBadEnding(title, subtitle) {
  console.log("Bad Ending!");
  gameInProgress = false;
  moveForward = false;
  moveBackward = false;
  moveLeft = false;
  moveRight = false;

  endTitle.textContent = title;
  endSubtitle.textContent = subtitle;
  
  endScreen.classList.remove('hidden');
  crosshair.classList.add('hidden');
  controls.unlock();
}

function runGoodEnding(title, subtitle) {
  console.log("Good Ending!");
  gameInProgress = false;
  moveForward = false;
  moveBackward = false;
  moveLeft = false;
  moveRight = false;
  
  endTitle.textContent = title;
  endSubtitle.textContent = subtitle;
  
  endScreen.classList.remove('hidden');
  crosshair.classList.add('hidden');
  controls.unlock();
}

function checkInteractions() {
  // Don't show the [E] prompt if a choice is open or the game is over
  if (choiceBox.classList.contains('active') || !gameInProgress || uiActionInProgress) {
    interactionPrompt.classList.remove('active');
    currentInteractable = null;
    return;
  }
  
  if (!activeScene || !activeScene.getSurvivors) { return; }
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  
  const survivorsList = activeScene.getSurvivors();
  if (!survivorsList || survivorsList.length === 0) {
    return;
  }

  const intersects = raycaster.intersectObjects(survivorsList, true);
  let foundInteractable = null;

  if (intersects.length > 0 && intersects[0].distance < PLAYER_SETTINGS.INTERACTION_DISTANCE) {
    let object = intersects[0].object;
    while (object) {
      if (object.userData.isInteractable) {
        foundInteractable = object;
        break; 
      }
      object = object.parent;
    }
  }

  if (foundInteractable) {
    currentInteractable = foundInteractable;
    interactionPrompt.classList.add('active');
  } else {
    currentInteractable = null;
    interactionPrompt.classList.remove('active');
  }
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (activeScene && activeScene.update) {
    activeScene.update(delta);
  }
  
  if (controls.isLocked) {
    velocity.x -= velocity.x * PLAYER_SETTINGS.MOVEMENT_DAMPING * delta;
    velocity.z -= velocity.z * PLAYER_SETTINGS.MOVEMENT_DAMPING * delta;
    
    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();
    
    if (moveForward || moveBackward) velocity.z -= direction.z * player.speed * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * player.speed * delta;
    
    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);
    
    checkInteractions();
  }
  
  renderer.render(scene, camera);
}

function transitionToCrashed() {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: black;
    z-index: 10000;
    opacity: 0;
    transition: opacity 2s;
    pointer-events: none;
  `;
  document.body.appendChild(overlay);
  
  setTimeout(() => overlay.style.opacity = '1', 50);
  
  setTimeout(() => {
    loadCrashedScene();
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 2000);
  }, 2000);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}