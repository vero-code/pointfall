// src/scenes/CrashedMetro.js
import * as THREE from 'three';
import { CharacterBuilder } from '../utils/CharacterBuilder.js';

export class CrashedMetro {
  constructor(scene, textureLoader) {
    this.scene = scene;
    this.textureLoader = textureLoader;
    this.survivors = [];
  }
  
  create() {
    this.createEnvironment();
    this.createDebris();
    this.createSurvivors();
    this.createLighting();
  }
  
  createEnvironment() {
    // --- Load textures ---
    const floorTexture = this.textureLoader.load('/textures/floor.jpg');
    const wallTexture = this.textureLoader.load('/textures/wall.jpg');
    
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
    this.scene.add(floor);
    
    // Ceiling
    const ceiling = floor.clone();
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 3;
    this.scene.add(ceiling);
    
    // Walls
    const wallMaterial = new THREE.MeshStandardMaterial({
      map: wallTexture,
      roughness: 0.9
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
  }
  
  createDebris() {
    // Random debris
    for (let i = 0; i < 15; i++) {
      const debris = new THREE.Mesh(
        new THREE.BoxGeometry(
          0.1 + Math.random() * 0.3,
          0.05 + Math.random() * 0.15,
          0.1 + Math.random() * 0.4
        ),
        new THREE.MeshStandardMaterial({ color: 0x3a3a3a })
      );
      debris.position.set(
        (Math.random() - 0.5) * 3.5,
        0.05,
        (Math.random() - 0.5) * 11
      );
      debris.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      this.scene.add(debris);
    }
  }
  
  createSurvivors() {
    const survivorsData = [
      { 
        name: 'axton', 
        pos: [-1.5, 0.4, -2], 
        color: 0x4a90e2, 
        type: 'sitting' 
      },
      { 
        name: 'martha', 
        pos: [-1.2, 0.4, -4], 
        color: 0xe24a4a, 
        type: 'sitting',
        elderly: true
      },
      { 
        name: 'gladwin', 
        pos: [-0.8, 0.4, -4], 
        color: 0x8a8a8a, 
        type: 'sitting',
        elderly: true
      },
      { 
        name: 'david', 
        pos: [1, 0.4, -3], 
        color: 0x6a4a8a, 
        type: 'standing'
      },
      { 
        name: 'volt', 
        pos: [1.2, 0.15, -2.5], 
        color: 0xf4a460, 
        type: 'injured',
        child: true
      },
      { 
        name: 'maya', 
        pos: [1.5, 0.3, 1], 
        color: 0x4ae2a8, 
        type: 'sitting'
      }
    ];
    
    survivorsData.forEach(data => {
      let survivor;
      
      if (data.type === 'injured') {
        if (data.child) {
          survivor = CharacterBuilder.createInjuredHuman(data.color);
          survivor.scale.set(0.6, 0.6, 0.6);
        } else {
          survivor = CharacterBuilder.createInjuredHuman(data.color);
        }
      } else if (data.type === 'sitting') {
        const scale = data.child ? 0.6 : data.elderly ? 0.85 : 1;
        survivor = CharacterBuilder.createSittingHuman(data.color, scale);
        // Add injury tilt
        survivor.rotation.z = (Math.random() - 0.5) * 0.3;
      } else {
        // Standing but injured
        if (data.elderly) {
          survivor = CharacterBuilder.createElderly(data.color);
        } else {
          survivor = CharacterBuilder.createHuman(data.color);
        }
        // Slight lean
        survivor.rotation.x = Math.random() * 0.2 - 0.1;
      }
      
      survivor.position.set(...data.pos);
      survivor.userData.dialogue = data.name;
      survivor.userData.isInteractable = true;
      this.scene.add(survivor);
      this.survivors.push(survivor);
    });
    
    // Volt's astronaut toy (dropped on floor)
    const toy = CharacterBuilder.createAstronaut(0.12);
    toy.position.set(0.5, 0.08, -1.5);
    toy.rotation.set(Math.PI / 2, 0, Math.random() * Math.PI);
    toy.userData.isToy = true;
    toy.userData.dialogue = 'volt_toy';
    toy.userData.isInteractable = true;
    this.scene.add(toy);
    this.survivors.push(toy);
  }
  
  createLighting() {
    // Emergency light (flickering green)
    const light = new THREE.PointLight(0x00ff00, 0.4, 10);
    light.position.set(0, 2.5, 0);
    this.scene.add(light);

    light.intensity = 0.4;
    
    // Flicker effect
    // setInterval(() => {
    //   light.intensity = Math.random() > 0.3 ? 0.5 : 0.1;
    // }, 100);

    // Ambient (dark)
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(ambientLight);
  }
  
  getSurvivors() {
    return this.survivors;
  }
}