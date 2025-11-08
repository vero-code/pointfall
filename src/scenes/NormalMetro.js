// src/scenes/NormalMetro.js
import * as THREE from 'three';
import { CharacterBuilder } from '../utils/CharacterBuilder.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class NormalMetro {
  constructor(scene, textureLoader) {
    this.scene = scene;
    this.textureLoader = textureLoader;
    this.survivors = [];
    this.gltfLoader = new GLTFLoader();
  }
  
  create() {
    this.createEnvironment();
    this.createSurvivors();
    this.createLighting();
  }
  
  createEnvironment() {
    // Load textures
    const floorTexture = this.textureLoader.load('/textures/floor.jpg');
    const wallTexture = this.textureLoader.load('/textures/wall.jpg');
    
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(2, 6);
    
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(4, 1);
    
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(4, 12);
    const floorMaterial = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.6,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    
    // Ceiling
    const ceiling = floor.clone();
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 3;
    this.scene.add(ceiling);
    
    // Walls
    const wallMaterial = new THREE.MeshStandardMaterial({
      map: wallTexture,
      roughness: 0.7
    });
    
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 3, 12),
      wallMaterial
    );
    leftWall.position.set(-2, 1.5, 0);
    this.scene.add(leftWall);
    
    const rightWall = leftWall.clone();
    rightWall.position.set(2, 1.5, 0);
    this.scene.add(rightWall);
    
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(4, 3, 0.1),
      wallMaterial
    );
    backWall.position.set(0, 1.5, -6);
    this.scene.add(backWall);
    
    const frontWall = backWall.clone();
    frontWall.position.z = 6;
    this.scene.add(frontWall);
    
    // Seats
    this.createSeats();
  }
  
  createSeats() {
    const seatMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a6fa5,
      roughness: 0.8
    });
    
    // Left side seats
    for (let i = 0; i < 4; i++) {
      const seat = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.4, 0.5),
        seatMaterial
      );
      seat.position.set(-1.5, 0.2, -4 + i * 1.5);
      this.scene.add(seat);
      
      const backrest = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.6, 0.1),
        seatMaterial
      );
      backrest.position.set(-1.5, 0.5, -4.25 + i * 1.5);
      this.scene.add(backrest);
    }
    
    // Right side seats
    for (let i = 0; i < 4; i++) {
      const seat = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.4, 0.5),
        seatMaterial
      );
      seat.position.set(1.5, 0.2, -4 + i * 1.5);
      this.scene.add(seat);
      
      const backrest = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.6, 0.1),
        seatMaterial
      );
      backrest.position.set(1.5, 0.5, -4.25 + i * 1.5);
      this.scene.add(backrest);
    }
  }
  
  createSurvivors() {
    const survivorsData = [
      { 
        name: 'axton', 
        pos: [-1.3, 0, -2], 
        color: 0x4a90e2, 
        type: 'standing'
      },
      { 
        name: 'martha', 
        pos: [-1.5, 0, -4], 
        color: 0xe24a4a, 
        type: 'sitting',
        elderly: true
      },
      { 
        name: 'gladwin',
        pos: [-1.5, 0.6, -2.5],
        type: 'model',
        modelPath: '/models/grandpa.glb',
        scale: 0.4,
        elderly: true
      },
      { 
        name: 'david', 
        pos: [1.5, 0, -3], 
        color: 0x6a4a8a, 
        type: 'sitting'
      },
      { 
        name: 'volt', 
        pos: [1.5, 0, -1.5], 
        color: 0xf4a460, 
        type: 'sitting',
        child: true
      },
      { 
        name: 'maya', 
        pos: [1.3, 0, 1], 
        color: 0x4ae2a8, 
        type: 'standing'
      }
    ];
    
    survivorsData.forEach(data => {
      if (data.type === 'model') {
        // --- ASYNCHRONOUS MODEL LOADING ---
        
        this.gltfLoader.load(data.modelPath, (gltf) => {
          // This code runs AFTER the model has loaded
          const survivor = gltf.scene;
          
          // Set position, scale, and userData HERE
          survivor.position.set(...data.pos);
          
          // You will need to experiment to find the right scale!
          const scale = data.scale || 1.0;
          survivor.scale.set(scale, scale, scale);
          
          // Make sure the loaded model casts shadows
          survivor.traverse((node) => {
            if (node.isMesh) {
              node.castShadow = true;
              node.receiveShadow = true; // Optional
            }
          });
          
          survivor.userData.dialogue = data.name;
          survivor.userData.isInteractable = true;
          
          this.scene.add(survivor);
          this.survivors.push(survivor);
        });
        
      } else {
        let survivor;
      
        if (data.type === 'sitting') {
          if (data.child) {
            survivor = CharacterBuilder.createSittingHuman(data.color, 0.6);
          } else if (data.elderly) {
            survivor = CharacterBuilder.createSittingHuman(data.color, 0.85);
          } else {
            survivor = CharacterBuilder.createSittingHuman(data.color, 1);
          }
        } else {
          // Standing
          if (data.elderly) {
            survivor = CharacterBuilder.createElderly(data.color);
          } else {
            survivor = CharacterBuilder.createHuman(data.color);
          }
        }
        
        survivor.position.set(...data.pos);
        survivor.userData.dialogue = data.name;
        survivor.userData.isInteractable = true;
        this.scene.add(survivor);
        this.survivors.push(survivor);
      }
    });
    
    // Volt's astronaut toy
    const toy = CharacterBuilder.createAstronaut(0.12);
    toy.position.set(1.5, 0.5, -1.5);
    toy.userData.isToy = true;
    toy.userData.isInteractable = true;
    toy.userData.dialogue = 'volt';
    this.scene.add(toy);
  }
  
  createLighting() {
    // Bright ceiling lights (normal metro)
    const light1 = new THREE.PointLight(0xffffee, 1, 8);
    light1.position.set(0, 2.8, -3);
    this.scene.add(light1);
    
    const light2 = new THREE.PointLight(0xffffee, 1, 8);
    light2.position.set(0, 2.8, 0);
    this.scene.add(light2);
    
    const light3 = new THREE.PointLight(0xffffee, 1, 8);
    light3.position.set(0, 2.8, 3);
    this.scene.add(light3);
    
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
  }
  
  getSurvivors() {
    return this.survivors;
  }
}