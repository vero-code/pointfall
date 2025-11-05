// src/main.js
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import './style.css';

// Dialogue data
const DIALOGUES = {
  axton: {
    name: "AXTON",
    text: "Something broke through the tunnel ceiling. A massive drill. Cut our car loose. We fell... I don't know how far."
  },
  martha: {
    name: "MARTHA", 
    text: "Oh dear... Harold, are you hurt? We need to stay calm..."
  },
  gladwin: {
    name: "GLADWIN",
    text: "I'm okay, Martha. We'll get through this together."
  },
  david: {
    name: "DAVID",
    text: "VOLT! Can you hear me? Please be okay, buddy..."
  },
  maya: {
    name: "MAYA",
    text: "My leg... it's stuck. I can't move it. Can someone help?"
  }
};

// Game state
let scene, camera, renderer, controls;
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
  
  // Click to start
  document.querySelector('.start-button').addEventListener('click', () => {
    controls.lock();
    document.getElementById('start-screen').classList.add('hidden');
  });
  
  // Create scene
  createCrashedMetro();
  createSurvivors();
  
  // Input
  setupInput();
  
  // Window resize
  window.addEventListener('resize', onWindowResize);
}

function createCrashedMetro() {
  // --- Load textures ---
  const floorTexture = textureLoader.load('/textures/floor.jpg');
  const wallTexture = textureLoader.load('/textures/wall.jpg');

  // Repeat texture
  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  // (4m wide, 12m long)
  floorTexture.repeat.set(2, 6);

  wallTexture.wrapS = THREE.RepeatWrapping;
  wallTexture.wrapT = THREE.RepeatWrapping;
  wallTexture.repeat.set(4, 1);

  // Floor
  const floorGeometry = new THREE.PlaneGeometry(4, 12);
  const floorMaterial = new THREE.MeshStandardMaterial({ 
    map: floorTexture,
    roughness: 0.8,
    metalness: 0.2 
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Ceiling
  const ceiling = new THREE.Mesh(floorGeometry, floorMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 3;
  scene.add(ceiling);
  
  // Walls
  const wallMaterial = new THREE.MeshStandardMaterial({ 
    map: wallTexture,
    roughness: 0.9 
  });
  
  // Left wall
  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 3, 12),
    wallMaterial
  );
  leftWall.position.set(-2, 1.5, 0);
  scene.add(leftWall);
  
  // Right wall
  const rightWall = leftWall.clone();
  rightWall.position.set(2, 1.5, 0);
  scene.add(rightWall);
  
  // Back wall
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(4, 3, 0.1),
    wallMaterial
  );
  backWall.position.set(0, 1.5, -6);
  scene.add(backWall);

  // Front wall
  const frontWall = backWall.clone();
  frontWall.position.z = 6;
  scene.add(frontWall);
  
  // Debris
  for (let i = 0; i < 10; i++) {
    const debris = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.1, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x3a3a3a })
    );
    debris.position.set(
      (Math.random() - 0.5) * 3,
      0.05,
      (Math.random() - 0.5) * 10
    );
    debris.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    scene.add(debris);
  }
  
  // Emergency light (flickering)
  const light = new THREE.PointLight(0x00ff00, 0.5, 10);
  light.position.set(0, 2.5, 0);
  scene.add(light);

  light.intensity = 0.4;
  
  // Flicker effect
  // setInterval(() => {
  //   light.intensity = Math.random() > 0.3 ? 0.5 : 0.1;
  // }, 100);
  
  // Ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);
}

function createSurvivors() {
  const survivors = [
    { name: 'axton', pos: [-1.5, 0.8, -2], color: 0x4a90e2 },
    { name: 'martha', pos: [-1.2, 0.5, -4], color: 0xe24a4a },
    { name: 'gladwin', pos: [-0.8, 0.5, -4], color: 0x8a8a8a },
    { name: 'david', pos: [1, 0.8, -3], color: 0x6a4a8a },
    { name: 'maya', pos: [1.5, 0.5, 1], color: 0x4ae2a8 }
  ];
  
  survivors.forEach(data => {
    // Simple capsule for survivor
    const geometry = new THREE.CapsuleGeometry(0.3, 0.8, 4, 8);
    const material = new THREE.MeshStandardMaterial({ color: data.color });
    const survivor = new THREE.Mesh(geometry, material);
    survivor.position.set(...data.pos);
    survivor.userData.dialogue = data.name;
    survivor.userData.isInteractable = true;
    scene.add(survivor);
    interactables.push(survivor);
  });
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

function interact(object) {
  const dialogueKey = object.userData.dialogue;
  const dialogue = DIALOGUES[dialogueKey];
  
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
    const delta = 0.016; // ~60fps
    
    // Movement
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    
    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();
    
    if (moveForward || moveBackward) velocity.z -= direction.z * player.speed * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * player.speed * delta;
    
    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);
    
    // Check interactions
    checkInteractions();
  }
  
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}