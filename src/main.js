import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { NormalMetro } from './scenes/NormalMetro.js';
import { CrashedMetro } from './scenes/CrashedMetro.js';
import { DIALOGUES } from './data/dialogues.js';
import './style.css';

// Game state
let scene, camera, renderer, controls;
let currentScene = 'normal';
let sceneTimer = 0;
const SCENE_DURATION = 30;
let player = { height: 1.6, speed: 5 };
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let interactables = [];
let currentInteractable = null;
let raycaster = new THREE.Raycaster();
const textureLoader = new THREE.TextureLoader();

// UI Elements
const dialogueBox = document.getElementById('dialogue-box');
const dialogueSpeaker = document.getElementById('dialogue-speaker');
const dialogueText = document.getElementById('dialogue-text');
const interactionPrompt = document.getElementById('interaction-prompt');
const pauseMenu = document.getElementById('pause-menu');
const resumeButton = document.getElementById('resume-button');
const restartButton = document.getElementById('restart-button');
const crosshair = document.getElementById('crosshair');

// Initialize
init();
animate();

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
    pauseMenu.classList.remove('hidden');
    crosshair.classList.add('hidden');
  });

  controls.addEventListener('lock', () => {
    pauseMenu.classList.add('hidden');
    crosshair.classList.remove('hidden');
  });

  renderer.domElement.addEventListener('click', () => {
    controls.lock();
  });

  // Load initial scene
  loadNormalScene();
  
  // Input
  setupInput();
  
  // Window resize
  window.addEventListener('resize', onWindowResize);

  setupDebugControls();
}

function loadNormalScene() {
  clearScene();
  currentScene = 'normal';
  sceneTimer = 0;
  
  const normalMetro = new NormalMetro(scene, textureLoader);
  normalMetro.create();
  interactables = normalMetro.getSurvivors();
  
  camera.position.set(0, player.height, 5);
}

function loadCrashedScene() {
  clearScene();
  currentScene = 'crashed';
  
  scene.fog = new THREE.Fog(0x0a0a0a, 1, 15);
  scene.background = new THREE.Color(0x000000);
  
  const crashedMetro = new CrashedMetro(scene, textureLoader);
  crashedMetro.create();
  interactables = crashedMetro.getSurvivors();
  
  camera.position.set(0, player.height * 0.5, 5);
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
  
  interactables = [];
}

function setupInput() {
  document.addEventListener('keydown', (e) => {
    switch(e.code) {
      case 'KeyW': moveForward = true; break;
      case 'KeyS': moveBackward = true; break;
      case 'KeyA': moveLeft = true; break;
      case 'KeyD': moveRight = true; break;
      case 'KeyE': 
        if (currentInteractable) interact(currentInteractable);
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

  // Restart button
  restartButton.addEventListener('click', () => {
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
  const dialogueKey = object.userData.dialogue;
  const dialogueSet = currentScene === 'normal' ? DIALOGUES.normal : DIALOGUES.crashed;
  const dialogue = dialogueSet[dialogueKey];
  
  if (dialogue) {
    dialogueSpeaker.textContent = dialogue.name;
    dialogueText.textContent = dialogue.text;
    dialogueBox.classList.add('active');
  }
}

function checkInteractions() {
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const intersects = raycaster.intersectObjects(interactables);
  
  if (intersects.length > 0 && intersects[0].distance < 2) {
    currentInteractable = intersects[0].object;
    interactionPrompt.classList.add('active');
  } else {
    currentInteractable = null;
    interactionPrompt.classList.remove('active');
  }
}

function animate() {
  requestAnimationFrame(animate);
  
  if (controls.isLocked) {
    const delta = 0.016;

    if (currentScene === 'normal' && window.autoTransition) {
      sceneTimer += delta;
      if (sceneTimer >= SCENE_DURATION) {
        transitionToCrashed();
        return;
      }
    }
    
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    
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