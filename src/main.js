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
let currentScene = 'normal';
let sceneTimer = 0;
const SCENE_DURATION = 30;
let player = { height: 1.6, speed: 9 };
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let currentInteractable = null;
let raycaster = new THREE.Raycaster();
const textureLoader = new THREE.TextureLoader();

let playerInventory = { water: 1 };
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

// Initialize
init();
animate();

function updateInventoryUI() {
  if (!inventoryItemsEl) return;
  inventoryItemsEl.innerHTML = '';
  
  if (playerInventory.water > 0) {
    inventoryItemsEl.innerHTML += `
      <div class="item">
        <span class="item-icon">💧</span>
        <span class="item-name">Water Bottle (1)</span>
      </div>
    `;
  } else {
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

  // Click to start
  // document.querySelector('.start-button').addEventListener('click', () => {
  //   controls.lock();
  //   document.getElementById('start-screen').classList.add('hidden');
  // });

  // Off start menu
  renderer.domElement.addEventListener('click', () => {
    if (gameInProgress && !controls.isLocked) {
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
  const dialogueSet = DIALOGUES[currentScene];
  if (!dialogueSet) return;
  
  const dialogue = dialogueSet[dialogueKey];
  if (!dialogue) return;
  
  // If the character has a CHOICE and we have WATER
  if (dialogue.prompt && playerInventory.water > 0) {
    uiActionInProgress = true;
    controls.unlock();

    choiceSpeaker.textContent = dialogue.name;
    choicePrompt.textContent = dialogue.prompt;
    choiceBtn1.textContent = dialogue.choice1;
    choiceBtn2.textContent = dialogue.choice2;

    choiceBtn1.onclick = () => handleChoice(dialogueKey, 1);
    choiceBtn2.onclick = () => handleChoice(dialogueKey, 2);
    
    choiceBox.classList.add('active');
    crosshair.classList.add('hidden');
    
  } else if (dialogue.text) {
    dialogueSpeaker.textContent = dialogue.name;
    dialogueText.textContent = playerInventory.water > 0 ? dialogue.text : (dialogue.text_no_water || dialogue.text);
    dialogueBox.classList.add('active');
  }
}

function handleChoice(dialogueKey, choice) {
  choiceBox.classList.remove('active');
  crosshair.classList.remove('hidden');
  controls.lock();

  if (choice === 2) {
    console.log("Player saved water.");
    return; 
  }

  // --- Player chose [1] Give water ---
  playerInventory.water = 0;
  updateInventoryUI();
  console.log("Water used.");

  if (dialogueKey === 'martha') {
    runGoodEnding();
  } else {
    runBadEnding(dialogueKey);
  }
}

function runBadEnding(person) {
  console.log(`Bad Ending: Gave water to ${person}`);
  gameInProgress = false;
  moveForward = false;
  moveBackward = false;
  moveLeft = false;
  moveRight = false;

  endTitle.textContent = "Sometimes, good intentions aren't enough.";
  endSubtitle.textContent = "P.S. You gave the bottle to the wrong person.";
  
  endScreen.classList.remove('hidden');
  crosshair.classList.add('hidden');
  controls.unlock();
}

function runGoodEnding() {
  console.log("Good Ending!");
  gameInProgress = false;
  moveForward = false;
  moveBackward = false;
  moveLeft = false;
  moveRight = false;
  
  // TODO: Start Martha's animation
  
  endTitle.textContent = "The right choice saved a life.";
  endSubtitle.textContent = "The child will live.";
  
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
    console.error("ERROR: activeScene or getSurvivors() not found!");
    return;
  }
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  
  const survivorsList = activeScene.getSurvivors();
  if (survivorsList.length === 0) {
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