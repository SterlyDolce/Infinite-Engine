import { Column, Text, Panel, MultiInputs, Input, Button, MiniPreview, Bool, Row } from "../Global/ui.js"

function toDegree(radiant) {
    return (radiant * (180 / Math.PI))
}

function toRadiant(degree) {
    return (degree * (Math.PI / 180))
}

function rgbToHex(r, g, b) {

    r = Math.round(r * 255);
    g = Math.round(g * 255);
    b = Math.round(b * 255);

    // Ensure the values are within the valid range
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));

    // Convert each component to a two-digit hexadecimal string
    var red = r.toString(16).padStart(2, '0');
    var green = g.toString(16).padStart(2, '0');
    var blue = b.toString(16).padStart(2, '0');

    // Concatenate the components into a single hex string
    return `#${red}${green}${blue}`;
}






const physicsDetails = [
    {
        name: 'Mass',
        type: 'Numeric Input',
        description: 'The mass of the object, which affects its inertia and response to forces.',
        destination: 'mass'
    },
    {
        name: 'Velocity',
        type: 'Vector3 Input',
        description: 'The current speed and direction of the object.',
        destination: 'velocity'
    },
    // {
    //     name: 'Acceleration',
    //     type: 'Vector3 Input',
    //     description: 'The rate of change of velocity of the object.',
    //     destination: 'acceleration'
    // },
    // {
    //     name: 'Drag',
    //     type: 'Numeric Input',
    //     description: 'The resistance the object experiences while moving through a fluid (air, water, etc.).',
    //     destination: 'drag'
    // },
    // {
    //     name: 'Angular Velocity',
    //     type: 'Vector3 Input',
    //     description: 'The rotational speed around each axis.',
    //     destination: 'getAngularVelocity'
    // },
    // {
    //     name: 'Angular Acceleration',
    //     type: 'Vector3 Input',
    //     description: 'The rate of change of angular velocity.',
    //     destination: 'angularAcceleration'
    // },
    // {
    //     name: 'Gravity Enabled',
    //     type: 'Boolean Toggle',
    //     description: 'Toggle the effect of gravity on the object.',
    //     destination: 'gravityEnabled'
    // },
    // {
    //     name: 'Custom Gravity',
    //     type: 'Vector3 Input',
    //     description: 'Set custom gravity direction and strength if needed.',
    //     destination: 'customGravity'
    // },
    // {
    //     name: 'Applied Forces',
    //     type: 'List of Vectors',
    //     description: 'External forces applied to the object. Each force has a direction and magnitude.',
    //     destination: 'forces'
    // },
    // {
    //     name: 'Collision Detection',
    //     type: 'Boolean Toggle',
    //     description: 'Toggle collision detection for the object.',
    //     destination: 'collisionEnabled'
    // },
    // {
    //     name: 'Collision Response',
    //     type: 'Dropdown',
    //     options: ['Bounce', 'Slide', 'Stop', 'Custom'],
    //     description: 'Define how the object reacts upon collision.',
    //     destination: 'collisionResponse'
    // },
    // {
    //     name: 'Collision Shape',
    //     type: 'Dropdown',
    //     options: ['Box', 'Sphere', 'Capsule', 'Mesh'],
    //     description: 'The shape used for collision detection.',
    //     destination: 'collisionShape'
    // },
    // {
    //     name: 'Bounding Box',
    //     type: 'Dimensions Input',
    //     description: 'Define the dimensions of the bounding box for collision detection.',
    //     destination: 'boundingBox'
    // },
    // {
    //     name: 'Friction',
    //     type: 'Numeric Input',
    //     description: 'The resistance to sliding motion between two surfaces.',
    //     destination: 'friction'
    // },
    // {
    //     name: 'Bounciness (Restitution)',
    //     type: 'Numeric Input',
    //     description: 'The elasticity of the object, determining how it bounces after collision.',
    //     destination: 'bounciness'
    // },
    // {
    //     name: 'Position Constraints',
    //     type: 'Boolean Toggles',
    //     options: ['x', 'y', 'z'],
    //     description: 'Lock the position of the object along specified axes.',
    //     destination: 'positionConstraints'
    // },
    // {
    //     name: 'Rotation Constraints',
    //     type: 'Boolean Toggles',
    //     options: ['x', 'y', 'z'],
    //     description: 'Lock the rotation of the object around specified axes.',
    //     destination: 'rotationConstraints'
    // },
    // {
    //     name: 'Center of Mass',
    //     type: 'Vector3 Input',
    //     description: 'Define the center of mass of the object.',
    //     destination: 'centerOfMass'
    // },
    // {
    //     name: 'Inertia Tensor',
    //     type: 'Matrix Input',
    //     description: 'The inertia tensor matrix defining the object\'s resistance to rotational motion.',
    //     destination: 'inertiaTensor'
    // },
    // {
    //     name: 'Damping',
    //     type: 'Numeric Input',
    //     description: 'Reduce the object\'s velocity and angular velocity over time.',
    //     destination: 'damping'
    // }
];




class NumericInput extends MultiInputs {
    constructor(name = '') {
        const input = new Input(name.toLocaleLowerCase(), 'number').style({ borderLeft: '1px solid #333', minWidth: '40px', maxWidth: '40px', padding: '3px 5px' })
        super({ title: name, children: [input] })

        input.onChanged = (value) => this.onChanged(value)
    }

    getValue() {
        return this.children[0].getValue()
    }

    setValue(value) {
        this.children[0].setValue(value)
        return this
    }

    onChanged(value) { }
}

class Vector3Input extends MultiInputs {
    constructor(name = '') {
        const X = new Input("x", 'number').style({ borderLeft: '2px solid red', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
        const Y = new Input("y", 'number').style({ borderLeft: '2px solid green', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
        const Z = new Input("z", 'number').style({ borderLeft: '2px solid blue', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
        super({ title: name, children: [X, Y, Z] })


        X.onChanged = (value) => this.onChanged({ ...this.getValue(), x: value })
        Y.onChanged = (value) => this.onChanged({ ...this.getValue(), y: value })
        Z.onChanged = (value) => this.onChanged({ ...this.getValue(), z: value })
    }

    getValue() {
        return {
            x: this.children[0].getValue(),
            y: this.children[1].getValue(),
            z: this.children[2].getValue()
        }
    }

    setValue(vector3) {
        this.children[0].setValue(vector3.x)
        this.children[1].setValue(vector3.y)
        this.children[2].setValue(vector3.z)
        return this
    }

    onChanged(value) { }
}

class Vector3Array extends MultiInputs {
    constructor(name = '', length = 1) {
        const vectors = []


        const style = {
            margin: '5px',
            backgroundColor: '#111',
            borderRight: '1px solid #333',
            // borderLeft: '1px solid #333',
            borderTop: '1px solid #333',
            borderBottom: '1px solid #333',
            borderRadius: '5px',
            color: 'white',
            overFlow: 'hidden'
        }

        for (let i = 0; i < length; i++) {

            const X = new Input("x", 'number').style({ borderLeft: '2px solid red', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', }).style(style)
            const Y = new Input("y", 'number').style({ borderLeft: '2px solid green', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', }).style(style)
            const Z = new Input("z", 'number').style({ borderLeft: '2px solid blue', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', }).style(style)

            const row = new Row({ children: [X, Y, Z] })
            vectors.push(row)
        }



        const col = new Column({ children: vectors })
        super({ title: name, children: [col] })
    }

    // getValue() {
    //     return {
    //         x: this.children[0].getValue(),
    //         y: this.children[1].getValue(),
    //         z: this.children[2].getValue()
    //     }
    // }

    // setValue(x = 0, y = 0, z = 0) {
    //     this.children[0].setValue(x)
    //     this.children[1].setValue(y)
    //     this.children[2].setValue(z)
    //     return this
    // }
}

class BooleanToggle extends MultiInputs {
    constructor(name = '') {
        const input = new Bool().style({ borderLeft: '1px solid #333', minWidth: '40px', maxWidth: '40px', padding: '3px 5px' })
        super({ title: name, children: [input] })

        input.onChanged = (value) => this.onChanged(value)
    }

    getValue() {
        return this.children[0].getValue()
    }

    setValue(value) {
        this.children[0].setValue(value)
        return this
    }

    onChanged(value) { }
}




function renderDetails(container) {
    container.element = container._contentElement[0]
    // container.element.style.padding = '10px'
    container.element.style.display = 'flex'
    container.element.style.flexDirection = 'column'
    container.element.style.overflowY = 'auto'

    const buttonStyle = {
        margin: '10px',
        padding: '5px',
        borderRadius: '5px',
        border: '1px solid #333',
        backgroundColor: '#222',
        color: 'white',
        fontSize: '11px'
    }

    const title = new Text("Select an item")
        .style({
            margin: '10px',
            fontSize: "14px",
            fontWeight: "bold"
        })

    const rX = new Input("x", 'number').style({ borderLeft: '2px solid #333', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const rY = new Input("y", 'number').style({ borderLeft: '2px solid #333', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const resolution = new MultiInputs({ title: "Resolution", children: [rX, rY] })

    const ImportHeightmapFile = new Input("Import From File", 'file').style({ borderLeft: '2px solid #333', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const imp = new MultiInputs({ title: "Import From File", children: [ImportHeightmapFile] })

    const updateTerrain = new Button("Update Terrain").style(buttonStyle)



    const terrain = new Panel({ title: "Terain", children: [imp, resolution, updateTerrain] })
        .style({
            margin: '5px',
            borderRadius: '4px',
            backgroundColor: '#222',
            gap: '5px'
        })

    const openActorEditor = new Button("Open in Actor Editor").style(buttonStyle)
    const reloadActor = new Button("Reload Actor").style(buttonStyle)

    const translateX = new Input("x", 'number').style({ borderLeft: '2px solid red', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const translateY = new Input("y", 'number').style({ borderLeft: '2px solid green', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const translateZ = new Input("z", 'number').style({ borderLeft: '2px solid blue', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const translate = new MultiInputs({ title: "Translate", children: [translateX, translateY, translateZ] })

    const rotationX = new Input("x", 'number').style({ borderLeft: '2px solid red', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const rotationY = new Input("y", 'number').style({ borderLeft: '2px solid green', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const rotationZ = new Input("z", 'number').style({ borderLeft: '2px solid blue', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const rotation = new MultiInputs({ title: "Rotation", children: [rotationX, rotationY, rotationZ] })

    const scaleX = new Input("x", 'number').style({ borderLeft: '2px solid red', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const scaleY = new Input("y", 'number').style({ borderLeft: '2px solid green', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const scaleZ = new Input("z", 'number').style({ borderLeft: '2px solid blue', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const scale = new MultiInputs({ title: "Scale", children: [scaleX, scaleY, scaleZ] })



    const transform = new Panel({ title: "Transform", children: [translate, rotation, scale] })
        .style({
            margin: '5px',
            borderRadius: '4px',
            backgroundColor: '#222',
            gap: '5px'
        })



    const meshInput = new MiniPreview().style({ borderLeft: '1px solid #333', borderRadius: '5px', overflow: 'hidden', margin: '5px' })
    const mesh = new MultiInputs({ title: "Mesh", children: [meshInput] })

    const meshes = new Panel({ title: "Meshes", children: [mesh] })
        .style({
            margin: '5px',
            borderRadius: '4px',
            backgroundColor: '#222',
            gap: '5px'
        })

    const materialInput = new MiniPreview().style({ borderLeft: '1px solid #333', borderRadius: '5px', overflow: 'hidden', margin: '5px' })
    const material = new MultiInputs({ title: "Material", children: [materialInput] })

    const materials = new Panel({ title: "Materials", children: [material] })
        .style({
            margin: '5px',
            borderRadius: '4px',
            backgroundColor: '#222',
            gap: '5px'
        })


    // Light

    const colorInput = new Input("Color", 'color').style({ borderLeft: '1px solid #333', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const color = new MultiInputs({ title: "Color", children: [colorInput] })

    const intensityInput = new Input("Intensity", 'number').style({ borderLeft: '1px solid #333', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const intensity = new MultiInputs({ title: "Intensity", children: [intensityInput] })

    const distanceInput = new Input("Distance", 'number').style({ borderLeft: '1px solid #333', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const distance = new MultiInputs({ title: "Distance", children: [distanceInput] })

    const decayInput = new Input("Decay", 'number').style({ borderLeft: '1px solid #333', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const decay = new MultiInputs({ title: "Decay", children: [decayInput] })



    // Input and MultiInputs setup for other light properties

    const typeInput = new Input("Type", 'text').style({ borderLeft: '1px solid #333', minWidth: '40px', maxWidth: '100px', padding: '3px 5px', })
    const type = new MultiInputs({ title: "Type", children: [typeInput] })


    const targetXInput = new Input("Target X", 'number').style({ borderLeft: '1px solid #333', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const targetYInput = new Input("Target Y", 'number').style({ borderLeft: '1px solid #333', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const targetZInput = new Input("Target Z", 'number').style({ borderLeft: '1px solid #333', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const target = new MultiInputs({ title: "Target", children: [targetXInput, targetYInput, targetZInput] })

    const angleInput = new Input("Angle", 'number').style({ borderLeft: '1px solid #333', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const angle = new MultiInputs({ title: "Angle", children: [angleInput] })

    const penumbraInput = new Input("Penumbra", 'number').style({ borderLeft: '1px solid #333', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const penumbra = new MultiInputs({ title: "Penumbra", children: [penumbraInput] })

    const shadowInput = new Input("Shadow", 'checkbox').style({ borderLeft: '1px solid #333', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const shadow = new MultiInputs({ title: "Shadow", children: [shadowInput] })

    const shadowBiasInput = new Input("Shadow Bias", 'number').style({ borderLeft: '1px solid #333', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const shadowBias = new MultiInputs({ title: "Shadow Bias", children: [shadowBiasInput] })

    const shadowMapWidthInput = new Input("Shadow Map Width", 'number').style({ borderLeft: '1px solid #333', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const shadowMapHeightInput = new Input("Shadow Map Height", 'number').style({ borderLeft: '1px solid #333', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const shadowMapSize = new MultiInputs({ title: "Shadow Map Size", children: [shadowMapWidthInput, shadowMapHeightInput] })

    const shadowCameraNearInput = new Input("Shadow Camera Near", 'number').style({ borderLeft: '1px solid #333', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const shadowCameraNear = new MultiInputs({ title: "Shadow Camera Near", children: [shadowCameraNearInput] })

    const shadowCameraFarInput = new Input("Shadow Camera Far", 'number').style({ borderLeft: '1px solid #333', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const shadowCameraFar = new MultiInputs({ title: "Shadow Camera Far", children: [shadowCameraFarInput] })

    const shadowCameraFovInput = new Input("Shadow Camera Fov", 'number').style({ borderLeft: '1px solid #333', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const shadowCameraFov = new MultiInputs({ title: "Shadow Camera Fov", children: [shadowCameraFovInput] })

    const castShadowInput = new Input("Cast Shadow", 'checkbox').style({ borderLeft: '1px solid #333', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const castShadow = new MultiInputs({ title: "Cast Shadow", children: [castShadowInput] })

    // Adding all inputs to the panel
    const light = new Panel({ title: "Light", children: [type, color, intensity, distance, decay, target, angle, penumbra, shadow, shadowBias, shadowMapSize, shadowCameraNear, shadowCameraFar, shadowCameraFov, castShadow] })
        .style({
            margin: '5px',
            borderRadius: '4px',
            backgroundColor: '#222',
            gap: '5px'
        })




    const physics = []

    physicsDetails.forEach(userData => {
        if (userData.type === 'Numeric Input') {
            const container = new NumericInput(userData.name)
            container.setValue(90)
            physics.push({ name: userData.name, container: container, destination: userData.destination })
        } else if (userData.type === 'Vector3 Input') {
            const container = new Vector3Input(userData.name)
            container.setValue(10, 50, 32)
            physics.push({ name: userData.name, container: container, destination: userData.destination })
        }

        else if (userData.type === 'Boolean Toggle') {
            const container = new BooleanToggle(userData.name)
            container.setValue(true)
            physics.push({ name: userData.name, container: container, destination: userData.destination })
        }

        else if (userData.type === 'List of Vectors') {
            const container = new Vector3Array(userData.name, 5)
            // container.setValue(true)
            physics.push({ name: userData.name, container: container, destination: userData.destination })
        }
    });

    const physicsPanel = new Panel({ title: "Physics", children: physics.map(item => item.container) })
        .style({
            margin: '5px',
            borderRadius: '4px',
            backgroundColor: '#222',
            gap: '5px'
        })


    const column = new Column({ children: [title, openActorEditor, reloadActor, terrain, transform, meshes, materials, light, physicsPanel] })
        .style({
            margin: '5px',
            borderRadius: '4px',
            backgroundColor: '#111',
        })
        .addToDom(container.element)
        .show(false)

    engine.addEventListener('updateSelection', (e) => {
        const objects = e.object
        let object
        if (objects && objects[0]) object = objects[0]
        if (!object) {
            column.show(false)
            return
        }
        title.setText(object.name).show(object.name)

        openActorEditor.show(object.isMesh)

        openActorEditor.setText(object.isActor ? "Open in Actor Editor" : "Create an Actor")
            .onClick = () => {
                object.isActor
                    ? engine.openEditor(object.path)
                    : engine.createActor(object)
            }

        reloadActor.show(object.path)
            .onClick = () => {
                object.path
                    ? engine.reloadToScene(object)
                    : console.warn(`${object.name} does't have an original path`)
            }




        if (object.type == 'Terrain') {
            terrain.show(true)

            ImportHeightmapFile.onChanged = () => {
                const file = ImportHeightmapFile.element.files[0]
                if (file) object.updateHeightmap(file.path)
                ImportHeightmapFile.element.value = "";
            }
        }










        translateX.setValue(object.position.x).onChanged = value => object.position.x = value
        translateY.setValue(object.position.y).onChanged = value => object.position.y = value
        translateZ.setValue(object.position.z).onChanged = value => object.position.z = value
        translate.show(object.position)

        rotationX.setValue(toDegree(object.rotation.x)).onChanged = value => object.rotation.x = toRadiant(value)
        rotationY.setValue(toDegree(object.rotation.y)).onChanged = value => object.rotation.y = toRadiant(value)
        rotationZ.setValue(toDegree(object.rotation.z)).onChanged = value => object.rotation.z = toRadiant(value)
        rotation.show(object.rotation)

        scaleX.setValue(object.scale.x).onChanged = value => object.scale.x = value
        scaleY.setValue(object.scale.y).onChanged = value => object.scale.y = value
        scaleZ.setValue(object.scale.z).onChanged = value => object.scale.z = value
        scale.show(object.scale)

        transform.show(object.type !== "World")

        if (object.geometry) {
            meshes.show(true)
            meshInput.render({ geometry: object.geometry })
            if (object.material) {
                meshInput.render({ geometry: object.geometry, material: object.userData.originalMaterial })
            }

        } else {
            meshes.show(false)
        }

        if (object.material) {
            materials.show(true)
            materialInput.render({ material: object.userData.originalMaterial })
            material.setTitle(object.material.name || '* Untitled')
        } else {
            materials.show(false)
        }

        if (object.isLight) {
            light.show(true);

            // Set and show the type input
            typeInput.setValue(object.type || "").onChanged = value => object.type = value
            type.show(object.type !== undefined);

            // Set and show color input

            colorInput.setValue(rgbToHex(object.color.r, object.color.g, object.color.b) || "#ffffff").onChanged = value => object.color = new THREE.Color(value)
            color.show(object.color !== undefined);

            // Set and show intensity input
            intensityInput.setValue(object.intensity || 1).onChanged = value => object.intensity = value
            intensity.show(object.intensity !== undefined);

            // Set and show distance input
            distanceInput.setValue(object.distance || 0).onChanged = value => object.distance = value
            distance.show(object.display !== undefined);

            // Set and show decay input
            decayInput.setValue(object.decay || 1).onChanged = value => object.decay = value
            decay.show(object.decay !== undefined);


            // Set and show target inputs if available
            if (object.target) {
                targetXInput.setValue(object.target.x || 0).show(object.target.x !== undefined).onChanged = value => object.target.x = value
                targetYInput.setValue(object.target.y || 0).show(object.target.y !== undefined).onChanged = value => object.target.y = value
                targetZInput.setValue(object.target.z || 0).show(object.target.z !== undefined).onChanged = value => object.target.z = value
            } else {
                target.show(false);
            }

            // Set and show angle input
            angleInput.setValue(object.angle || 0).onChanged = value => object.angle = value
            angle.show(object.angle !== undefined);

            // Set and show penumbra input
            penumbraInput.setValue(object.penumbra || 0).onChanged = value => object.penumbra = value
            penumbra.show(object.penumbra !== undefined);

            // Set and show shadow checkbox
            shadowInput.setValue(object.shadow || false).onChanged = value => object.shadow = value
            shadow.show(object.shadow !== undefined);

            // Set and show shadow bias input
            shadowBiasInput.setValue(object.shadowBias || 0).onChanged = value => object.shadowBias = value
            shadowBias.show(object.shadowBias !== undefined);

            // Set and show shadow map size inputs
            if (object.shadowMapSize) {
                shadowMapWidthInput.setValue(object.shadowMapSize.width || 512).show(object.shadowMapSize.width !== undefined).onChanged = value => object.shadowMapSize.width = value
                shadowMapHeightInput.setValue(object.shadowMapSize.height || 512).show(object.shadowMapSize.height !== undefined).onChanged = value => object.shadowMapSize.height = value
            } else {
                shadowMapSize.show(false);
            }

            // Set and show shadow camera near input
            shadowCameraNearInput.setValue(object.shadowCameraNear || 0.5).onChanged = value => object.shadowCameraNear = value
            shadowCameraNear.show(object.shadowCameraNear !== undefined);

            // Set and show shadow camera far input
            shadowCameraFarInput.setValue(object.shadowCameraFar || 500).onChanged = value => object.shadowCameraFar = value
            shadowCameraFar.show(object.shadowCameraFar !== undefined);

            // Set and show shadow camera fov input
            shadowCameraFovInput.setValue(object.shadowCameraFov || 45).onChanged = value => object.shadowCameraFov = value
            shadowCameraFov.show(object.shadowCameraFov !== undefined);

            // Set and show cast shadow checkbox
            castShadowInput.setValue(object.castShadow || false).onChanged = value => object.castShadow = value
            castShadow.show(object.castShadow !== undefined);
        } else {
            light.show(false);
        }


        if (object.userData.physics) {
            physicsPanel.show(true)
            physics.forEach(physic => {
                physic.container.show(false)
                if (physic.container.setValue) {
                    physic.container.show(true)
                    if (object.userData.physics[physic.destination]) {
                        physic.container.setValue(object.userData.physics[physic.destination])
                        physic.container.onChanged = (value) => object.userData.physics[physic.destination] = value
                    }
                }

            })
        } else {
            physicsPanel.show(false)
        }




        column.show(true)
    })
}




window.renderDetails = renderDetails

document.dispatchEvent(new CustomEvent('panelReady', { detail: { panel: renderDetails, title: 'Details' } }))