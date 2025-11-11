// src/scenes/CrashedMetro.js
import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import { CharacterBuilder } from "../utils/CharacterBuilder.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { survivorsData } from "../data/crashedSurvivorsData.js";

export class CrashedMetro {
  constructor(scene, textureLoader) {
    this.scene = scene;
    this.textureLoader = textureLoader;
    this.survivors = [];
    this.gltfLoader = new GLTFLoader();
    this.mixers = [];
    this.survivorsMap = new Map();
    this.animationClips = new Map();
  }

  update(delta) {
    for (const m of this.mixers) m.update(delta);
    TWEEN.update();
  }

  create() {
    this.createEnvironment();
    this.createDebris();
    this.loadAnimations();
    this.createSurvivors();
    this.createLighting();
  }

  createEnvironment() {
    // --- Load textures ---
    const floorTexture = this.textureLoader.load("/textures/floor.jpg");
    const wallTexture = this.textureLoader.load("/textures/wall.jpg");

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
      metalness: 0.2,
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
      roughness: 0.9,
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

  loadAnimations() {
    const animationsToLoad = [
      {
        name: "Drinking",
        path: "/models/animations/Martha-Suzie-Drinking.glb",
      },
    ];

    animationsToLoad.forEach((anim) => {
      this.gltfLoader.load(anim.path, (gltf) => {
        const clip = gltf.animations[0];
        if (clip) {
          this.animationClips.set(anim.name, clip);
          console.log(`Loaded animation clip: ${anim.name}`);
        }
      });
    });
  }

  createSurvivors() {
    survivorsData.forEach((data) => {
      if (data.type === "model" && data.modelPath?.endsWith(".glb")) {
        this.gltfLoader.load(data.modelPath, (gltf) => {
          const glb = gltf.scene;
          glb.animations = gltf.animations;

          glb.position.set(...data.pos);
          const scale = data.scale ?? 1.0;
          glb.scale.set(scale, scale, scale);
          glb.traverse((n) => {
            if (n.isMesh) {
              n.castShadow = true;
              n.receiveShadow = true;
            }
          });

          let mixer = new THREE.AnimationMixer(glb);
          this.mixers.push(mixer);

          if (gltf.animations && gltf.animations.length) {
            const clip =
              THREE.AnimationClip.findByName(gltf.animations, data.clipName) ||
              gltf.animations[0];

            if (clip) {
              const action = mixer.clipAction(clip);
              if (data.poseTime != null) {
                action.play();
                action.paused = true;
                action.time = data.poseTime;
                mixer.update(0);
              } else {
                action.setLoop(
                  data.loopOnce ? THREE.LoopOnce : THREE.LoopRepeat
                );
                action.clampWhenFinished = !!data.loopOnce;
                action.timeScale = data.speed ?? 1.0;
                action.play();
              }
            }
          }
          glb.userData.dialogue = data.name;
          glb.userData.isInteractable = true;
          this.scene.add(glb);
          this.survivors.push(glb);

          this.survivorsMap.set(data.name, { model: glb, mixer: mixer });
        });
      } else if (data.type === "model" && data.modelPath?.endsWith(".fbx")) {
        this.fbxLoader.load(data.modelPath, (fbx) => {
          const s = data.scale ?? 0.01;
          fbx.scale.setScalar(s);
          fbx.traverse((n) => {
            if (n.isMesh) {
              n.castShadow = true;
              n.receiveShadow = true;
            }
          });
          fbx.position.set(...data.pos);
          if (fbx.animations && fbx.animations.length) {
            const mixer = new THREE.AnimationMixer(fbx);
            const clip =
              THREE.AnimationClip.findByName(fbx.animations, data.clipName) ||
              fbx.animations[0];
            const action = mixer.clipAction(clip);
            if (data.poseTime != null) {
              action.play();
              action.paused = true;
              action.time = data.poseTime;
              mixer.update(0);
            } else {
              action.setLoop(data.loopOnce ? THREE.LoopOnce : THREE.LoopRepeat);
              action.clampWhenFinished = !!data.loopOnce;
              action.timeScale = data.speed ?? 1.0;
              action.play();
            }
            this.mixers.push(mixer);
          }
          fbx.userData.dialogue = data.name;
          fbx.userData.isInteractable = true;
          this.scene.add(fbx);
          this.survivors.push(fbx);
        });
      } else {
        let survivor;
        if (data.type === "sitting") {
          if (data.child) {
            survivor = CharacterBuilder.createSittingHuman(data.color, 0.6);
          } else if (data.elderly) {
            survivor = CharacterBuilder.createSittingHuman(data.color, 0.85);
          } else {
            survivor = CharacterBuilder.createSittingHuman(data.color, 1);
          }
        } else {
          survivor = data.elderly
            ? CharacterBuilder.createElderly(data.color)
            : CharacterBuilder.createHuman(data.color);
        }

        survivor.position.set(...data.pos);
        survivor.userData.dialogue = data.name;
        survivor.userData.isInteractable = true;
        this.scene.add(survivor);
        this.survivors.push(survivor);
      }
    });

    // Volt's astronaut toy (dropped on floor)
    const toy = CharacterBuilder.createAstronaut(0.12);
    toy.position.set(0.5, 0.08, -1.5);
    toy.rotation.set(Math.PI / 2, 0, Math.random() * Math.PI);
    toy.userData.isToy = true;
    toy.userData.dialogue = "lexa_toy";
    toy.userData.isInteractable = true;
    this.scene.add(toy);
    this.survivors.push(toy);
  }

  playAnimationFor(
    characterName,
    clipName,
    loop = THREE.LoopOnce,
    onFinishedCallback = null
  ) {
    const character = this.survivorsMap.get(characterName);
    if (!character || !character.mixer) {
      console.error(`Character or mixer not found for: ${characterName}`);
      if (onFinishedCallback) onFinishedCallback();
      return;
    }

    let clip = THREE.AnimationClip.findByName(
      character.model.animations,
      clipName
    );
    if (!clip) {
      clip = this.animationClips.get(clipName);
    }

    if (!clip) {
      console.error(
        `Animation clip "${clipName}" not found anywhere for ${characterName}`
      );
      if (onFinishedCallback) onFinishedCallback();
      return;
    }

    character.mixer.stopAllAction(); 
    const action = character.mixer.clipAction(clip);
    action.setLoop(loop);
    action.clampWhenFinished = true;
    action.reset().fadeIn(0.5).play();

    if (onFinishedCallback) {
      const listener = (e) => {
        if (e.action === action) {
          character.mixer.removeEventListener("finished", listener);
          onFinishedCallback();
        }
      };
      character.mixer.addEventListener("finished", listener);
    }
  }

  moveCharacterTo(characterName, targetPosition, duration = 2000) {
    const character = this.survivorsMap.get(characterName);
    if (!character) {
      console.error(`Character model not found for: ${characterName}`);
      return;
    }

    new TWEEN.Tween(character.model.position)
      .to(
        { x: targetPosition.x, y: targetPosition.y, z: targetPosition.z },
        duration
      )
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start();
  }

  createLighting() {
    // Emergency light (flickering green)
    // const light = new THREE.PointLight(0x00ff00, 1.0, 15);
    // light.position.set(0, 2.5, 0);
    // this.scene.add(light);

    // light.intensity = 0.4;

    // Flicker effect
    // setInterval(() => {
    //   light.intensity = Math.random() > 0.3 ? 0.5 : 0.1;
    // }, 100);

    // Ambient (background)
    // const ambientLight = new THREE.AmbientLight(0x808080, 0.8);
    // this.scene.add(ambientLight);

    // Light for test
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
