import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { NormalMetro } from './scenes/NormalMetro.js';
import { CrashedMetro } from './scenes/CrashedMetro.js';
import { DIALOGUES } from './data/dialogues.js';
import './style.css';

// Game state
let scene, camera, renderer, controls;
const clock = new THREE.Clock();
let activeScene;
let currentScene = 'crashed';
let sceneTimer = 0;
const SCENE_DURATION = 30;
let player = { height: 1.6, speed: 9 };
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let currentInteractable = null;
let raycaster = new THREE.Raycaster();
const textureLoader = new THREE.TextureLoader();

let currentLevel = 1;
const totalLevels = 5;
let playerInventory = { water: 1, lollipop: 0 };
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
function updateObjective(level, text) {
  if (level > totalLevels) level = totalLevels;
  currentLevel = level;
  
  if (levelEl) {
    levelEl.textContent = `${currentLevel} / ${totalLevels}`;
  }
  if (objectiveTextEl) {
    objectiveTextEl.innerHTML = text;
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
        <span class="item-name">(Empty)</span>
      </div>
    `;
  }
}

function init() {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.Fog(0x0a0a0a, 1, 15);
  
  // Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, player.height, 5);
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
  updateObjective(1, "Talk to survivors");

  // setupDebugControls();
}

function loadNormalScene() {
  clearScene();
  currentScene = 'normal';
  sceneTimer = 0;
  const normalMetro = new NormalMetro(scene, textureLoader);
  normalMetro.create();
  normalMetro.update = (delta) => {}; 
  activeScene = normalMetro;
  camera.position.set(0, player.height, 5);
}

function loadCrashedScene() {
  clearScene();
  currentScene = 'crashed';
  scene.fog = new THREE.Fog(0x0a0a0a, 1, 15);
  scene.background = new THREE.Color(0x000000);
  const crashedMetro = new CrashedMetro(scene, textureLoader);
  crashedMetro.create();
  activeScene = crashedMetro;
  camera.position.set(0, player.height, 5);
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
  if (!gameInProgress) return;
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
  choiceBtn2.classList.remove('hidden'); // Show 2nd button (just in case)
  
  // 1. LEVEL 1: David's Quest
  if (currentLevel === 1 && dialogueKey === 'david') {
    choiceSpeaker.textContent = dialogue.name;
    choicePrompt.textContent = dialogue.text_lvl1;
    choiceBtn1.textContent = dialogue.choice1_lvl1;
    choiceBtn2.classList.add('hidden'); // Hide second button
    
    choiceBtn1.onclick = () => handleChoice('david_quest', dialogueKey, 1);
    choiceBtn2.onclick = null;
    
    choiceBox.classList.add('active');
    return;
  }

  // 2. LEVEL 1-2: WATER Choice
  if (currentLevel <= 2 && playerInventory.water > 0 && dialogue.water_prompt) {
    choiceSpeaker.textContent = dialogue.name;
    choicePrompt.textContent = dialogue.water_prompt;
    choiceBtn1.textContent = dialogue.water_choice1;
    choiceBtn2.textContent = dialogue.water_choice2;

    choiceBtn1.onclick = () => handleChoice('water', dialogueKey, 1);
    choiceBtn2.onclick = () => handleChoice('water', dialogueKey, 2);
    
    choiceBox.classList.add('active');
    return;
  }

  // 3. LEVEL 3-4: LOLLIPOP Choice
  if (currentLevel >= 3 && playerInventory.lollipop > 0 && dialogue.lollipop_prompt) {
    choiceSpeaker.textContent = dialogue.name;
    choicePrompt.textContent = dialogue.lollipop_prompt;
    choiceBtn1.textContent = dialogue.lollipop_choice1;
    choiceBtn2.textContent = dialogue.lollipop_choice2;

    choiceBtn1.onclick = () => handleChoice('lollipop', dialogueKey, 1);
    choiceBtn2.onclick = () => handleChoice('lollipop', dialogueKey, 2);
    
    choiceBox.classList.add('active');
    return;
  }
  
  // 4. LEVEL 3-4: DOOR Choice (David only)
  if (currentLevel >= 3 && dialogueKey === 'david' && dialogue.door_prompt) {
    choiceSpeaker.textContent = dialogue.name;
    choicePrompt.textContent = dialogue.door_prompt;
    choiceBtn1.textContent = dialogue.door_choice1;
    choiceBtn2.textContent = dialogue.door_choice2;

    choiceBtn1.onclick = () => handleChoice('door', dialogueKey, 1);
    choiceBtn2.onclick = () => handleChoice('door', dialogueKey, 2);
    
    choiceBox.classList.add('active');
    return;
  }

  // 5. LEVEL 5: CARRY Maya Choice
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
  uiActionInProgress = false; // Not a UI action
  controls.lock(); // Give back control
  crosshair.classList.remove('hidden');

  dialogueSpeaker.textContent = dialogue.name;
  dialogueText.textContent = dialogue.text || "(The character is silent)";
  dialogueBox.classList.add('active');
}

function handleChoice(type, dialogueKey, choice) {
  choiceBox.classList.remove('active');
  crosshair.classList.remove('hidden');
  controls.lock();

  // --- DAVID'S QUEST Choice (Level 1 -> 2) ---
  if (type === 'david_quest') {
    if (choice === 1) {
      updateObjective(2, "Find the doctor");
    }
    return;
  }

  // --- WATER Choice (Level 2) ---
  if (type === 'water') {
    if (choice === 2) {
      console.log("Player saved water.");
      return; // Player does nothing
    }
    
    // Player gave water
    playerInventory.water = 0;
    updateInventoryUI();

    if (dialogueKey === 'martha') {
      // CORRECT CHOICE
      console.log("Correct: Gave water to MARTHA");
      // TODO: Trigger Martha's animation
      
      // Lollipop appears
      playerInventory.lollipop = 1;
      // Update UI and Objective
      setTimeout(() => {
        updateInventoryUI();
        updateObjective(3, "Share a lollipop <br>(Find a way to open the door)");
      }, 1000); // Give time to "discover" the lollipop

    } else {
      // WRONG CHOICE
      runBadEnding(
        "Sometimes, good intentions aren't enough.", 
        "P.S. You gave the bottle to the wrong person."
      );
    }
    return;
  }

  // --- DOOR Choice (Level 3-4, at David) ---
  if (type === 'door') {
    if (dialogueKey === 'david' && choice === 1) {
      // Ending: broke shoulder
      runBadEnding(
        "Force is not the answer", 
        "DAVID broke his shoulder, and you remained trapped."
      );
    }
    if (dialogueKey === 'david' && choice === 2) {
      // Correct: Look for electrician
      console.log("Correct: Look for electrician.");
      updateObjective(4, "Find the electrician and open the door");
    }
    return;
  }

  // --- LOLLIPOP Choice (Level 4) ---
  if (type === 'lollipop') {
    if (choice === 2) {
      console.log("Player saved lollipop.");
      return; // Player does nothing
    }

    // Player gave lollipop
    playerInventory.lollipop = 0;
    updateInventoryUI();

    if (dialogueKey === 'axton') {
      // CORRECT CHOICE
      console.log("Correct: Gave lollipop to AXTON");
      // TODO: Animate Axton going to the door
      
      // Update Objective
      setTimeout(() => {
        updateObjective(5, "Carry Maya");
      }, 1000); // Axton opens the door

    } else {
      // WRONG CHOICE (any other)
      runBadEnding(
        "Wrong choice", 
        "The lollipop wasn't for them. The exit remained closed."
      );
    }
    return;
  }

  // --- CARRY Maya Choice (Level 5) ---
  if (type === 'carry') {
    // 1. Choice on Maya herself
    if (dialogueKey === 'maya') {
      if (choice === 1) {
        // Ending: Twisted other leg
        runBadEnding(
          "Heavy burden", 
          "As soon as you and MAYA started walking, she twisted her other leg... and it was over."
        );
      }
      if (choice === 2) {
        console.log("Decided to find help");
        // Nothing happens, just close window
      }
      return;
    }
    
    // 2. Choice on other characters (Axton, Martha, Lexa, David)
    if (choice === 1) {
      // Ending: Leave alone
      runBadEnding("Selfish", "You left, leaving Maya and the others behind.");
    }
    if (choice === 2) {
      // Ask for help
      if (dialogueKey === 'david') {
        // CORRECT CHOICE (FINAL)
        runGoodEnding(
          "DEMO version is over.", 
          "Thanks for playing. vero-game."
        );
      } else {
        // Ending: wrong helper
        const helperName = dialogueKey.charAt(0).toUpperCase() + dialogueKey.slice(1);
        runBadEnding(
          "Wrong helper", 
          `${helperName} couldn't help. You lost too much time.`
        );
      }
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
  if (choiceBox.classList.contains('active') || !gameInProgress) {
    interactionPrompt.classList.remove('active');
    currentInteractable = null;
    return;
  }
  
  if (!activeScene || !activeScene.getSurvivors) {
    // console.error("ERROR: activeScene or getSurvivors() not found!");
    // This error can spam if the scene isn't loaded yet.
    return;
  }
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  
  const survivorsList = activeScene.getSurvivors();
  if (!survivorsList || survivorsList.length === 0) {
    return;
  }

  const intersects = raycaster.intersectObjects(survivorsList, true);
  let foundInteractable = null;

  if (intersects.length > 0 && intersects[0].distance < 2) {
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
    if (currentScene === 'normal' && window.autoTransition) {
      sceneTimer += delta;
      if (sceneTimer >= SCENE_DURATION) {
        transitionToCrashed();
        return;
      }
    }
    
    velocity.x -= velocity.x * 5.0 * delta;
    velocity.z -= velocity.z * 5.0 * delta;
    
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