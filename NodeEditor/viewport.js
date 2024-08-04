import * as THREE from '../three/build/three.module.js';
import { CSS3DRenderer, CSS3DObject } from '../three/examples/jsm/renderers/CSS3DRenderer.js';

import { DragControls } from '../three/examples/jsm/controls/DragControls.js';
import { Grid } from '../three/Grid.js';



function getNodeColor(nodeType) {
    let color;

    switch (nodeType) {
        case 'function_definition':
            color = '#2E8B57'; // Dark Sea Green
            break;
        case 'log':
            color = '#3CB371'; // Medium Sea Green
            break;
        case 'event_handler':
            color = '#B22222'; // Firebrick
            break;
        case 'function_call':
            color = '#DAA520'; // Goldenrod
            break;
        case 'variable':
            color = '#FF6347'; // Tomato
            break;
        case 'condition':
            color = '#FF4500'; // Orange Red
            break;
        case 'loop':
            color = '#4682B4'; // Steel Blue
            break;
        case 'assignment':
            color = '#4169E1'; // Royal Blue
            break;
        default:
            color = '#888888'; // Dim Gray (default color)
            break;
    }

    return color;
}


function renderViewport(container, json) {
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

    const UIScene = new THREE.Scene();
    UIScene.background = new THREE.Color("#151515");

    const EditorCamera = new THREE.OrthographicCamera(
        width / -2, width / 2,
        height / 2, height / -2,
        0.1, 1000
    );
    // const EditorCamera = new THREE.PerspectiveCamera(5, width / height, 0.01, 1000)
    EditorCamera.position.z = 50;

    const gridHelper = Grid({
        args: [100.5, 100.5],
        cellSize: 60,
        cellThickness: 1,
        cellColor: new THREE.Color('#252525'),
        sectionSize: 240,
        sectionThickness: 1.5,
        sectionColor: new THREE.Color('#111111'),
        fadeDistance: 60000,
        fadeStrength: 1,
        followCamera: false,
        infiniteGrid: true,
    })

    gridHelper.mesh.rotation.x = Math.PI / 2;
    gridHelper.mesh.position.z = -50
    UIScene.add(gridHelper.mesh);

    const UIGroup = new THREE.Group();
    UIGroup.name = 'IEui';
    UIScene.add(UIGroup);



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
        container.element.addEventListener('mouseup', onMouseUp);
        container.element.addEventListener('mousemove', onMouseMove);
        container.element.addEventListener('wheel', onScroll, { passive: true })
    }



    function deleteObject(object) {
        const parent = object.parent;



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
        EditorCamera.zoom = Math.max(0.1, Math.min(30, EditorCamera.zoom));

    }

    function onMouseDown(event) {
        if (event.button == 2) {
            panning = true;
            lastMousePosition.x = event.clientX;
            lastMousePosition.y = event.clientY;
            controls.enabled = false;
        }
    }

    function onMouseUp() {
        panning = false;
        controls.enabled = true;
    }

    function onMouseMove(event) {
        if (panning) {
            const deltaX = event.clientX - lastMousePosition.x;
            const deltaY = event.clientY - lastMousePosition.y;
            pan(EditorCamera, deltaX, deltaY);
            lastMousePosition.x = event.clientX;
            lastMousePosition.y = event.clientY;
        }
    }


    function updateMousePosition(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function selectObject(object, event, doubleClick = false, isShift = false) {
        updateMousePosition(event);

        if (object) {
            const intersectedObject = object;
            const selected = intersectedObject.type === "Appearance" ? intersectedObject.parent : intersectedObject;

            clearSelection();
            if (!UIScene.getObjectByName(selected.name + 'Helper')) {
                selectedObjects = [selected];
                object.element.style.borderColor = getNodeColor(object.type)
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
        selectedObjects.forEach(object => {
            object.element.style.borderColor = 'transparent'
        })
        selectedObjects = [];
        controls.setObjects([...selectedObjects]);
    }

    function pan(camera, deltaX, deltaY) {
        const panSpeed = 0.005 + matchZoom;
        camera.position.x -= deltaX * panSpeed;
        camera.position.y += deltaY * panSpeed;
    }
















    //////
    var ns = 'http://www.w3.org/2000/svg'
    const svg = document.createElementNS(ns, 'svg')
    svg.setAttributeNS(null, 'width', width)
    svg.setAttributeNS(null, 'height', height)
    svg.style.position = 'absolute'
    svg.style.top = '0px'
    svg.style.left = '0px'
    container.element.appendChild(svg);

    const defs = document.createElementNS(ns, 'defs')
    svg.appendChild(defs);




    // Create the CSS3DRenderer
    const NodeRenderer = new CSS3DRenderer();
    NodeRenderer.setSize(width, height);
    NodeRenderer.domElement.style.position = 'absolute'
    NodeRenderer.domElement.style.top = '0px'
    NodeRenderer.domElement.style.left = '0px'
    container.element.appendChild(NodeRenderer.domElement);
    NodeRenderer.domElement.setAttribute('panel', 'Visual')



    // console.log(NodeRenderer.domElement.firstChild.firstChild.style)


    // Create a CSS3DObject (e.g., a div element)

    class Node extends CSS3DObject {
        constructor(id, type, name, inputs = [], outputs = []) {

            const element = document.createElement('div');
            element.style = `
            min-width: 300px;
            border-radius: 10px;
            background-color: #55555580;
            overflow: hidden;
            padding: 10px 0px;
            `
            super(element)

            element.onclick = (e) => {
                selectObject(this, e, false, false)
            }

            const nodeName = document.createElement('span')
            nodeName.textContent = name
            nodeName.style = `
            padding: 5px;
            margin: 10px;
            font-weight: bold;
            `
            element.appendChild(nodeName)
            this.name = name


            const typeColor = document.createElement('div')
            typeColor.style = `
            padding: 5px;
            margin: 10px;
            border-radius: 20px;
            background-image: linear-gradient(90deg, ${getNodeColor(type)}80, ${getNodeColor(type)}, ${getNodeColor(type)}aa);
            `
            element.appendChild(typeColor)
            this.type = type

            const sides = document.createElement('div')
            sides.style = `
            margin: 10px 0px 0px 0px;
            display: flex;
            flex-direction: row;
            `
            element.appendChild(sides)

            const left = document.createElement('div')
            left.style = `
            flex: 1;
            display: flex;
            flex-direction: column;
            `
            sides.appendChild(left)

            const right = document.createElement('div')
            right.style = `
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            justify-content: space-evenly;
            `
            sides.appendChild(right)


            this.inputPins = {}
            inputs.forEach(input => {
                const elem = document.createElement('div')
                elem.style = `
                display: flex;
                flex-direction: row;
                `
                elem.id = `${id}.${input.name}`

                const pin = document.createElement('ion-icon')
                pin.name = 'radio-button-on-outline'
                pin.id = `${id}.${input.name}`
                pin.style = `
                margin: 5px 5px 5px 10px;
                pointer-event: none;
                color: ${getNodeColor(input.type)};
                `
                elem.appendChild(pin)

                elem.append(input.name)
                left.appendChild(elem)


                elem.addEventListener('mouseenter', () => {
                    elem.classList.add('hovered');
                    elem.style.backgroundImage = `linear-gradient(90deg, ${getNodeColor(input.type)}50, transparent)`
                });

                elem.addEventListener('mouseleave', () => {
                    elem.style.backgroundImage = 'unset'
                });

                this.inputPins[input.name] = { pin, type: input.type }
            })


            this.outputPins = {}
            this.linearGradients = {}
            outputs.forEach(output => {
                let connectedPath = null
                const elem = document.createElement('div')
                elem.style = `
                display: flex;
                flex-direction: row;
                `
                elem.id = `${id}.${output.name}`
                elem.append(output.name)



                const pin = document.createElement('ion-icon')
                pin.name = 'radio-button-on-outline'
                pin.id = `${id}.${output.name}`
                pin.style = `
                margin: 5px 5px 5px 10px;
                pointer-event: none;
                color: ${getNodeColor(output.type)};
                `
                elem.appendChild(pin)
                right.appendChild(elem)

                elem.addEventListener('mouseenter', () => {
                    elem.classList.add('hovered');
                    elem.style.backgroundImage = `linear-gradient(-90deg, ${getNodeColor(output.type)}50, transparent)`
                });

                elem.addEventListener('mouseleave', () => {
                    elem.style.backgroundImage = 'unset'
                });

                this.outputPins[output.name] = { pin, type: output.type }

                const connect = () => {
                    if (output.connected_to) {


                        const linearGradient = document.createElementNS(ns, 'linearGradient')
                        linearGradient.id = `${name}-${output.name}`
                        defs.appendChild(linearGradient);

                        const stop = document.createElementNS(ns, 'stop')
                        stop.setAttribute('offset', '0%')
                        stop.setAttribute('style', `stop-color: ${getNodeColor(output.type)};`)
                        linearGradient.appendChild(stop);

                        const stop2 = document.createElementNS(ns, 'stop')
                        stop2.setAttribute('offset', '100%')
                        stop2.setAttribute('style', `stop-color: ${getNodeColor(output.type)};`)
                        linearGradient.appendChild(stop2);


                        const path = document.createElementNS(ns, 'path')
                        path.setAttributeNS(null, 'stroke', `(#${name}-${output.name})`)
                        path.setAttributeNS(null, 'stroke-width', '3')
                        path.setAttribute('fill', 'none')
                        // path.style.transform = 'translate(-35%, -43%)'
                        svg.appendChild(path)

                        connectedPath = path
                        updatePath(path, this, output.name, output.connected_to)

                    }
                }

                connect();

                elem.addEventListener('mousedown', start);

                const scope = this

                function start(event) {
                    if (connectedPath) connectedPath.remove()
                    const path = document.createElementNS(ns, 'path')
                    path.setAttributeNS(null, 'stroke', `${getNodeColor(output.type)}`)
                    path.setAttributeNS(null, 'stroke-width', '3')
                    path.setAttribute('fill', 'none')
                    // path.style.transform = 'translate(-35%, -43%)'
                    svg.appendChild(path)

                    function connecting(event) {
                        const [x, y] = [event.clientX, event.clientY];
                        const pin2 = getMousePosition(event)
                        const pin1 = scope.getPinPosition(output.name, 'output')
                        path.setAttribute('d', `M ${pin1.x} ${pin1.y} Q ${pin1.x + 50} ${pin1.y}, ${(pin1.x + pin2.x) / 2} ${(pin1.y + pin2.y) / 2} T${pin2.x} ${pin2.y}`);

                    }

                    function connected(event) {
                        path.remove()
                        console.log(event.target.id)
                        output.connected_to = event.target.id
                        connect();
                        document.removeEventListener('mousemove', connecting);
                        document.removeEventListener('mouseup', connected);
                    }

                    document.addEventListener('mousemove', connecting);
                    document.addEventListener('mouseup', connected);
                }

            })

            element.style.border = '3px solid transparent'

        }

        getPinType(pinName, type = 'input') {
            let pinElement;

            if (type === 'input') {
                pinElement = this.inputPins[pinName];
            } else if (type === 'output') {
                pinElement = this.outputPins[pinName];
            }

            if (pinElement) {
                return pinElement.type;
            }

            return null;
        }

        getPinPosition(pinName, type = 'input') {
            let pinElement;

            if (type === 'input') {
                pinElement = this.inputPins[pinName].pin;
            } else if (type === 'output') {
                pinElement = this.outputPins[pinName].pin;
            }

            if (pinElement) {
                // Get the 3D position of the node
                const nodePosition = new THREE.Vector3();
                this.getWorldPosition(nodePosition);

                // Project this 3D position to screen coordinates
                const projectedPosition = nodePosition.clone().project(EditorCamera);

                // Convert the normalized device coordinates (NDC) to screen coordinates
                const [width, height] = [container.element.offsetWidth, container.element.offsetHeight];
                const x = (projectedPosition.x * 0.5 + 0.5) * width;
                const y = (1 - projectedPosition.y * 0.5 - 0.5) * height;

                // Calculate the offset of the pin within the node
                const pinRect = pinElement.getBoundingClientRect();
                const nodeRect = this.element.getBoundingClientRect();

                // Adjust offsets using absolute positions to eliminate inconsistencies
                const offsetX = (pinRect.left + pinRect.width / 2) - (nodeRect.left + nodeRect.width / 2);
                const offsetY = (pinRect.top + pinRect.height / 2) - (nodeRect.top + nodeRect.height / 2);

                // Return the final position considering both the 3D position and DOM offset
                return new THREE.Vector2(x + offsetX, y + offsetY);
            }

            return null;
        }

    }

    const nodes = {}

    engine.addNode = (id, type, name, inputs = [], outputs = [], position = new THREE.Vector2())=>{
        const cssObject = new Node(id, type, name, inputs, outputs)
        cssObject.position.set(position.x, position.y, 0);
        nodes[id] = cssObject
        UIGroup.add(cssObject);
    }


    json.nodes.forEach((node) => {
        engine.addNode(node.id, node.type, node.properties.name || node.properties.event || node.properties.function_name || node.type, node.inputs, node.outputs, new THREE.Vector2(node.position.x, node.position.y));
    })



    controls.setObjects(Object.keys(nodes));





    function getMousePosition(event) {
        const [width, height] = [container.element.offsetWidth, container.element.offsetHeight];
        const vp = container.element.getBoundingClientRect();

        const projectedPosition = new THREE.Vector3()

        const x = (projectedPosition.x * 0.5 + 0.5) * width;
        const y = (1 - projectedPosition.y * 0.5 - 0.5) * height;

        const offsetX = event.x - (vp.left + vp.width/2);
        const offsetY = event.y - (vp.top + vp.height/2);

        return new THREE.Vector2(x + offsetX, y + offsetY);
    }
    







    function updatePath(path, node1, output, connected_to) {
        const [node, input] = connected_to.split('.')
        const node2 = nodes[node]
        if (node1 && node2) {

            // path.style.transform = 'translate(-35%, -43%)'

            const color = getNodeColor(node2.getPinType(input, 'input'))

            document.getElementById(`${node1.name}-${output}`).childNodes[0].style.stopColor = color

            path.setAttribute('stroke', `url(#${node1.name}-${output})`)

            const pin1 = node1.getPinPosition(output, 'output')
            const pin2 = node2.getPinPosition(input, 'input')

            path.setAttribute('d', `M ${pin1.x} ${pin1.y} Q ${(pin1.x + 50)} ${pin1.y}, ${(pin1.x + pin2.x) / 2} ${(pin1.y + pin2.y) / 2} T${pin2.x} ${pin2.y}`);
        }

        if (node1) requestAnimationFrame(() => updatePath(path, node1, output, connected_to));
    }






    console.log(NodeRenderer.domElement.firstChild.firstChild.children)

    console.log(nodes.node1.position.x)



    function animate() {
        // requestAnimationFrame(animate)

        const [width, height] = [container.element.offsetWidth, container.element.offsetHeight];


        svg.setAttributeNS(null, 'width', width)
        svg.setAttributeNS(null, 'height', height)


        renderer.setSize(width, height);

        EditorCamera.left = width / -2;
        EditorCamera.right = width / 2;
        EditorCamera.top = height / 2;
        EditorCamera.bottom = height / -2;

        // EditorCamera.aspect = width / height
        EditorCamera.updateProjectionMatrix();
        gridHelper.update(EditorCamera)

        NodeRenderer.render(UIScene, EditorCamera);
        NodeRenderer.setSize(width, height);
        renderer.render(UIScene, EditorCamera);
    }

    renderer.setAnimationLoop(animate);

    // document.getElementById('save').onclick = () => {
    //     const json = Canvas.toJSON();
    //     console.log(json);

    //     const stringData = JSON.stringify(json, null, 2);
    //     engine.writeToFile(stringData, ui.path);
    // };

    engine.deleteObject = deleteObject;
    engine.addObject = addObject;

    return UIScene;
}

window.renderViewport = renderViewport;
document.dispatchEvent(new CustomEvent('panelReady', { detail: { panel: renderViewport, title: 'Visual' } }))
