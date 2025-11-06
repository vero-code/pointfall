// src/scenes/CrashedMetro.js
import * as THREE from 'three';

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
      { name: 'axton', pos: [-1.5, 0.8, -2], color: 0x4a90e2 },
      { name: 'martha', pos: [-1.2, 0.5, -4], color: 0xe24a4a },
      { name: 'gladwin', pos: [-0.8, 0.5, -4], color: 0x8a8a8a },
      { name: 'david', pos: [1, 0.8, -3], color: 0x6a4a8a },
      { name: 'volt', pos: [1.2, 0.3, -2.5], color: 0xf4a460 },
      { name: 'maya', pos: [1.5, 0.5, 1], color: 0x4ae2a8 }
    ];
    
    survivorsData.forEach(data => {
      const geometry = new THREE.CapsuleGeometry(0.3, 0.8, 4, 8);
      const material = new THREE.MeshStandardMaterial({ color: data.color });
      const survivor = new THREE.Mesh(geometry, material);
      survivor.position.set(...data.pos);
      survivor.rotation.x = Math.random() * 0.5 - 0.25; // Slight tilt
      survivor.userData.dialogue = data.name;
      survivor.userData.isInteractable = true;
      this.scene.add(survivor);
      this.survivors.push(survivor);
    });
    
    // Volt's astronaut toy (dropped on floor)
    const toyGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.15);
    const toyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xcccccc,
      roughness: 0.8
    });
    const toy = new THREE.Mesh(toyGeometry, toyMaterial);
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
    setInterval(() => {
      light.intensity = Math.random() > 0.3 ? 0.5 : 0.1;
    }, 100);

    // Ambient (dark)
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(ambientLight);
  }
  
  getSurvivors() {
    return this.survivors;
  }
}