import * as THREE from 'three';

export class CharacterBuilder {
  static createHuman(color, scale = 1) {
    const group = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.CapsuleGeometry(0.25 * scale, 0.6 * scale, 4, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.6 * scale;
    body.castShadow = true;
    group.add(body);
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.15 * scale, 8, 8);
    const skinColor = 0xffdbac;
    const headMaterial = new THREE.MeshStandardMaterial({ color: skinColor });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.1 * scale;
    head.castShadow = true;
    group.add(head);
    
    // Arms
    const armGeometry = new THREE.CapsuleGeometry(0.06 * scale, 0.4 * scale, 4, 8);
    const armMaterial = new THREE.MeshStandardMaterial({ color: color });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.3 * scale, 0.7 * scale, 0);
    leftArm.rotation.z = 0.3;
    leftArm.castShadow = true;
    group.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.3 * scale, 0.7 * scale, 0);
    rightArm.rotation.z = -0.3;
    rightArm.castShadow = true;
    group.add(rightArm);
    
    // Legs
    const legGeometry = new THREE.CapsuleGeometry(0.08 * scale, 0.5 * scale, 4, 8);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.12 * scale, 0.05 * scale, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.12 * scale, 0.05 * scale, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);
    
    return group;
  }
  
  static createChild(color) {
    return this.createHuman(color, 0.6);
  }
  
  static createElderly(color) {
    const human = this.createHuman(color, 0.9);
    human.rotation.x = 0.1;
    return human;
  }
  
  static createSittingHuman(color, scale = 1) {
    const group = new THREE.Group();
    
    // Body (sitting position)
    const bodyGeometry = new THREE.CapsuleGeometry(0.25 * scale, 0.4 * scale, 4, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.35 * scale;
    body.rotation.x = 0.2;
    body.castShadow = true;
    group.add(body);
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.15 * scale, 8, 8);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.75 * scale;
    head.castShadow = true;
    group.add(head);
    
    // Arms (resting)
    const armGeometry = new THREE.CapsuleGeometry(0.06 * scale, 0.35 * scale, 4, 8);
    const armMaterial = new THREE.MeshStandardMaterial({ color: color });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.25 * scale, 0.4 * scale, 0.1 * scale);
    leftArm.rotation.set(0.5, 0, 0.2);
    leftArm.castShadow = true;
    group.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.25 * scale, 0.4 * scale, 0.1 * scale);
    rightArm.rotation.set(0.5, 0, -0.2);
    rightArm.castShadow = true;
    group.add(rightArm);
    
    // Legs (bent, sitting)
    const legGeometry = new THREE.CapsuleGeometry(0.08 * scale, 0.4 * scale, 4, 8);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.12 * scale, 0.1 * scale, 0.2 * scale);
    leftLeg.rotation.x = 1.3;
    leftLeg.castShadow = true;
    group.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.12 * scale, 0.1 * scale, 0.2 * scale);
    rightLeg.rotation.x = 1.3;
    rightLeg.castShadow = true;
    group.add(rightLeg);
    
    return group;
  }
  
  static createInjuredHuman(color) {
    const human = this.createHuman(color, 0.85);
    // Lying down position
    human.rotation.x = Math.PI / 2; // 90 degrees
    human.rotation.z = Math.random() * 0.4 - 0.2; // Slight random tilt
    return human;
  }
  
  static createAstronaut(scale = 0.12) {
    const group = new THREE.Group();
    
    // Body (cylinder)
    const bodyGeometry = new THREE.CylinderGeometry(
      0.4 * scale, 0.5 * scale, 1.2 * scale, 8
    );
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xeeeeee,
      roughness: 0.3,
      metalness: 0.7
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    group.add(body);
    
    // Helmet (sphere)
    const helmetGeometry = new THREE.SphereGeometry(0.5 * scale, 8, 8);
    const helmetMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      transparent: true,
      opacity: 0.6,
      roughness: 0.1,
      metalness: 0.9
    });
    const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
    helmet.position.y = 0.8 * scale;
    helmet.castShadow = true;
    group.add(helmet);
    
    // Red X on helmet
    const xGeometry = new THREE.BoxGeometry(0.6 * scale, 0.1 * scale, 0.05 * scale);
    const xMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.3
    });
    
    const x1 = new THREE.Mesh(xGeometry, xMaterial);
    x1.position.set(0, 0.8 * scale, 0.48 * scale);
    x1.rotation.z = Math.PI / 4;
    group.add(x1);
    
    const x2 = new THREE.Mesh(xGeometry, xMaterial);
    x2.position.set(0, 0.8 * scale, 0.48 * scale);
    x2.rotation.z = -Math.PI / 4;
    group.add(x2);
    
    // Arms
    const armGeometry = new THREE.CylinderGeometry(
      0.15 * scale, 0.15 * scale, 0.6 * scale, 6
    );
    
    const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
    leftArm.position.set(-0.5 * scale, 0.2 * scale, 0);
    leftArm.rotation.z = 0.3;
    group.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
    rightArm.position.set(0.5 * scale, 0.2 * scale, 0);
    rightArm.rotation.z = -0.3;
    group.add(rightArm);
    
    // Legs
    const legGeometry = new THREE.CylinderGeometry(
      0.2 * scale, 0.2 * scale, 0.7 * scale, 6
    );
    
    const leftLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    leftLeg.position.set(-0.2 * scale, -0.95 * scale, 0);
    group.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    rightLeg.position.set(0.2 * scale, -0.95 * scale, 0);
    group.add(rightLeg);
    
    return group;
  }
}