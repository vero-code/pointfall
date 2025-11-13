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
    this.tweenGroup = new TWEEN.Group();
    this.exitDoor = null;
    this.doorSign = null;
  }

  update(delta) {
    for (const m of this.mixers) m.update(delta);
    this.tweenGroup.update();
  }

  /**
   * Creating 2D text in a 3D world.
   */
  createTextSprite(text, position, fontSize = 40, width = 512, height = 128) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    context.fillStyle = "rgba(20, 20, 20, 0.9)";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "rgba(200, 200, 200, 0.8)";
    context.lineWidth = 5;
    context.strokeRect(0, 0, width, height);

    context.font = `bold ${fontSize}px Arial`;
    context.fillStyle = "rgba(255, 50, 50, 1.0)";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, width / 2, height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.position.copy(position);

    sprite.scale.set(1.6, 0.4, 1.0);
    return sprite;
  }

  /**
   * Creates a door at the end of the train car.
   */
  createDoor() {
    const doorGeo = new THREE.BoxGeometry(1.5, 2.5, 0.1);
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.8,
      metalness: 0.5,
    });
    this.exitDoor = new THREE.Mesh(doorGeo, doorMat);

    this.exitDoor.position.set(0, 1.25, -5.9);

    this.exitDoor.userData.dialogue = "door";
    this.exitDoor.userData.isInteractable = false;

    this.exitDoor.visible = false;
    this.scene.add(this.exitDoor);

    // Create a sign
    const signPosition = new THREE.Vector3(0, 2.85, -5.85);
    this.doorSign = this.createTextSprite(
      "Locked (electric).",
      signPosition
    );

    this.doorSign.visible = false;
    this.scene.add(this.doorSign);

    this.survivors.push(this.exitDoor);
  }

  showDoor() {
    if (this.exitDoor) {
      this.exitDoor.visible = true;
    }
    if (this.doorSign) {
      this.doorSign.visible = true;
    }
  }

  /**
   * Updates existing door sign.
   */
  updateDoorSign(newText, color) {
    if (!this.doorSign || !this.doorSign.material || !this.doorSign.material.map) {
      console.error("Door sign sprite or its material/map is missing.");
      return;
    }

    const canvas = this.doorSign.material.map.image;
    const context = canvas.getContext("2d");
    
    const width = canvas.width;   // 512
    const height = canvas.height; // 128
    const fontSize = 40; // Must match with createTextSprite

    context.clearRect(0, 0, width, height);

    context.fillStyle = "rgba(20, 20, 20, 0.9)";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "rgba(200, 200, 200, 0.8)";
    context.lineWidth = 5;
    context.strokeRect(0, 0, width, height);

    context.font = `bold ${fontSize}px Arial`;
    context.fillStyle = color;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(newText, width / 2, height / 2);

    this.doorSign.material.map.needsUpdate = true;
  }

  create() {
    this.createEnvironment();
    this.createDebris();
    this.loadAnimations();
    this.createSurvivors();
    this.createLighting();
    this.createDoor();
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
      {
        name: "Walking",
        path: "/models/animations/Martha-Suzie-Walking-Inplace.glb",
      },
      {
        name: "CrouchingIdle",
        path: "/models/animations/Martha-Suzie-Crouching-Idle.glb",
      },
      {
        name: "StandingUp",
        path: "/models/animations/Axton-Leonard-Standing-Up.glb",
      },
      {
        name: "Pointing",
        path: "/models/animations/Lexa-Amy-Kneeling-Pointing.glb",
      },
      {
        name: "StandingUp_Martha",
        path: "/models/animations/Martha-Suzie-Standing-Up.glb",
      },
      {
        name: "StandingUp_David",
        path: "/models/animations/David-Adam-Praying-Stand.glb",
      },
    ];

    animationsToLoad.forEach((anim) => {
      this.gltfLoader.load(anim.path, (gltf) => {
        const clip = gltf.animations[0];
        if (clip) {
          this.animationClips.set(anim.name, clip);
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

    const uniqueClip = clip.clone();
    uniqueClip.name = clipName;

    const action = character.mixer.clipAction(uniqueClip);
    action.setLoop(loop);
    action.clampWhenFinished = loop === THREE.LoopOnce;
    action.reset();
    action.play();

    if (onFinishedCallback && loop === THREE.LoopOnce) {
      const listener = (e) => {
        if (e.action === action) {
          character.mixer.removeEventListener("finished", listener);
          onFinishedCallback();
        }
      };
      character.mixer.addEventListener("finished", listener);
    }
  }

  moveCharacterTo(
    characterName,
    targetPosition,
    duration = 2000,
    onComplete = null
  ) {
    const character = this.survivorsMap.get(characterName);
    if (!character) {
      console.error(`Character model not found for: ${characterName}`);
      if (onComplete) onComplete();
      return;
    }

    new TWEEN.Tween(character.model.position, this.tweenGroup)
      .to(
        { x: targetPosition.x, y: targetPosition.y, z: targetPosition.z },
        duration
      )
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onComplete(() => {
        if (onComplete) onComplete();
      })
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
