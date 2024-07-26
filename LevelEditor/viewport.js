import * as THREE from '../three/build/three.module.js'
import Stats from 'three/addons/libs/stats.module.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { ieCamControl } from 'three/addons/controls/ieCamControl.js';
import { IUGButton, IUGCanvas, IUGHandler, IUGLabel, IEuiLoader } from '../Global/IUD.js';
import { Button, Checkbox, Column, Input, Label, Row, Select, UI } from '../Global/ui.js'


engine.IEui = new IEuiLoader()





function renderViewport(container) {
    container.element = container._contentElement[0]


    let isOnFocus = true
    let viewMode = 'lit'

    document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === 'visible') {
            isOnFocus = true
        } else {
            isOnFocus = false
        }
    });




    let width, height;
    const offsetTop = -50;
    let canSelect = true;

    let gridHelper

    let zoom = 1
    let camera, playerCamera, perspectiveCamera, orthographicCamera, mainScene, helperScene, playScene, control, composer, effectFXAA, outlinePass, camControls, pmremGenerator, renderPass;
    let playerGroup, playerMixer


    let collisionConfiguration, dispatcher, broadphase, solver, physicsWorld
    let rigidBodies = [];
    let transformAux1

    let UICamera, IUGhandler
    const UIScene = new THREE.Scene();
    const clock = new THREE.Clock();
    let selectedObject;
    let selectedObjects = [];
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const group = new THREE.Group();
    group.name = "WorldGroup";

    const mixer = new THREE.AnimationMixer(group);

    // Create two separate renderers
    let rendererEdit, rendererPlay;


    const params = {
        edgeStrength: 3.0,
        edgeGlow: 0.0,
        edgeThickness: 1.0,
        pulsePeriod: 0,
        rotate: false,
        usePatternTexture: false
    };



    Ammo().then(AmmoLib => {
        Ammo = AmmoLib
        transformAux1 = new Ammo.btTransform();
        init();
    })




    function init() {
        setPhysic()
        setupRenderer();
        setupScenes();
        setupCamera();
        setupGrid();
        setupControls();
        setupLights();
        addObjectsToScene();
        setupComposer();
        autoUpdate()
        setupEventListeners();
        setupUIHelpers();
        setupWorld();
        setupOutlinePass();
    }

    async function setPhysic() {
        collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
        broadphase = new Ammo.btDbvtBroadphase();
        solver = new Ammo.btSequentialImpulseConstraintSolver();

        physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
        physicsWorld.setGravity(new Ammo.btVector3(0, -9.8, 0));
    }

    function setupRenderer() {
        width = container.width;
        height = container.height;



        const canvasContainer = document.createElement('div')
        container.element.appendChild(canvasContainer)

        // Setup editor renderer
        rendererEdit = new THREE.WebGLRenderer({ antialias: true });
        rendererEdit.setPixelRatio(window.devicePixelRatio);
        rendererEdit.shadowMap.enabled = true;
        rendererEdit.setSize(width, height);
        rendererEdit.setAnimationLoop(animateEdit);
        canvasContainer.append(rendererEdit.domElement);
        consol.addTo(container.element)

        // Setup player renderer
        rendererPlay = new THREE.WebGLRenderer({ antialias: true });
        rendererPlay.setPixelRatio(window.devicePixelRatio);
        rendererPlay.shadowMap.enabled = true;
        rendererPlay.setSize(width, height);
        rendererPlay.domElement.style.display = 'none'; // Initially hidden
        container.element.append(rendererPlay.domElement);

        pmremGenerator = new THREE.PMREMGenerator(rendererPlay);
    }

    function setupScenes() {
        mainScene = new THREE.Scene();
        mainScene.type = 'World'
        mainScene.isWorld = true
        mainScene.name = "World Editor"
        helperScene = new THREE.Scene();
        helperScene.add(mainScene);
        playScene = new THREE.Scene();
        playScene.environment = pmremGenerator.fromScene(new RoomEnvironment(rendererPlay), 0.04).texture;
    }

    function setupWorld() {

    }

    async function openMap(map) {
        mainScene.children[0] = map.children[0]
        // engine.sceneUpdated(mainScene)
        saveDefaultData(mainScene)
        console.log('Map Loaded Succesfully')
        autoUpdate()
        selectNewObject(mainScene)

        return (mainScene)
    }

    function setupCamera() {
        playerCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
        orthographicCamera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 0.1, 10000);
        perspectiveCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
        perspectiveCamera.position.set(0, 0, 8);
        camera = perspectiveCamera
        camControls = new ieCamControl(camera, rendererEdit.domElement);

        UICamera = new THREE.OrthographicCamera(
            width / -2, width / 2,
            height / 2, height / -2,
            1, 1000
        );
    }

    function setupGrid() {
        gridHelper = new THREE.GridHelper(10000, 10000, '#202020', '#101010')
        helperScene.add(gridHelper)
    }

    function setupControls() {
        const canvas = rendererEdit.domElement;
        control = new TransformControls(camera, canvas);
        control.addEventListener('change', () => {
            if (selectedObjects[0]) {
                engine.updateSelection = new CustomEvent('updateSelection', { detail: { object: selectedObjects } })
                document.dispatchEvent(engine.updateSelection)
            } else {
                engine.updateSelection = new CustomEvent('updateSelection', { detail: { object: [] } })
                document.dispatchEvent(engine.updateSelection)
            }
            animateEdit()
            checkControlMode()
        });
        control.addEventListener('dragging-changed', event => canSelect = !event.value);

        let prevTransform = {};

        control.addEventListener('mouseDown', function () {
            if (selectedObject) {
                prevTransform = {
                    position: selectedObject.position.clone(),
                    rotation: selectedObject.rotation.clone(),
                    scale: selectedObject.scale.clone(),
                };
            }
        });

        control.addEventListener('mouseUp', function () {
            if (selectedObject) {
                const currentTransform = {
                    position: selectedObject.position.clone(),
                    rotation: selectedObject.rotation.clone(),
                    scale: selectedObject.scale.clone()
                };

                // Add state to the state manager
                engine.stateManager.addState(
                    () => {
                        applyTransform(selectedObject, currentTransform);
                    },
                    () => {
                        applyTransform(selectedObject, prevTransform);
                    }
                );
            }
        });


        const moveTool = document.getElementById('moveTool')
        const rotateTool = document.getElementById('rotateTool')
        const resizeTool = document.getElementById('resizeTool')

        moveTool.onclick = () => control.setMode('translate')
        rotateTool.onclick = () => control.setMode('rotate')
        resizeTool.onclick = () => control.setMode('scale')


    }

    function checkControlMode() {

        if (control) {

            // requestAnimationFrame()

            const moveTool = document.getElementById('moveTool')
            const rotateTool = document.getElementById('rotateTool')
            const resizeTool = document.getElementById('resizeTool')

            switch (control.mode) {
                case 'translate':
                    rotateTool.classList.remove('selected')
                    resizeTool.classList.remove('selected')
                    moveTool.classList.add('selected')
                    break;
                case 'rotate':
                    rotateTool.classList.add('selected')
                    resizeTool.classList.remove('selected')
                    moveTool.classList.remove('selected')
                    break;
                case 'scale':
                    rotateTool.classList.remove('selected')
                    resizeTool.classList.add('selected')
                    moveTool.classList.remove('selected')
                    break;

                default:
                    break;
            }
        }
    }

    function applyTransform(object, transform) {
        object.position.set(transform.position.x, transform.position.y, transform.position.z);
        object.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
        object.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);
    }

    function deleteObject(object) {
        const parent = object.parent;

        if (object === mainScene) {
            console.error("Cannot delete the Map ");
            return
        }

        // Capture current state
        const currentState = {
            parent: parent,
            object: object.clone() // Clone the object to capture its current state
        };

        // Remove object from parent
        control.detach();
        mainScene.remove(control);
        engine.updateSelection = new CustomEvent('updateSelection', { detail: { object: [] } });
        document.dispatchEvent(engine.updateSelection);
        parent.remove(object);

        // Define the reverse state function
        const reverseState = () => {
            const clonedObject = currentState.object.clone(); // Clone the captured object state
            const currentParent = currentState.parent;
            currentParent.add(clonedObject);
        };

        // Add state to the state manager
        engine.stateManager.addState(
            () => deleteObject(object), // Function to perform the delete operation
            reverseState // Function to reverse the delete operation
        );
    }

    function addObject(object, parent) {
        // Capture current state
        const currentState = {
            parent: parent,
            object: object.clone() // Clone the object to capture its current state
        };

        object.userData.physics = {}
        object.userData.physics.mass = 0
        object.userData.physics.velocity = { x: 0, y: 0, z: 0 }

        // Add object to parent
        parent.add(object);
        saveDefaultData(object)
        engine.selectNewObject(object)



        // createAmmoComplexShape(object) // create ammoComplexShape Method

        // Define the reverse state function
        const reverseState = () => {
            const clonedObject = currentState.object.clone(); // Clone the captured object state
            const currentParent = currentState.parent;
            currentParent.remove(object);
        };

        // Add state to the state manager
        engine.stateManager.addState(
            () => addObject(object, parent), // Function to perform the add operation
            reverseState // Function to reverse the add operation
        );
    }

    // Function to create Ammo.js complex shape
    function createAmmoComplexShape(threeObject) {
        const velocity = threeObject.userData.physics.velocity;
        const mass = threeObject.userData.physics.mass;
        threeObject.userData.physics = {};
        const shape = new Ammo.btCompoundShape();
        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(threeObject.position.x, threeObject.position.y, threeObject.position.z));
        const rotation = threeObject.quaternion;
        transform.setRotation(new Ammo.btQuaternion(rotation.x, rotation.y, rotation.z, rotation.w));

        const geometry = threeObject.geometry;
        geometry.computeBoundingBox();
        const bbox = geometry.boundingBox;
        const size = new THREE.Vector3();
        bbox.getSize(size);
        const halfExtents = new Ammo.btVector3(size.x / 2, size.y / 2, size.z / 2);
        const boxShape = new Ammo.btBoxShape(halfExtents);
        shape.addChildShape(transform, boxShape);

        const localInertia = new Ammo.btVector3(0, 0, 0);
        shape.calculateLocalInertia(mass, localInertia);

        const motionState = new Ammo.btDefaultMotionState(transform);
        const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
        const body = new Ammo.btRigidBody(rbInfo);

        physicsWorld.addRigidBody(body);
        threeObject.userData.physics.physicsBody = body;
        threeObject.userData.physics.physicsTransform = transform;

        threeObject.userData.physics.physicsBody.onCollision = (otherObject) => {
            console.log('Collided with:', otherObject);
        };

        threeObject.userData.physics.physicsBody.velocity = new THREE.Vector3(velocity.x, velocity.y, velocity.z);

        threeObject.userData.physics.physicsBody.sync = () => {
            const ms = threeObject.userData.physics.physicsBody.getMotionState();
            if (ms) {
                ms.getWorldTransform(threeObject.userData.physics.physicsTransform);
                const p = threeObject.userData.physics.physicsTransform.getOrigin();
                const q = threeObject.userData.physics.physicsTransform.getRotation();
                threeObject.position.set(p.x(), p.y(), p.z());
                threeObject.quaternion.set(q.x(), q.y(), q.z(), q.w());
            }
        };

        rigidBodies.push(threeObject);
    }

    function setupLights() {

        // const map = new THREE.TextureLoader().load('../light.png');
        // const material = new THREE.SpriteMaterial({ map: map });

        // const sprite = new THREE.Sprite(material);
        // sprite.name = "hiii"

        // group.add(sprite)


        const geometry = new THREE.SphereGeometry(1, 32, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const sphere = new THREE.Mesh(geometry, material);
        // group.add(sphere);





        const amb = new THREE.AmbientLight(0xaaaaaa, 0.6)
        amb.name = "Fill Light"
        group.add(amb);


        const light = new THREE.PointLight(0xddffdd, 2);
        // light.setAppearance(sphere)
        light.position.set(1, 1, 1);
        light.castShadow = true;
        setupShadow(light);
        light.name = 'Sun Light'
        group.add(light);
    }

    function setupShadow(light) {
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        const d = 10;
        light.shadow.camera.left = -d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = -d;
        light.shadow.camera.far = 1000;
    }

    function addObjectsToScene() {
        mainScene.add(group);
        // Uncomment the following lines to add different objects to the scene
        // addSpheresToGroup();
        // addFloorToGroup();
        // addTorusToGroup();
        // addTokyoToGroup()

    }

    function addTokyoToGroup() {
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('../node_modules/three/examples/jsm/libs/draco/gltf/');

        const loader = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader);
        loader.load('../untitled5.glb', function (gltf) {
            const model = gltf.scene;
            model.scale.set(0.1, 0.1, 0.1);
            group.add(model);

            mixer.clipAction(gltf.animations[0]).play();

            rendererPlay.setAnimationLoop(animatePlay);

        }, undefined, function (e) {
            console.error(e);
        });
    }

    function addSpheresToGroup() {
        const geometry = new THREE.SphereGeometry(3, 48, 24);
        for (let i = 0; i < 20; i++) {
            const material = new THREE.MeshLambertMaterial({ color: new THREE.Color().setHSL(Math.random(), 1.0, 0.3) });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.name = "Sphere " + i
            sphere.position.x = Math.random() * 100;
            sphere.position.y = Math.random() * 100;
            sphere.position.z = Math.random() * 100;
            group.add(sphere);
        }
    }

    function addFloorToGroup() {
        const geometry = new THREE.PlaneGeometry(10, 10, 100, 100);
        const material = new THREE.MeshLambertMaterial({ color: 0xdddddd, wireframe: true });
        const floor = new THREE.Mesh(geometry, material);
        floor.rotation.x = Math.PI / -2;
        group.add(floor);
    }

    function addTorusToGroup() {
        const geometry = new THREE.TorusKnotGeometry(1.5, 0.5, 100, 16);
        const material = new THREE.MeshLambertMaterial({ color: 0xdddddd });
        const script = new THREE.Script('Torus',
            `
var currentX = self.position.x
var direction = 1  # 1 for moving right, -1 for moving left
var blue = Color("red")

func onStarted():
    set self.material.color = blue

func onTick():
    # Update currentX to the current x position
    set currentX = self.position.x

    # Move the object in the current direction
    set self.position.x = currentX + (0.01 * direction)

    # Check if the object has reached the bounds and reverse direction if needed
    if (currentX >= 1):
        set direction = -1
    if (currentX <= -1):
        set direction = 1

func onOverlap(obj):
    log(obj)



`
        )
        const torusKnot = new THREE.Actor(geometry, material, 'Torus', script);
        // torusKnot.name = "torus"
        torusKnot.castShadow = true;
        torusKnot.receiveShadow = true;
        torusKnot.position.set(-1, 0, 0);
        group.add(torusKnot);
        const r = new THREE.Group()
        r.name = 'another'
        r.position.set(0, 0, 0)
        group.add(r)
        r.add(torusKnot)
    }

    function setupComposer() {
        const pixelRatio = rendererEdit.getPixelRatio();
        const width = container.width * pixelRatio;
        const height = container.height * pixelRatio;

        composer = new EffectComposer(rendererEdit);
        renderPass = new RenderPass(helperScene, perspectiveCamera);
        composer.addPass(renderPass);

        outlinePass = new OutlinePass(new THREE.Vector2(width, height), mainScene, perspectiveCamera);
        outlinePass.edgeStrength = params.edgeStrength;
        outlinePass.edgeGlow = params.edgeGlow;
        outlinePass.edgeThickness = params.edgeThickness;
        outlinePass.pulsePeriod = params.pulsePeriod;

        composer.addPass(outlinePass);

        effectFXAA = new ShaderPass(FXAAShader);
        effectFXAA.uniforms['resolution'].value.set(1 / width, 1 / height);
        composer.addPass(effectFXAA);

        const outputPass = new OutputPass();
        composer.addPass(outputPass);
    }

    function setupOutlinePass() {
        // outlinePass.edgeStrength = 3;
        outlinePass.visibleEdgeColor.set("#0090ff");
        outlinePass.hiddenEdgeColor.set("#001044");
    }

    function setupEventListeners() {
        window.addEventListener('resize', onWindowResize);

        rendererEdit.domElement.addEventListener('dragover', allowDrop)
        rendererEdit.domElement.addEventListener('drop', drop)

        container.element.addEventListener('mousedown', onMouseDown);
        container.element.addEventListener('mousemove', onMouseMove);
        container.element.addEventListener('mouseup', onMouseUp);
        container.element.addEventListener('dblclick', onDoubleClick);

        container.element.addEventListener('wheel', onScroll, { passive: true });
    }

    function onScroll(e) {
        const deltaY = e.deltaY;

        camControls.speedMultiplier += 0.1 * deltaY;
        camControls.speedMultiplier = Math.max(50, Math.min(100000, camControls.speedMultiplier));
        camControls.update();
    }


    function allowDrop(e) {
        e.preventDefault()

    }

    function drop(e) {
        e.preventDefault()

        const data = e.dataTransfer.getData("data")
        const files = JSON.parse(data)
        const filePaths = files.map(file => file.filePath)

        loadToScene(filePaths)

    }

    function getUniqueName(name, parent) {
        let counter = 1;
        let uniqueName = name;
        while (parent.children.some(child => child.name === uniqueName)) {
            uniqueName = `${name} (${counter})`;
            counter++;
        }
        return uniqueName;
    }


    function loadToScene(filePaths) {
        const loader = new THREE.ObjectLoader();

        filePaths.forEach(filePath => {
            const info = engine.getFileInfo(filePath)
            const type = info.type
            const name = engine.replaceSpacesWithCapital(info.name)


            if (type === 'File' || type === 'Script' || type === 'Map' || type === 'Texture') {
                console.log('Cannot add file type to the scene.')
                return
            }

            const object = engine.environment.get(name)
            if (object) {
                if (object.isMesh || object.isGroup) {
                    const newObject = object.clone(true)
                    newObject.path = filePath
                    newObject.name = getUniqueName(name, group)
                    addObject(newObject, mainScene.children[0])
                } else if (object instanceof AudioBuffer) {

                    const textureLoader = new THREE.TextureLoader();
                    const l = textureLoader.load('Audio.png')
                    const audioSpriteMat = new THREE.SpriteMaterial({ map: l })
                    const audioSprite = new THREE.Sprite(audioSpriteMat)
                    audioSprite.name = object.name
                    audioSprite.type = 'PositionalSound'
                    audioSprite.userData.Audio = object
                    addObject(audioSprite, mainScene.children[0])

                } else {
                    console.log(`This file is not a mesh or actor.`)
                }
            } else {
                console.log(`This file is not found, please reimport "${name}"`)
            }


        })
    }

    function reloadToScene(object) {
        const loader = new THREE.ObjectLoader();
        const filePath = object.path
        // console.log(object)
        const type = engine.determineFileType(filePath)
        console.log(filePath)
        switch (type) {
            case 'Actor':
                loader.load(filePath, (actor) => {
                    object.script = actor.script
                    object.material = actor.material
                    object.geometry = actor.geometry
                    // console.success('loaded')
                })

                break;

            default:
                break;
        }
    }

    function onWindowResize() {
        const width = container.element.clientWidth;
        const height = container.element.clientHeight;



        //
        UICamera.left = width / -2;
        UICamera.right = width / 2;
        UICamera.top = height / 2;
        UICamera.bottom = height / -2;
        UICamera.updateProjectionMatrix();
        //



        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        rendererEdit.setSize(width, height);
        rendererPlay.setSize(width, height);

        composer.setSize(width, height);
        effectFXAA.uniforms['resolution'].value.set(1 / width, 1 / height);
    }

    function onMouseDown(event) {
        if (canSelect && event.button == 0) {
            selectObject(event);
        }
    }

    function onMouseMove(event) {
        if (canSelect) {
            updateMousePosition(event);
        }
    }

    function onMouseUp(event) {
        // Handle mouse up event if needed
    }

    function onDoubleClick(event) {
        if (canSelect) {
            selectObject(event, true);
        }
    }

    function updateMousePosition(event) {
        const rect = rendererEdit.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function selectObject(event, doubleClick = false) {
        updateMousePosition(event);

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(mainScene.children, true);

        if (intersects.length > 0) {
            const selected = intersects[0].object.type == "Appearance" ? intersects[0].object.parent : intersects[0].object;

            if (selected.type !== 'World') {
                helperScene.add(control);
                control.attach(selected);


                selectedObjects = [selected];
                outlinePass.selectedObjects = selectedObjects;
            }


            if (doubleClick) {
                // Handle double-click selection (e.g., open properties panel)

                // const selected = intersects[0].object.parent;

                // if (selected.type !== 'World') {
                //     helperScene.add(control);
                //     control.attach(selected);

                //     selectedObjects = [selected];
                //     outlinePass.selectedObjects = selectedObjects;
                // }

                camControls.focus(selected)
            }
        } else {
            selectNewObject(mainScene)
        }


        engine.updateSelection = new CustomEvent('updateSelection', { detail: { object: selectedObjects } })
        document.dispatchEvent(engine.updateSelection)
    }

    function selectNewObject(object) {
        const selected = object;
        selectedObjects = [selected];
        if (selected.type !== 'World') {
            helperScene.add(control);
            control.attach(selected);

            outlinePass.selectedObjects = selectedObjects;
        } else {
            control.detach();
            helperScene.remove(control);
            outlinePass.selectedObjects = [];
        }

        engine.updateSelection = new CustomEvent('updateSelection', { detail: { object: selectedObjects } })
        document.dispatchEvent(engine.updateSelection)
    }


    function deselectObject() {
        control.detach();
        mainScene.remove(control);
        selectedObjects = [];
        outlinePass.selectedObjects = selectedObjects;

        engine.updateSelection = new CustomEvent('updateSelection', { detail: { object: [] } })
        document.dispatchEvent(engine.updateSelection)
    }


    function switchViewMode(mode, save = true) {
        mainScene.traverse((child) => {
            if (child.isMesh) {
                switch (mode) {
                    case 'lit':
                        child.material = child.userData.originalMaterial;
                        break;
                    case 'unlit':
                        child.material = new THREE.MeshBasicMaterial({ map: child.userData.originalMaterial.map, color: child.userData.originalMaterial.color });
                        break;
                    case 'wireframe':
                        child.material = new THREE.MeshBasicMaterial({ color: 0x555555, wireframe: true });
                        break;
                    default:
                        break;
                }
            }
        });

        if (save) {
            viewMode = mode

        }
    }





    function setupUIHelpers() {

        const style = {
            justifyContent: 'unset', border: '2px solid #333', padding: '3px 5px', fontSize: "11px", borderRadius: "5px", backgroundColor: '#111', margin: '0px', color: "white"
        }

        const cameras = [
            {
                name: 'Perspective', icon: 'videocam', action: () => {
                    renderPass.camera = perspectiveCamera;
                    outlinePass.renderCamera = perspectiveCamera;
                    camera = perspectiveCamera

                    console.log(camera)
                }
            },
            {
                name: 'Perspective', icon: 'videocam', action: () => {
                    renderPass.camera = perspectiveCamera;
                    outlinePass.renderCamera = perspectiveCamera;
                    camera = perspectiveCamera

                    console.log(camera)
                }
            },
            {
                name: 'Orthographic', icon: 'camera', action: () => {
                    renderPass.camera = orthographicCamera;
                    outlinePass.renderCamera = orthographicCamera;
                    camera = orthographicCamera

                    console.log(camera)
                }
            }
        ]


        const cameraButton = new Select(cameras).style({ ...style, width: '100px', })


        const viewModeButton = new Select([
            { name: 'Lit', icon: 'bowling-ball', action: () => { switchViewMode('lit') } },
            { name: 'Lit', icon: 'bowling-ball', action: () => { switchViewMode('lit') } },
            { name: 'Unlit', icon: 'ellipse', action: () => { switchViewMode('unlit') } },
            { name: 'Wirefram', icon: 'ellipse-outline', action: () => { switchViewMode('wireframe') } }
        ]).style({ ...style, width: '65px', })

        const spacer = new Row({ children: [] }).style({ flex: 1 })

        const moveSnapButton = new Button('10', 'move').style(style)
        const rotatSnapButton = new Button('45', 'sync').style(style)
        const scaleSnapButton = new Button('5', 'resize').style(style)

        const fullScreenButton = new Button(null, 'expand').style({ ...style, marginLeft: '5px' })
        fullScreenButton.onClick = () => {
            if (document.fullscreenElement) {
                document.exitFullscreen()
                fullScreenButton.setIcon("expand")
            } else {
                container.element.requestFullscreen()
                fullScreenButton.setIcon("contract")
            }
        }


        const header = new Row({
            children: [
                cameraButton,
                viewModeButton,
                spacer,
                moveSnapButton,
                rotatSnapButton,
                scaleSnapButton,
                fullScreenButton
            ]
        })
            .style({
                position: 'absolute',
                width: 'calc(100% - 10px)',
                height: '25px',
                top: '0px',
                left: '0px',
                gap: '5px',
                padding: '5px',
                zIndex: 10
            })
            .addToDom(container.element)
    }





    function setupUIScene() {
        // Set up the scene
        const width = container.element.clientWidth;
        const height = container.element.clientHeight;
        UIScene.children = []
        UIScene.clear()


        // UICamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        UICamera.position.z = 10;



        IUGhandler = new IUGHandler(UIScene, UICamera, rendererPlay.domElement)
        IUGhandler.setSize(500, 500)


    }






    function animateEdit() {
        const width = container.element.clientWidth;
        const height = container.element.clientHeight;

        if(width == 0 || height == 0){
            return
        }


        if (isOnFocus) {
            // console.log(selectedObjects[0])
            if (!selectedObjects[0]) {
                control.detach();
                mainScene.remove(control);
            }





            
            const aspect = width / height

            //
            UICamera.left = width / -2;
            UICamera.right = width / 2;
            UICamera.top = height / 2;
            UICamera.bottom = height / -2;
            UICamera.updateProjectionMatrix();
            //

            perspectiveCamera.zoom = zoom
            perspectiveCamera.aspect = width / height;
            perspectiveCamera.updateProjectionMatrix();

            camera.position.copy(perspectiveCamera.position);
            camera.rotation.copy(perspectiveCamera.rotation);
            camera.scale.copy(perspectiveCamera.scale);
            camera.zoom = perspectiveCamera.zoom;

            //
            orthographicCamera.left = -10 * aspect / 2
            orthographicCamera.right = 10 * aspect / 2;
            orthographicCamera.top = 10 / 2;
            orthographicCamera.bottom = -10 / 2;
            orthographicCamera.updateProjectionMatrix();
            //

            playerCamera.position.copy(perspectiveCamera.position);
            playerCamera.rotation.copy(perspectiveCamera.rotation);
            playerCamera.scale.copy(perspectiveCamera.scale);
            playerCamera.aspect = width / height;
            playerCamera.updateProjectionMatrix();

            //

            rendererEdit.setSize(width, height);
            rendererPlay.setSize(width, height);

            composer.setSize(width, height);
            effectFXAA.uniforms['resolution'].value.set(1 / width, 1 / height);

            if (!engine.isPlaying) {

                outlinePass.setSize(width, height);
                outlinePass.renderCamera.aspect = aspect;
                outlinePass.renderCamera.updateProjectionMatrix();


                camControls.update();
                composer.render();
                // rendererEdit.render(camera, mainScene)
            }
        }

    }

    function animatePlay() {
        if (!engine.isPlaying) return
        const width = container.element.clientWidth;
        const height = container.element.clientHeight;

        if(width == 0 || height == 0){
            return
        }

        const delta = clock.getDelta();

        const deltaTime = 1 / 60;
        updatePhysics(delta);


        if (playerMixer) playerMixer.update(delta);
        rendererPlay.render(playScene, playerCamera);


        rendererPlay.autoClear = false
        rendererPlay.render(UIScene, UICamera);
        IUGhandler.setSize(width, height)
        IUGhandler.update()

        rendererPlay.autoClear = true
    }

    function updatePhysics(deltaTime) {
        physicsWorld.stepSimulation(deltaTime, 10);

        // 
        rigidBodies.forEach(obj => {
            obj.userData.physics.physicsBody.sync()
        });
    }

    function startPlayer() {
        setupUIScene()
        playScene = new THREE.Scene()
        playerGroup = null
        switchViewMode('lit', false)
        playerGroup = mainScene.children[0].clone(true)
        playerGroup.traverse((child) => {
            if (child.isMesh) {
                child.material = child.material.clone();
                child.geometry = child.geometry.clone()

                createAmmoComplexShape(child)

                // console.log(child)
            }

            if (child.type === 'Appearance') {
                child.visible = false
            }

            if (child.userData.Audio) {

                const object = child.userData.Audio
                console.log(object)
                const audLoader = new THREE.AudioLoader()

                const listener = new THREE.AudioListener();
                playerCamera.add(listener);
                const positionalAudio = new THREE.PositionalAudio(listener);
                audLoader.load(object.filePath, audio => {
                    positionalAudio.setBuffer(audio)
                    positionalAudio.name = object.name
                    positionalAudio.play()
                })

                child.add(positionalAudio)
                child.visible = false
            }
        });

        playerMixer = new THREE.AnimationMixer(playerGroup);

        mixer._actions.forEach((action) => {
            let clip = action.getClip(); // Get the animation clip
            let PlayerAction = playerMixer.clipAction(clip); // Create a new action for the cloned mixer
            PlayerAction.play(); // Play the new action
        });

        playScene.add(playerGroup)



        rendererPlay.domElement.style.display = 'block';
        rendererEdit.domElement.style.display = 'none';
        rendererPlay.setAnimationLoop(animatePlay);
        rendererPlay.domElement.requestPointerLock()



        return [playScene, camera]
    }

    function stopPlayer() {

        playScene.traverse(child => {
            if (child.stop) {
                child.stop()
            }
        })

        switchViewMode(viewMode, false)
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
        rendererPlay.domElement.style.display = 'none';
        rendererEdit.domElement.style.display = 'block';

        playScene = null

    }

    // Export functions to be used outside this module

    function autoUpdate() {
        mainScene.traverse(child => {
            child.addEventListener('childadded', () => engine.sceneUpdated(mainScene))
            child.addEventListener('childremoved', () => engine.sceneUpdated(mainScene))
        })
    }



    engine.openNewMap = openMap
    engine.startPlayer = startPlayer;
    engine.stopPlayer = stopPlayer;
    engine.deleteObject = deleteObject;
    engine.addObject = addObject;
    engine.mainScene = mainScene
    engine.helperScene = helperScene
    engine.deselectObject = deselectObject
    engine.selectNewObject = selectNewObject
    engine.reloadToScene = reloadToScene
    engine.loadloadToScene = loadToScene
    engine.IUG = UIScene

    const playbtn = document.getElementById('PlayGame')
    const pausebtn = document.getElementById('PauseGame')
    playbtn.addEventListener('click', () => {
        if (!engine.isPlaying) {
            playbtn.children[0].name = "Stop"
            pausebtn.disabled = false
            engine.play()

        } else {
            playbtn.children[0].name = "Play"
            pausebtn.disabled = true
            engine.stop()
        }

    })

    pausebtn.addEventListener('click', () => {
        if (engine.isPaused) {
            playbtn.children[0].name = "Stop"
            pausebtn.disabled = false
            engine.play()

        } else {
            playbtn.children[0].name = "Play"
            pausebtn.disabled = true
            engine.pause()
        }

    })

    document.getElementById('openProject').addEventListener('click', async () => {
        await engine.openNewProject();
    });

    engine.addEventListener('fileUpdated', () => {
        mainScene.traverse(child => {
            if (child.path) {
                reloadToScene(child)
            }
        })
    })

    function saveDefaultData(object) {
        object.traverse((child) => {
            if (child.isMesh) {
                child.userData.originalMaterial = child.material;
            }
        });
    }

    function onFloatContentBrowser() {


        const button = new UI().style({
            color: '#fff'
        })
        
        button.element.innerText = "Content Browser"
        const checkbox = new Checkbox('c-br', true).show(false)
        const label = new Label({ forElement: checkbox, children: [button] })
        label.element.className = `lm_tab ${checkbox.getValue()? 'lm_active' : ''}`

        

        const tabs = new UI()
        tabs.element.className = 'lm_tabs'
        label.addToDom(tabs.element)

        const header = new UI()
        header.element.className = 'lm_header'
        tabs.addToDom(header.element)

        const content = new UI().style({height: '300px'})
        content.element.className = 'lm_content'
        content.show(checkbox.getValue())

        const floatcontainer = new Column({ children: [checkbox, header, content] }).style({
            position: 'absolute',
            bottom: '0px',
            width: 'calc(100% - 20px)',
            padding: "10px"
        })
        floatcontainer.addToDom(container.element)


        checkbox.onChanged = (value)=>{
            value 
            ?label.element.classList.add('lm_active')
            :label.element.classList.remove('lm_active')

            content.show(value)
        }

        engine.toggleContentBrowser = () => {
            checkbox.element.click()
        }

        window.renderContentBrowser(content)

        return floatcontainer
    }

    const isfBC = localStorage.getItem('floatingBC')

    if(isfBC){
        onFloatContentBrowser()
    }

    onFloatContentBrowser()

    

    
    


    return mainScene

}

window.renderViewport = renderViewport;

document.dispatchEvent(new CustomEvent('panelReady', {detail: {panel: renderViewport, title: 'Viewport'}}))