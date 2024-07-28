// IUG - Infinite UI Graphics

import * as THREE from '../three/build/three.module.js';
// import { Script } from './node_modules/three/build/three.cjs'

class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    off(event, listener) {
        if (!this.events[event]) return;

        this.events[event] = this.events[event].filter(l => l !== listener);
    }

    emit(event, data) {
        if (!this.events[event]) return;

        this.events[event].forEach(listener => listener(data));
    }
}



// Event Handler
class IUGHandler {
    constructor(UIScene, camera, viewport) {
        this.UIScene = UIScene;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.camera = camera;
        this.interactiveObjects = UIScene.children;
        this.viewport = viewport;
        this.width = this.viewport.clientWidth;
        this.height = this.viewport.clientHeight;

        this.viewport.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.viewport.addEventListener('click', this.onMouseClick.bind(this));
    }

    getNormalizedMouse(event) {
        const rect = this.viewport.getBoundingClientRect();
        return {
            x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
            y: -((event.clientY - rect.top) / rect.height) * 2 + 1
        };
    }

    handleIntersections() {
        const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);
        this.interactiveObjects.forEach(obj => {
            if (obj.isUIElement && obj.eventEmitter) obj.eventEmitter.emit('mouseleave');
        });
        if (intersects.length > 0 && intersects[0].object.parent.isUIElement && intersects[0].object.parent.eventEmitter) {
            intersects[0].object.parent.eventEmitter.emit('mouseenter');
        }
        return intersects;
    }

    onMouseMove(event) {
        this.mouse.copy(this.getNormalizedMouse(event));
        this.raycaster.setFromCamera(this.mouse, this.camera);
        this.handleIntersections();
    }

    onMouseClick(event) {
        this.mouse.copy(this.getNormalizedMouse(event));
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.handleIntersections();
        if (intersects.length > 0 && intersects[0].object.parent.isUIElement && intersects[0].object.parent.eventEmitter) {
            intersects[0].object.parent.eventEmitter.emit('click');
        }
    }

    setSize(UIWidth, UIHeight) {
        this.width = UIWidth;
        this.height = UIHeight;
        this.update();
    }

    update() {
        this.UIScene.traverse(object => {
            if (object.updatePosition) object.updatePosition();
            if (object.update) object.update();
            if (object.isParentCanvas) object.resize(this.width, this.height);
        });
    }
}


let id = 0

function addName(name) {
    id += 1
    return `${name}_${id}`
}

class ParentCanvas extends THREE.Mesh {
    constructor(width, height, script = new THREE.Script('UI_Sript', '\n')) {

        super(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ visible: false }))
        this.allowChildren = true;
        this.limitedChildren = Infinity
        this.name = addName('canvas')
        this.type = "Canvas"
        this.typeColor = '#00a693'
        this.isParentCanvas = true
        this.isUIElement = true;
        this.isIUGCanvas = true;
        this.x = 0;
        this.y = 0;
        this.offsetZ = 0
        this.width = width
        this.height = height
        this.resize(width, height)
        this.script = script
    }

    get(UI) {
        return this.script.environment.get(UI.name)
    }

    resize(width, height) {
        this.width = width
        this.height = height
        this.update()
    }

    update() {
        this.geometry = new THREE.PlaneGeometry(this.width, this.height)
        this.position.z = this.offsetZ
        this.traverse(child => {
            // console.log(child)
            if (child.script != this.script) {
                child.script = this.script
                this.script.environment.MK_VAR(child.name, child)
                console.log(child.script)
            }
        })
    }

    toJSON() {
        const data = super.toJSON();
        data.object.width = this.width;
        data.object.height = this.height;
        data.object.x = this.x;
        data.object.y = this.y;
        data.object.offsetZ = this.offsetZ;
        data.object.isParentCanvas = this.isParentCanvas;
        data.object.isUIElement = this.isUIElement;
        data.object.isIUGCanvas = this.isIUGCanvas;
        data.object.script = this.script.toJSON()

        console.log(data)
        return data;
    }
}

function isPercentage(input = '') {
    input = String(input)
    return input.match(/([^%]*)+%/)
}

// Base UI class
class IUGObject extends THREE.Mesh {
    constructor(anchor = 'center', geometry, material) {
        super(geometry, material);
        this.allowChildren = true;
        this.limitedChildren = Infinity
        this.type = "Object";
        this.typeColor = '#ffffff';
        this.isUIElement = true;
        this.anchor = anchor;
        this.x = 0;
        this.y = 0;
        this.offsetZ = 1;
        this.z = (this.id * 0.001) * this.offsetZ;
        this.width = 0;
        this.height = 0;
        this.percentWidth = null
        this.percentHeight = null
        this.lockAspectRaatio = false
        this.aspectRatio = {
            width: 0,
            height: 0
        }
        this.eventEmitter = new EventEmitter(); // Add event emitter instance
        this.script = null
        this.accessable = {
            width: this.width,
            height: this.height,
            x: this.x,
            y: this.y
        }
        // Add default event listeners
        this.eventEmitter.on('mouseenter', this.onMouseEnter.bind(this));
        this.eventEmitter.on('mouseleave', this.onMouseLeave.bind(this));
        this.eventEmitter.on('click', this.onClick.bind(this));
    }


    onMouseEnter() {
        // Default mouse enter behavior
    }

    onMouseLeave() {
        // Default mouse leave behavior
    }

    onClick() {
        // Default click behavior
    }

    setAnchor(anchor) {
        this.anchor = anchor;
        this.updatePosition();
    }

    togglePercentage() {

        const width = this.parent.width || 0;
        const height = this.parent.height || 0;

        if (isPercentage(this.width)) {
            const result = Number(isPercentage(this.width)[1])
            this.percentWidth = this.width
            this.width = (result / 100) * width
        }

        if (isPercentage(this.height)) {
            const result = Number(isPercentage(this.height)[1])
            this.percentHeight = this.height
            this.height = (result / 100) * height
        }



        if (this.percentHeight && !isPercentage(this.percentHeight)) {
            this.height = this.percentHeight
            this.percentHeight = null
        } else {
            if (this.percentHeight) {
                const result = Number(isPercentage(this.percentHeight)[1])
                this.height = (result / 100) * height
            }
        }

        if (this.percentWidth && !isPercentage(this.percentWidth)) {
            this.width = this.percentWidth
            this.percentWidth = null
        } else {
            if (this.percentWidth) {
                const result = Number(isPercentage(this.percentWidth)[1])
                this.width = (result / 100) * width
            }
        }
    }


    updatePosition() {
        this.togglePercentage()
        const width = this.parent.width || 0;
        const height = this.parent.height || 0;

        const anchorOffsets = {
            'center': [this.x, this.y],
            'top': [this.x, (height / 2 - this.geometry.parameters.height / 2) - this.y],
            'bottom': [this.x, (-height / 2 + this.geometry.parameters.height / 2) + this.y],
            'left': [(-width / 2 + this.geometry.parameters.width / 2) + this.x, this.y],
            'right': [(width / 2 - this.geometry.parameters.width / 2) - this.x, this.y],
            'right top': [(width / 2 - this.geometry.parameters.width / 2) - this.x, (height / 2 - this.geometry.parameters.height / 2) - this.y],
            'right bottom': [(width / 2 - this.geometry.parameters.width / 2) - this.x, (-height / 2 + this.geometry.parameters.height / 2) + this.y],
            'left top': [(-width / 2 + this.geometry.parameters.width / 2) + this.x, (height / 2 - this.geometry.parameters.height / 2) - this.y],
            'left bottom': [(-width / 2 + this.geometry.parameters.width / 2) + this.x, (-height / 2 + this.geometry.parameters.height / 2) + this.y]
        };
        const offset = anchorOffsets[this.anchor] || [this.x, this.y];
        this.position.set(offset[0], offset[1], this.z);
    }

    setRenderer(renderer) {
        this.renderer = renderer;
    }

    toJSON() {
        const data = super.toJSON();
        data.object.isUIElement = this.isUIElement;
        data.object.anchor = this.anchor;
        data.object.x = this.x;
        data.object.y = this.y;
        data.object.offsetZ = this.offsetZ;
        data.object.width = this.width;
        data.object.height = this.height;
        data.object.percentWidth = this.percentWidth
        data.object.percentHeight = this.percentHeight
        data.object.accessable = this.accessable
        return data;
    }

    copy(source, recursive) {
        super.copy(source, recursive);
        this.isUIElement = source.isUIElement;
        this.anchor = source.anchor;
        this.x = source.x;
        this.y = source.y;
        this.offsetZ = source.offsetZ;
        this.width = source.width;
        this.height = source.height;
        this.percentWidth = source.percentWidth
        this.percentHeight = source.percentHeight
        this.accessable = source.accessable
        return this;
    }
}



class IUGCanvas extends IUGObject {
    constructor(anchor = 'center', width, height) {
        super(anchor, new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ visible: false }))
        this.type = "Canvas"
        this.typeColor = '#00a693'

        this.width = width;
        this.height = height;
    }

    update() {

        if (
            this.width !== this.oldWidth
            || this.height !== this.oldHeight
        ) {
            this.geometry.copy(new THREE.PlaneGeometry(this.width, this.height))

            this.oldWidth = this.width
            this.oldHeight = this.height
        }
    }
}



const textureLoader = new THREE.TextureLoader();

// Button class
class IUGButton extends IUGObject {
    constructor(anchor = 'center', width, height, states = {
        normal: {
            image: '../assets/gradient.png',
            color: '#ffffff'
        },
        hover: {
            image: '../assets/gradient.png',
            color: '#888888'
        },
        clicked: {
            image: '../assets/gradient.png',
            color: '#444444'
        }
    }) {
        super(anchor, new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial());
        this.type = "Button"
        this.typeColor = '#6607ef'
        this.name = addName('button')
        this.IUGButton = true
        this.width = width;
        this.height = height;
        this.onClickCallback = () => { };

        this.oldColor = {
            normal: null,
            hover: null,
            clicked: null
        }
        this.oldMap = {
            normal: null,
            hover: null,
            clicked: null
        }

        this.texture = {
            normal: {
                map: textureLoader.load(states.normal.image),
                color: states.normal.color
            },
            hover: {
                map: textureLoader.load(states.hover.image),
                color: states.hover.color
            },
            clicked: {
                map: textureLoader.load(states.clicked.image),
                color: states.clicked.color
            }
        }


    }

    setTextureSetting(state, image, color) {
        this.texture[state].map = textureLoader.load(image);
        this.texture[state].color = color;
    }




    update() {
        // Updating dimension
        if (this.width !== this.oldWidth || this.height !== this.oldHeight) {
            this.geometry.copy(new THREE.PlaneGeometry(this.width, this.height))

            this.oldWidth = this.width
            this.oldHeight = this.height
        }

        // Updating normal state
        if (
            this.texture.normal.color !== this.oldColor.normal
            || this.texture.normal.map !== this.oldMap.normal
        ) {
            this.material.copy(new THREE.MeshBasicMaterial({ color: this.texture.normal.color, map: this.texture.normal.map }))

            this.oldColor.normal = this.texture.normal.color
            this.oldMap.normal = this.texture.normal.map
        }
    }

    onClick() {
        super.onClick();
        if (this.onClickCallback) {
            this.onClickCallback();
        }
    }

    toJSON() {
        const data = super.toJSON();
        data.object.states = {
            normal: {
                image: this.texture.normal.map.source.data.currentSrc,
                color: this.texture.normal.color
            },
            hover: {
                image: this.texture.hover.map.source.data.currentSrc,
                color: this.texture.hover.color
            },
            clicked: {
                image: this.texture.clicked.map.source.data.currentSrc,
                color: this.texture.clicked.color
            }
        }
        return data;
    }

    clone() {

        const object = new IUGButton(this.anchor, this.width, this.height, {
            normal: {
                image: this.texture.normal.map.source.data.currentSrc,
                color: this.texture.normal.color
            },
            hover: {
                image: this.texture.hover.map.source.data.currentSrc,
                color: this.texture.hover.color
            },
            clicked: {
                image: this.texture.clicked.map.source.data.currentSrc,
                color: this.texture.clicked.color
            }
        });
        object.x = this.x
        object.y = this.y
        object.percentHeight = this.percentHeight
        object.percentWidth = this.percentWidth

        return object
    }

    copy(source, recursive) {
        super.copy(source, recursive)
        this.texture = source.texture;
        return this
    }
}

// Label class
class IUGLabel extends IUGObject {
    constructor(anchor = 'center', { text = "NO TEXT", fontHeight = 14, color = "#ffffff", font = "Arial", weight = "normal", variant = "normal" } = {}) {
        super(anchor, new THREE.PlaneGeometry(100, 100), new THREE.MeshBasicMaterial({ transparent: true }));
        this.type = "Label"
        this.typeColor = '#a65497'
        this.name = addName('label')
        this.IUGLabel = true
        this.text = text;
        this.fontHeight = fontHeight
        this.size = this.fontHeight * 100;
        this.color = color;
        this.font = font;
        this.weight = weight;
        this.variant = variant;
        this.width = 0;
        this.height = 0;
        this.autoResize = true;

        this.accessable = {
            ...this.accessable,
            font: this.font,
            text: this.text,
            weight: this.weight,
            variant: this.variant,
            fontHeight: fontHeight,
            color: this.color
        }

        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');

        this.updateCanvas();

        const texture = new THREE.CanvasTexture(this.canvas);
        this.geometry = new THREE.PlaneGeometry(this.canvas.width / 100, this.canvas.height / 100);
        this.material.map = texture;
        this.material.needsUpdate = true;
    }

    update() {
        // Only update the texture if the text has changed
        if (
            this.text !== this.oldText
            || this.size !== this.oldSize
            || this.color !== this.oldColor
            || this.variant !== this.oldVariant
            || this.fontHeight !== this.oldFontHeight
            || this.weight !== this.oldWeight
            || this.width !== this.oldWidth
            || this.height !== this.oldHeight
            || this.autoResize !== this.oldAutoResize
            || this.font != this.oldFont
        ) {
            this.size = this.fontHeight * 100;
            this.updateCanvas();
            const texture = new THREE.CanvasTexture(this.canvas);
            this.material.map = texture;
            this.material.needsUpdate = true;

            if (this.autoResize) {
                this.geometry = new THREE.PlaneGeometry(this.canvas.width / 100, this.canvas.height / 100);
                this.width = this.canvas.width / 100;
                this.height = this.canvas.height / 100;
            } else {
                this.geometry = new THREE.PlaneGeometry(this.width, this.height);
            }

            document.dispatchEvent(new CustomEvent('updateDetail'))
        }
        this.oldText = this.text;
        this.oldSize = this.size;
        this.oldFontHeight = this.fontHeight
        this.oldVariant = this.variant;
        this.oldFont = this.font;
        this.oldColor = this.color;
        this.oldWeight = this.weight;
        this.oldAutoResize = this.autoResize
        this.oldWidth = this.width
        this.oldHeight = this.height
    }

    updateCanvas() {
        this.context.font = `${this.variant} ${this.weight} ${this.size}px ${this.font}`;
        const textMetrics = this.context.measureText(this.text);

        this.canvas.width = textMetrics.width;
        this.canvas.height = this.size;

        this.context.font = `${this.variant} ${this.weight} ${this.size}px ${this.font}`;
        this.context.fillStyle = this.color;
        this.context.fillText(this.text, 0, this.size);
    }

    toJSON() {
        const data = super.toJSON();
        data.object.text = this.text;
        data.object.size = this.size;
        data.object.color = this.color;
        data.object.font = this.font;
        data.object.weight = this.weight;
        data.object.variant = this.variant;
        data.object.autoResize = this.autoResize;
        data.object.width = this.width;
        data.object.height = this.height;
        return data;
    }

    copy(source, recursive) {
        super.copy(source, recursive)
        this.text = source.text;
        this.size = source.size;
        this.color = source.color;
        this.font = source.font;
        this.weight = source.weight;
        this.variant = source.variant;
        this.autoResize = source.autoResize;
        this.width = source.width;
        this.height = source.height;
        return this
    }
}



// Image Class
class IUGImage extends IUGObject {
    constructor(anchor = 'center', width, height, color = '#ffffff', image = '../assets/default.png') {
        super(anchor, new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial());
        this.allowChildren = false
        this.limitedChildren = 0
        this.type = "Image"
        this.typeColor = '#00801a'
        this.name = addName('image')
        this.IUGImage = true
        this.width = width;
        this.height = height;

        this.texture = {
            color: color,
            map: textureLoader.load(image)
        };

        this.update();
    }

    setTextureSetting(image, color) {
        this.texture.map = textureLoader.load(image);
        this.texture.color = color;
        this.update();
    }


    update() {

        if (
            this.texture.color !== this.oldColor
            || this.texture.map !== this.oldMap
            || this.width !== this.oldWidth
            || this.height !== this.oldHeight
        ) {
            this.geometry.copy(new THREE.PlaneGeometry(this.width, this.height))
            this.material.copy(new THREE.MeshBasicMaterial({ color: this.texture.color, map: this.texture.map }))

            this.oldWidth = this.width
            this.oldHeight = this.height
            this.oldColor = this.texture.color
            this.oldMap = this.texture.map
        }
    }



    toJSON() {
        const data = super.toJSON();
        data.object.color = this.texture.color;
        data.object.imageSrc = this.texture.map.source.data.currentSrc

        return data;
    }

    async getImageSrc() {
        return await this.texture.map.source.data.currentSrc
    }

    clone() {
        const source = this.texture.map.source
        const img = source?.data?.currentSrc ? this.imageSrc : 'default.png'
        const object = new IUGImage(this.anchor, this.width, this.height, this.texture.color, img);
        object.x = this.x
        object.y = this.y
        object.percentHeight = this.percentHeight
        object.percentWidth = this.percentWidth

        return object
    }

    copy(source, recursive) {
        super.copy(source, recursive)
        this.textures = source.texture
        return this
    }


}






// Container class
class IUGContainer extends IUGObject {
    constructor(anchor = 'center', width, height, color = '#ffffff', image = '../assets/default.png') {
        super(anchor, new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial());
        this.allowChildren = true
        this.limitedChildren = 1
        this.type = "Container"
        this.typeColor = '#a65497'
        this.name = addName('container')
        this.IUGContainer = true
        this.width = width;
        this.height = height;

        this.padding = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }

        this.texture = {
            color: color,
            map: textureLoader.load(image)
        };

        this.update();
    }

    setTextureSetting(image, color) {
        this.texture.map = textureLoader.load(image);
        this.texture.color = color;
        this.update();
    }


    update() {

        // update Child
        if (this.children && this.children[0]) {
            const child = this.children[0]

            child.width = this.width - (this.padding.left + this.padding.right)
            child.height = this.height - (this.padding.top + this.padding.bottom)
            child.anchor = 'left top'
            child.x = this.padding.left
            child.y = this.padding.top
        }

        if (
            this.texture.color !== this.oldColor
            || this.texture.map !== this.oldMap
            || this.width !== this.oldWidth
            || this.height !== this.oldHeight
        ) {
            this.geometry.copy(new THREE.PlaneGeometry(this.width, this.height))
            this.material.copy(new THREE.MeshBasicMaterial({ color: this.texture.color, map: this.texture.map }))

            this.oldWidth = this.width
            this.oldHeight = this.height
            this.oldColor = this.texture.color
            this.oldMap = this.texture.map
        }
    }



    toJSON() {
        const data = super.toJSON();
        data.object.color = this.texture.color;
        data.object.imageSrc = this.texture.map.source.data.currentSrc
        data.object.padding = this.padding

        return data;
    }

    clone() {
        const img = this.imageSrc ? this.imageSrc : 'default.png'
        const object = new IUGContainer(this.anchor, this.width, this.height, this.color, img);
        object.x = this.x
        object.y = this.y
        object.percentHeight = this.percentHeight
        object.percentWidth = this.percentWidth

        return object
    }

    copy(source, recursive) {
        super.copy(source, recursive)
        this.textures = source.texture
        this.padding = source.padding
        return this
    }


}





// Column class
class IUGColumn extends IUGObject {
    constructor(anchor = 'center', width, height) {
        super(anchor, new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ visible: false }));
        this.allowChildren = true
        this.limitedChildren = Infinity
        this.type = "Column"
        this.typeColor = '#a65497'
        this.name = addName('column')
        this.IUGContainer = true
        this.width = width;
        this.height = height;
        this.gap = 50
        this.alignment = 'stretch'
        this.justify = 'stretch'

        this.padding = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }

        this.update();
    }

    update() {

        // update Child
        if (this.children && this.children[0]) {

            let totalHeight = this.padding.top + this.padding.bottom;
            this.children.forEach((child, index) => {
                totalHeight += Number(child.height);
                if (index > 0) {
                    totalHeight += Number(this.gap);
                }
            });

            this.height = totalHeight;

            this.children.forEach((child, index) => {
                child.anchor = 'left top';
                child.width = this.width - (this.padding.left + this.padding.right);
                child.x = this.padding.left;

                if (index == 0) {
                    child.y = this.padding.top;
                } else {
                    child.y = Number(this.children[index - 1].y) + Number(this.children[index - 1].height) + Number(this.gap);
                }
            });
        }

        if (this.width !== this.oldWidth
            || this.height !== this.oldHeight
        ) {
            this.geometry.copy(new THREE.PlaneGeometry(this.width, this.height))

            this.oldWidth = this.width
            this.oldHeight = this.height
        }
    }



    toJSON() {
        const data = super.toJSON();
        data.object.padding = this.padding
        data.object.gap = this.gap
        return data;
    }

    clone() {

        const object = new IUGColumn(this.anchor, this.width, this.height);
        object.x = this.x
        object.y = this.y
        object.percentHeight = this.percentHeight
        object.percentWidth = this.percentWidth

        object.padding = this.padding
        object.gap = this.gap

        return object
    }

    copy(source, recursive) {
        super.copy(source, recursive)
        this.padding = source.padding
        this.gap = source.gap
        return this
    }


}



// Row class
class IUGRow extends IUGObject {
    constructor(anchor = 'center', width, height) {
        super(anchor, new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ visible: false }));
        this.allowChildren = true
        this.limitedChildren = Infinity
        this.type = "Row"
        this.typeColor = '#a65497'
        this.name = addName('row')
        this.IUGContainer = true
        this.width = width;
        this.height = height;
        this.gap = 50
        this.alignment = 'stretch'
        this.justify = 'stretch'

        this.padding = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }

        this.update();
    }

    update() {

        // update Child
        if (this.children && this.children[0]) {

            let totalWidth = this.padding.left + this.padding.right;
            this.children.forEach((child, index) => {
                totalWidth += Number(child.width);
                if (index > 0) {
                    totalWidth += Number(this.gap);
                }
            });

            this.width = totalWidth;

            this.children.forEach((child, index) => {
                child.anchor = 'left top';
                child.height = this.height - (this.padding.top + this.padding.bottom);
                child.y = this.padding.top;

                if (index == 0) {
                    child.x = this.padding.left;
                } else {
                    child.x = Number(this.children[index - 1].x) + Number(this.children[index - 1].width) + Number(this.gap);
                }

            });

        }

        if (this.width !== this.oldWidth
            || this.height !== this.oldHeight
        ) {
            this.geometry.copy(new THREE.PlaneGeometry(this.width, this.height))

            this.oldWidth = this.width
            this.oldHeight = this.height
        }
    }



    toJSON() {
        const data = super.toJSON();
        data.object.padding = this.padding
        data.object.gap = this.gap
        return data;
    }

    clone() {

        const object = new IUGColumn(this.anchor, this.width, this.height);
        object.x = this.x
        object.y = this.y
        object.percentHeight = this.percentHeight
        object.percentWidth = this.percentWidth

        object.padding = this.padding
        object.gap = this.gap

        return object
    }

    copy(source, recursive) {
        super.copy(source, recursive)
        this.padding = source.padding
        this.gap = source.gap
        return this
    }


}





















// Loader Class
class IEuiLoader extends THREE.ObjectLoader {
    constructor() {
        super();
    }

    parse(json, onLoad) {
        const { metadata } = json;

        if (!metadata || metadata.type !== 'Object') {
            console.error('IEuiLoader: Cannot parse data, invalid format.');
            return;
        }

        const images = this.parseImages(json.images);
        const textures = this.parseTextures(json.textures, images);
        const materials = this.parseMaterials(json.materials, textures);
        const object = this.parseObject(json.object, materials);

        if (json.animations) {
            object.animations = this.parseAnimations(json.animations);
        }

        if (onLoad !== undefined) onLoad(object);

        return object;
    }

    parseObject(data, materials) {


        function getMaterial(name) {

            if (name === undefined) return undefined;

            if (Array.isArray(name)) {

                const array = [];

                for (let i = 0, l = name.length; i < l; i++) {

                    const uuid = name[i];

                    if (materials[uuid] === undefined) {

                        console.warn('THREE.ObjectLoader: Undefined material', uuid);

                    }

                    array.push(materials[uuid]);

                }

                return array;

            }

            if (materials[name] === undefined) {

                console.warn('THREE.ObjectLoader: Undefined material', name);

            }

            return materials[name];

        }

        let object;
        let material

        switch (data.type) {
            case 'Canvas':
                if (data.isParentCanvas) {
                    object = new ParentCanvas(data.width, data.height);
                } else {
                    object = new IUGCanvas(data.anchor, data.width, data.height);
                }
                break;

            case 'Button':
                object = new IUGButton(data.anchor, data.width, data.height, data.states);
                break;

            case 'Image':
                object = new IUGImage(data.anchor, data.width, data.height, data.color, data.imageSrc);
                break;

            case 'Container':
                object = new IUGContainer(data.anchor, data.width, data.height, data.color, data.imageSrc);
                break;

            case 'Column':
                object = new IUGColumn(data.anchor, data.width, data.height)
                break;

            case 'Row':
                object = new IUGRow(data.anchor, data.width, data.height)
                break;

            case 'Label':
                object = new IUGLabel(data.anchor, {
                    text: data.text,
                    fontHeight: data.fontHeight,
                    color: data.color,
                    font: data.font,
                    weight: data.weight,
                    variant: data.variant,
                });
                object.autoResize = data.autoResize;
                break;

            default:
                object = super.parseObject(data, materials);
        }

        // Common properties
        if (data.x !== undefined) object.x = data.x;
        if (data.y !== undefined) object.y = data.y;
        if (data.width !== undefined) object.width = data.width;
        if (data.height !== undefined) object.height = data.height;
        if (data.padding !== undefined) object.padding = data.padding;
        if (data.percentHeight) object.percentHeight = data.percentHeight;
        if (data.percentWidth) object.percentWidth = data.percentWidth;
        if (data.accessable !== undefined) object.accessable = data.accessable;
        if (data.gap !== undefined) object.gap = data.gap;
        if (data.texture !== undefined) {

            // Images
            if (data.texture.map) {
                // data.texture.map = object.texture.map
                data.texture.color = object.texture.color

            }

            // Buttons
            if (data.texture.normal) {
                data.texture.normal.map = object.texture.normal.map
                data.texture.normal.color = object.texture.normal.color
            }

        }

        if (data.children && data.isUIElement) {
            const children = data.children;

            for (let i = 0; i < children.length; i++) {
                object.add(this.parseObject(children[i], materials));
            }
        }

        return object;
    }
}


export { IEuiLoader, ParentCanvas, IUGCanvas, IUGButton, IUGContainer, IUGHandler, IUGLabel, IUGObject, IUGImage, IUGColumn, IUGRow };
