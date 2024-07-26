import * as THREE from '../three/build/three.module.js';
import { Column, Text, Panel, MultiInputs, Input, Button, MiniPreview, Bool, Row, Select, ImageSelect } from "../Global/ui.js"

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

function decimalToHex(decimal) {
    // Ensure the decimal is within the valid range for a 24-bit color

    const saved = decimal

    decimal = Math.max(0, Math.min(16777215, decimal));

    if (isNaN(decimal)) {
        return saved
    }
    // Convert the decimal to a hexadecimal string
    let hex = decimal.toString(16).toUpperCase();


    // Pad the hex string with leading zeros if necessary to ensure it is 6 characters long
    hex = hex.padStart(6, '0');
    // Return the hex color code with a leading #
    return `#${hex}`;
}



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
    if (!container.element) container.element = container._contentElement[0]
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


    const style = {
        margin: '5px', width: '100px', justifyContent: 'unset', border: '1px solid #333', padding: '3px 5px', fontSize: "11px", borderRadius: "5px", backgroundColor: '#111', color: "white"
    }

    const anchorSelect = new Select([
        { name: 'Top Left', icon: null, value: 'left top' },
        { name: 'Top Left', icon: 'add', value: 'left top' },
        { name: 'Top', icon: null, value: 'top' },
        { name: 'Top Right', icon: null, value: 'right top' },

        { name: 'Left', icon: null, value: 'left' },
        { name: 'Center', icon: null, value: 'center' },
        { name: 'Right', icon: null, value: 'right' },

        { name: 'Bottom Left', icon: null, value: 'left bottom' },
        { name: 'Bottom', icon: null, value: 'bottom' },
        { name: 'Bottom Right', icon: null, value: 'right bottom' }
    ])
        .style(style)
    const anchorInput = new MultiInputs({ title: "Anchors", children: [anchorSelect] })


    const openActorEditor = new Button("Open in Actor Editor").style(buttonStyle)
    const reloadActor = new Button("Reload Actor").style(buttonStyle)

    const x = new Input("x", 'number').style({ borderLeft: '2px solid red', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const y = new Input("y", 'number').style({ borderLeft: '2px solid green', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const position = new MultiInputs({ title: "Position", children: [x, y] })

    const width = new Input("Width", 'text').style({ borderLeft: '1px solid #333', minWidth: '41px', maxWidth: '41px', padding: '3px 5px', })
    const height = new Input("Height", 'text').style({ borderLeft: '1px solid #333', minWidth: '41px', maxWidth: '41px', padding: '3px 5px', })
    const size = new MultiInputs({ title: "Size", children: [width, height] })


    const AutoResizeBool = new Bool().style({ border: '1px solid #333', margin: '5px', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', borderRadius: '5px' })
    const AutoResize = new MultiInputs({ title: "Auto Resize", children: [AutoResizeBool] })


    const pTop = new Input("Top", 'number').style({ color: '#ffffff', fontSize:'11px', border: '1px solid #333', minWidth: '41px', maxWidth: '41px', padding: '3px 5px', backgroundColor: '#111', borderRadius: '5px' })
    const pBottom = new Input("Bottom", 'number').style({ color: '#ffffff', fontSize:'11px', border: '1px solid #333', minWidth: '41px', maxWidth: '41px', padding: '3px 5px', backgroundColor: '#111', borderRadius: '5px' })
    const pcol1 = new Column({children:[pTop, pBottom]}).style({margin: '5px', gap: '5px'})

    const pRight = new Input("Right", 'number').style({ color: '#ffffff', fontSize:'11px', border: '1px solid #333', minWidth: '41px', maxWidth: '41px', padding: '3px 5px', backgroundColor: '#111', borderRadius: '5px' })
    const pLeft = new Input("Left", 'number').style({ color: '#ffffff', fontSize:'11px', border: '1px solid #333', minWidth: '41px', maxWidth: '41px', padding: '3px 5px', backgroundColor: '#111', borderRadius: '5px' })
    const pcol2 = new Column({children:[pRight, pLeft]}).style({margin: '5px', gap: '5px'})

    const padding = new MultiInputs({ title: "Padding", children: [pcol1, pcol2] })

    const z = new Input("offsetZ", 'number').style({ borderLeft: '1px solid #333', minWidth: '41px', maxWidth: '41px', padding: '3px 5px', })
    const offsetZ = new MultiInputs({ title: "offsetZ", children: [z] })


    const Anchors = new Panel({ title: "Anchors", children: [anchorInput, position, AutoResize, size, padding, offsetZ] })
        .style({
            margin: '5px',
            borderRadius: '4px',
            backgroundColor: '#222',
            gap: '5px'
        })

    const NormalColorInput = new Input("Color", 'color').style({ borderLeft: '1px solid #333', minWidth: '41px', maxWidth: '41px', padding: '3px 5px', })
    const NormalColor = new MultiInputs({ title: "Color", children: [NormalColorInput] })


    const test = [
        { name: 'none', value: 'file:///Users/sterlydolce/Documents/InfiniteEngine/UIEditor/gradient.png' },
        { name: 'texture 1', value: '/Users/sterlydolce/Documents/InfiniteEngine/UIEditor/bu.png' },
        { name: 'texture 2', value: '/Users/sterlydolce/Documents/InfiniteEngine/UIEditor/light.png' }
    ]



    const NormalMapInput = new ImageSelect().style({ border: '1px solid #333', backgroundColor: '#111', padding: '3px 5px', margin: '5px', borderRadius: '5px' })
    const NormalMap = new MultiInputs({ title: "Image", children: [NormalMapInput] })

    const NormalTranstarentInput = new Bool().style({ border: '1px solid #333', margin: '5px', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', borderRadius: '5px' })
    const NormalTranstarent = new MultiInputs({ title: "Transtarent", children: [NormalTranstarentInput] })

    const NormalCol = new Column({ children: [NormalColor, NormalMap, NormalTranstarent] })
    const Normal = new MultiInputs({ title: "Normal", children: [NormalCol] })



    const Style = new Panel({ title: "Style", children: [Normal] })
        .style({
            margin: '5px',
            borderRadius: '4px',
            backgroundColor: '#222',
            gap: '5px'
        })


    const ImageColorInput = new Input("Color", 'color').style({ borderLeft: '1px solid #333', minWidth: '41px', maxWidth: '41px', padding: '3px 5px', })
    const ImageColor = new MultiInputs({ title: "Color", children: [ImageColorInput] })

    const ImageMapInput = new ImageSelect(test).style({ border: '1px solid #333', backgroundColor: '#111', padding: '3px 5px', margin: '5px', borderRadius: '5px' })
    const ImageMap = new MultiInputs({ title: "Image", children: [ImageMapInput] })

    const ImageTranstarentInput = new Bool().style({ border: '1px solid #333', margin: '5px', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', borderRadius: '5px' })
    const ImageTranstarent = new MultiInputs({ title: "Transtarent", children: [ImageTranstarentInput] })




    const Image = new Panel({ title: "Style", children: [ImageColor, ImageMap, ImageTranstarent] })
        .style({
            margin: '5px',
            borderRadius: '4px',
            backgroundColor: '#222',
            gap: '5px'
        })




    const userFonts = []


    const TextInput = new Input("Text", 'text').style({ borderLeft: '1px solid #333', minWidth: '100px', maxWidth: '100px', padding: '3px 5px', })
    const text = new MultiInputs({ title: "Text", children: [TextInput] })

    const fontSelect = new Select([
        { name: 'Select a font family', icon: null, value: '' },
        { name: 'Arial', icon: null, value: 'Arial' },
        { name: 'Monospace', icon: null, value: 'monospace' },
        { name: 'System UI', icon: null, value: 'system-ui' },
        ...userFonts
    ])
        .style({ ...style, width: '65px' })
    const font = new MultiInputs({ title: "Font Weight", children: [fontSelect] })

    const TextColorInput = new Input("Color", 'color').style({ borderLeft: '1px solid #333', minWidth: '41px', maxWidth: '41px', padding: '3px 5px', })
    const TextColor = new MultiInputs({ title: "Color", children: [TextColorInput] })

    const fontSizeInput = new Input("Font Height", 'number').style({ borderLeft: '1px solid #333', minWidth: '40px', maxWidth: '40px', padding: '3px 5px', })
    const fontSize = new MultiInputs({ title: "Font Height", children: [fontSizeInput] })

    const fontWeightSelect = new Select([
        { name: 'Select a weight', icon: null, value: '' },
        { name: 'Normal', icon: null, value: 'normal' },
        { name: 'Bold', icon: null, value: 'bold' },
        { name: 'Bolder', icon: null, value: 'bolder' },
        { name: 'Lighter', icon: null, value: 'lighter' },

        { name: '100', icon: null, value: '100' },
        { name: '200', icon: null, value: '200' },
        { name: '300', icon: null, value: '300' },
        { name: '400', icon: null, value: '400' },
        { name: '500', icon: null, value: '500' },
        { name: '600', icon: null, value: '600' },
        { name: '700', icon: null, value: '700' },
        { name: '800', icon: null, value: '800' },
        { name: '900', icon: null, value: '900' },
    ])
        .style({ ...style, width: '65px' })
    const fontWeight = new MultiInputs({ title: "Font Weight", children: [fontWeightSelect] })

    const fontVariantSelect = new Select([
        { name: 'Select a variant', icon: null, value: '' },
        { name: 'Normal', icon: null, value: 'normal' },
        { name: 'Small', icon: null, value: 'small-caps' },
        { name: 'All Small', icon: null, value: 'all-small-caps' },

        { name: 'Petite', icon: null, value: 'petite-caps' },
        { name: 'All Petite', icon: null, value: 'all-petite-caps' },

        { name: 'Unicase', icon: null, value: 'unicase' },
        { name: 'Titling', icon: null, value: 'titling-caps' },

    ])
        .style({ ...style, width: '65px' })
    const fontVariant = new MultiInputs({ title: "Font Variant", children: [fontVariantSelect] })


    const fontStyleSelect = new Select([
        { name: 'Select a style', icon: null, value: '' },
        { name: 'Normal', icon: null, value: 'normal' },
        { name: 'Italic', icon: null, value: 'italic' },
        { name: 'Oblique', icon: null, value: 'oblique' },

    ])
        .style({ ...style, width: '65px' })
    const fontStyle = new MultiInputs({ title: "Font Variant", children: [fontStyleSelect] })


    const TeXt = new Panel({ title: "Text", children: [text, font, TextColor, fontSize, fontWeight, fontVariant, fontStyle] })
        .style({
            margin: '5px',
            borderRadius: '4px',
            backgroundColor: '#222',
            gap: '5px'
        })







    // waw
    const column = new Column({ children: [title, Anchors, Style, Image, TeXt] })
        .style({
            margin: '5px',
            borderRadius: '4px',
            backgroundColor: '#111',
        })
        .addToDom(container.element)
        .show(false)




    function update(objects) {

        const Textures = []
        const Meshes = []
        const Actors = []

        for (const name in engine.environment.store) {
            const object = engine.environment.get(name)
            if (object instanceof THREE.Texture) {
                object.value = object.filePath
                Textures.push(object)
            } else if (object instanceof THREE.Actor) {
                object.value = object.filePath
                Actors.push(object)
            } else if (object instanceof THREE.Mesh) {
                object.value = object.filePath
                Meshes.push(object)
            }
        }




        let object
        if (objects && objects[0]) object = objects[0]
        if (!object) {
            column.show(false)
            return
        }
        anchorSelect.setValue(object.anchor).onChanged = (value) => object.anchor = value

        x.setValue(object.x).onChanged = (value) => object.x = Number(value)
        y.setValue(object.y).onChanged = (value) => object.y = Number(value)

        width.setValue(object.percentWidth? object.percentWidth : object.width).onChanged = (value) => {
            if (object.percentWidth) {
                object.percentWidth = value
            } else {
                object.width = value
            }
        }
        height.setValue(object.percentHeight? object.percentHeight : object.height).onChanged = (value) => {
            if (object.percentHeight) {
                object.percentHeight = value
            } else {
                object.height = value
            }
            
        }

        if (object.autoResize !== undefined) {
            AutoResize.show(true)
            if (object.autoResize == true) {
                size.show(false)
                AutoResizeBool.setValue(object.autoResize).onChanged = (value) => object.autoResize = value
            } else {
                size.show(true)
            }
        } else {
            AutoResize.show(false)
            size.show(true)
        }

        if(object.padding){
            padding.show(true)
            pTop.setValue(object.padding.top).onChanged = (value)=> object.padding.top = Number(value)
            pRight.setValue(object.padding.right).onChanged = (value)=> object.padding.right = Number(value)
            pBottom.setValue(object.padding.bottom).onChanged = (value)=> object.padding.bottom = Number(value)
            pLeft.setValue(object.padding.left).onChanged = (value)=> object.padding.left = Number(value)
        } else{
            padding.show(false)
        }

        z.setValue(object.offsetZ).onChanged = (value) => object.offsetZ = Number(value)

        if (object.texture && object.texture.normal) {
            Style.show(true)


            NormalMapInput.setMenu(Textures)

            NormalColorInput.setValue(decimalToHex(object.texture.normal.color)).onChanged = (value) => object.texture.normal.color = value
            NormalMapInput.setValue(object.texture.normal.map.source.data.currentSrc).onChanged = (value) => object.setTextureSetting('normal', value, object.texture.normal.color);
            NormalTranstarentInput.setValue(object.material.transparent).onChanged = (value) => object.material.transparent = value

        } else {
            Style.show(false)
        }

        if (object.texture && object.texture.map) {
            Image.show(true)


            ImageMapInput.setMenu(Textures)

            ImageColorInput.setValue(decimalToHex(object.texture.color)).onChanged = (value) => object.texture.color = value
            ImageMapInput.setValue(object.texture.map.source.data.currentSrc).onChanged = (value) => object.setTextureSetting(value, object.texture.color);
            ImageTranstarentInput.setValue(object.material.transparent).onChanged = (value) => object.material.transparent = value

        } else {
            Image.show(false)
        }

        if (object.font) {
            TeXt.show(true)
            TextInput.setValue(object.text).onChanged = (value) => object.text = value
            fontSelect.setValue(object.font).onChanged = (value) => object.font = value
            TextColorInput.setValue(decimalToHex(object.color)).onChanged = (value) => object.color = value
            fontSizeInput.setValue(object.fontHeight).onChanged = (value) => object.fontHeight = value
            fontWeightSelect.setValue(object.weight).onChanged = (value) => object.weight = value
            fontVariantSelect.setValue(object.variant).onChanged = (value) => object.variant = value
            // fontStyleSelect.setValue(object.variant).onChanged = (value) => object.variant = value
            fontStyleSelect.show(false)
        } else {
            TeXt.show(false)
        }



        title.setText(object.name).show(object.name)




        column.show(true)
    }

    let objects

    engine.addEventListener('updateSelection', (e) => {
        objects = e.object
        update(objects)

    })

    engine.addEventListener('updateDetail', () => {
        update(objects)
    })
}



document.dispatchEvent(new CustomEvent('panelReady', {detail: {panel: renderDetails, title: 'IEuiDetails'}}))
