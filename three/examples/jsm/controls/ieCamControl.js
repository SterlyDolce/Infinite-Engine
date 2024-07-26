import * as THREE from 'three'

class ieCamControl {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        this.speedMultiplier = 50;
        this.movementSpeed = 0.001 * this.speedMultiplier;
        this.lookSpeed = 0.002;
        this.canMove = false

        this.pitch = 0;
        this.yaw = 0;

        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            up: false,
            down: false
        };

        this.init();
    }

    init() {
        this.camera.rotation.order = 'ZYX';
        this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false);
        this.domElement.addEventListener('mouseup', this.onMouseUp.bind(this), false);
        window.addEventListener('keydown', this.onKeyDown.bind(this), false);
        window.addEventListener('keyup', this.onKeyUp.bind(this), false);
    }

    onMouseDown(event) {
        if (event.button === 2) {
            this.domElement.requestPointerLock();
            this.canMove = true
        }
    }

    onMouseMove(event) {
        if (document.pointerLockElement === this.domElement) {
            const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

            this.yaw -= movementX * this.lookSpeed;
            this.pitch -= movementY * this.lookSpeed;
            this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));

            this.camera.rotation.x = this.pitch;
            this.camera.rotation.y = this.yaw;
        }
    }

    onMouseUp(event) {
        if (document.pointerLockElement) {
            document.exitPointerLock();
            this.canMove = false
        }
    }

    onKeyDown(event) {
        switch (event.code) {
            case 'KeyW': this.keys.forward = true; break;
            case 'KeyS': this.keys.backward = true; break;
            case 'KeyA': this.keys.left = true; break;
            case 'KeyD': this.keys.right = true; break;
            case 'KeyE': this.keys.up = true; break;
            case 'KeyQ': this.keys.down = true; break;
        }
    }

    onKeyUp(event) {
        switch (event.code) {
            case 'KeyW': this.keys.forward = false; break;
            case 'KeyS': this.keys.backward = false; break;
            case 'KeyA': this.keys.left = false; break;
            case 'KeyD': this.keys.right = false; break;
            case 'KeyE': this.keys.up = false; break;
            case 'KeyQ': this.keys.down = false; break;
        }
    }

    focus(target, offset = 1.25) {
        // const boundingBox = new THREE.Box3().setFromObject(target);

        // const center = boundingBox.getCenter(new THREE.Vector3());
        // const size = boundingBox.getSize(new THREE.Vector3());
    
        // const maxDim = Math.max(size.x, size.y, size.z);
        // const fov = this.camera.fov * (Math.PI / 180);
        // let cameraZ = Math.abs(maxDim / 4 * Math.tan(fov * 2));
    
        // cameraZ *= offset; // Apply offset
    
        // this.camera.position.z = cameraZ;
    
        // const minZ = boundingBox.min.z;
        // const cameraToFarEdge = (minZ < 0) ? -minZ + cameraZ : cameraZ - minZ;
    
        // this.camera.far = cameraToFarEdge * 3;
        // this.camera.updateProjectionMatrix();
    
        // this.camera.lookAt(center);

        // console.log(this.camera.position)
    }

    update() {
        
        this.movementSpeed = 0.001 * this.speedMultiplier;
       
        Math.min()
        const direction = new THREE.Vector3();

        if (this.canMove){
            if (this.keys.forward) direction.z -= this.movementSpeed;
            if (this.keys.backward) direction.z += this.movementSpeed;
            if (this.keys.left) direction.x -= this.movementSpeed;
            if (this.keys.right) direction.x += this.movementSpeed;
            if (this.keys.up) direction.y += this.movementSpeed;
            if (this.keys.down) direction.y -= this.movementSpeed;
        }


        direction.applyQuaternion(this.camera.quaternion);
        this.camera.position.add(direction);
    }
}

export {ieCamControl}