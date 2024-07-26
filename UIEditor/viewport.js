import * as THREE from '../three/build/three.module.js';
import { DragControls } from './DragControls.js';
import { IEuiLoader, IUGHandler, ParentCanvas } from '../Global/IUD.js';
import IEuiLibrary from './IEuiLibrary.js';

const IEui = new IEuiLibrary();
const loader = new IEuiLoader();

function renderViewport(container, ui) {
    console.log(container)
    if (!container.element) container.element = container._contentElement[0]
    const [width, height] = [container.element.offsetWidth, container.element.offsetHeight];
    const [UIWidth, UIHeight] = [1920, 1080];

    const raycaster = new THREE.Raycaster();
    let helpers = {};
    let matchZoom = 1;
    let panning = false;
    const lastMousePosition = new THREE.Vector2();
    let selectedObjects = [];
    let canSelect = true;
    const mouse = new THREE.Vector2();

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    container.element.appendChild(renderer.domElement);
    console.log(renderer)

    const UIScene = new THREE.Scene();
    UIScene.background = new THREE.Color("#151515");

    const EditorCamera = new THREE.OrthographicCamera(
        width / -2, width / 2,
        height / 2, height / -2,
        0.1, 1000
    );
    EditorCamera.position.z = 5;

    const gridHelper = new THREE.GridHelper(100000, 1000, 0x222222, 0x222222);
    gridHelper.rotation.x = Math.PI / 2;
    UIScene.add(gridHelper);

    const UIGroup = new THREE.Group();
    UIGroup.name = 'IEui';
    UIScene.add(UIGroup);

    const placeholder = new THREE.Mesh(new THREE.PlaneGeometry(UIWidth, UIHeight));
    const placeholderBox = new THREE.BoxHelper(placeholder, 0x0090ff);
    UIScene.add(placeholderBox);

    let Canvas;
    if (ui) {
        console.log(ui);
        ui.name = 'Canvas';
        UIGroup.add(ui);
    } else {
        Canvas = new ParentCanvas(UIWidth, UIHeight);
        Canvas.name = 'Canvas';
        UIGroup.add(Canvas);
    }

    Canvas = UIGroup.children[0];
    console.log(UIGroup);

    const UICamera = new THREE.OrthographicCamera(
        Canvas.width / -2, Canvas.width / 2,
        Canvas.height / 2, Canvas.height / -2,
        0.1, 1000
    );
    UICamera.position.z = 1;

    const IUGhandler = new IUGHandler(UIScene, UICamera, renderer.domElement);
    EditorCamera.zoom = 0.2;
    matchZoom = (EditorCamera.zoom ** -1);

    const controls = new DragControls([...selectedObjects], EditorCamera, renderer.domElement);
    controls.activate();
    controls.addEventListener('drag', animate);
    controls.addEventListener('drag', () => document.dispatchEvent(new CustomEvent('updateDetail')));
    controls.addEventListener('dragstart', () => canSelect = false);
    controls.addEventListener('dragend', () => canSelect = true);

    setupEventListeners();

    function setupEventListeners() {
        container.element.addEventListener('mousedown', onMouseDown);
        container.element.addEventListener('mousemove', onMouseMove);
        container.element.addEventListener('mouseup', onMouseUp);
        container.element.addEventListener('dblclick', onDoubleClick);
        container.element.addEventListener('wheel', onScroll, { passive: true });

        renderer.domElement.addEventListener('dragover', allowDrop);
        renderer.domElement.addEventListener('drop', drop);
    }

    function allowDrop(e) {
        e.preventDefault();
    }

    function drop(e) {
        e.preventDefault();
        const JSONData = localStorage.getItem('adding');
        if (!JSONData) return;

        const data = JSON.parse(JSONData);
        const item = IEui.getItem(data.name);

        if (item && item.isUIElement) {
            if (selectedObjects[0]) {
                if (selectedObjects[0].children.length < selectedObjects[0].limitedChildren) {
                    addObject(item, selectedObjects[0]);
                } else {
                    addObject(item, selectedObjects[0].parent);
                    
                }
            } else {
                addObject(item, Canvas);
            }
        }
    }

    function deleteObject(object) {
        const parent = object.parent;

        if (object === Canvas) {
            console.error("Cannot delete the Canvas");
            return;
        }

        const currentState = {
            parent: parent,
            object: object.clone()
        };

        parent.remove(object);

        const reverseState = () => {
            const clonedObject = currentState.object.clone();
            const currentParent = currentState.parent;
            currentParent.add(clonedObject);
        };

        engine.stateManager.addState(
            () => deleteObject(object),
            reverseState
        );

        clearSelection()
        document.dispatchEvent(new CustomEvent('updateSelection', { detail: { object: [] } }));
    }

    function addObject(object, parent) {
        const currentState = {
            parent: parent,
            object: object.clone()
        };

        parent.add(object);
        selectNewObject(object)

        const reverseState = () => {
            const clonedObject = currentState.object.clone();
            const currentParent = currentState.parent;
            currentParent.remove(object);
        };

        engine.stateManager.addState(
            () => addObject(object, parent),
            reverseState
        );
    }

    function onScroll(e) {
        const deltaY = e.deltaY;
        EditorCamera.zoom += 0.0001 * deltaY;
        matchZoom = (EditorCamera.zoom ** -1);
        EditorCamera.zoom = Math.max(0.1, Math.min(3, EditorCamera.zoom));
    }

    function onMouseDown(event) {
        if (canSelect && event.button == 0) {
            selectObject(event, false, event.shiftKey);
        } else if (event.button == 2) {
            panning = true;
            lastMousePosition.x = event.clientX;
            lastMousePosition.y = event.clientY;
            controls.enabled = false;
        }
    }

    function onMouseMove(event) {
        if (canSelect) {
            updateMousePosition(event);
        }
        if (panning) {
            const deltaX = event.clientX - lastMousePosition.x;
            const deltaY = event.clientY - lastMousePosition.y;
            pan(EditorCamera, deltaX, deltaY);
            lastMousePosition.x = event.clientX;
            lastMousePosition.y = event.clientY;
        }
    }

    function onMouseUp() {
        panning = false;
        controls.enabled = true;
    }

    function onDoubleClick(event) {
        if (canSelect) {
            selectObject(event, true, event.shiftKey);
        }
    }

    function updateMousePosition(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function selectObject(event, doubleClick = false, isShift = false) {
        updateMousePosition(event);
        raycaster.setFromCamera(mouse, EditorCamera);
        const intersects = raycaster.intersectObjects(UIGroup.children, true);

        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;
            const selected = intersectedObject.type === "Appearance" ? intersectedObject.parent : intersectedObject;

            clearSelection();
            if (!UIScene.getObjectByName(selected.name + 'Helper')) {
                selectedObjects = [selected];
                helpers[selected.name] = new THREE.BoxHelper(selected, selected.typeColor);
                helpers[selected.name].name = selected.name + 'Helper';
                UIScene.add(helpers[selected.name]);
            }

            controls.setObjects([...selectedObjects]);
            engine.selectedObjects = selectedObjects;
        } else {
            clearSelection();
        }

        

        document.dispatchEvent(new CustomEvent('updateSelection', { detail: { object: selectedObjects } }));
    }

    function selectNewObject(object) {
        const selected = object;
        clearSelection();
            if (!UIScene.getObjectByName(selected.name + 'Helper')) {
                selectedObjects = [selected];
                helpers[selected.name] = new THREE.BoxHelper(selected, selected.typeColor);
                helpers[selected.name].name = selected.name + 'Helper';
                UIScene.add(helpers[selected.name]);
            }
        document.dispatchEvent(new CustomEvent('updateSelection', { detail: { object: selectedObjects } }));

    }

    function clearSelection() {
        selectedObjects = [];
        controls.setObjects([...selectedObjects]);
        engine.selectedObjects = selectedObjects;
        for (const name in helpers) {
            UIScene.remove(helpers[name]);
        }
        helpers = {};
    }

    function pan(camera, deltaX, deltaY) {
        const panSpeed = 0.005 + matchZoom;
        camera.position.x -= deltaX * panSpeed;
        camera.position.y += deltaY * panSpeed;
    }

    function animate() {
        const [width, height] = [container.element.offsetWidth, container.element.offsetHeight];

        UICamera.left = Canvas.width / -2;
        UICamera.right = Canvas.width / 2;
        UICamera.top = Canvas.height / 2;
        UICamera.bottom = Canvas.height / -2;
        UICamera.updateProjectionMatrix();
        renderer.setSize(width, height);

        EditorCamera.left = width / -2;
        EditorCamera.right = width / 2;
        EditorCamera.top = height / 2;
        EditorCamera.bottom = height / -2;
        EditorCamera.updateProjectionMatrix();

        IUGhandler.setSize(UIWidth, UIHeight);
        IUGhandler.update();
        renderer.render(UIScene, EditorCamera);
    }
    
    renderer.setAnimationLoop(animate);

    document.getElementById('save').onclick = () => {
        const json = Canvas.toJSON();
        console.log(json);

        const stringData = JSON.stringify(json, null, 2);
        engine.writeToFile(stringData, ui.path);
    };

    engine.deleteObject = deleteObject;
    engine.addObject = addObject;
    engine.IEui = loader;

    return UIScene;
}

window.renderViewport = renderViewport;
document.dispatchEvent(new CustomEvent('panelReady', {detail: {panel: renderViewport, title: 'IUG'}}))
