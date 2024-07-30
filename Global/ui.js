import * as THREE from '../three/build/three.module.js';

class UI {
    constructor() {
        this.IEui = true;
        this.element = document.createElement('div');

        this.element.addEventListener('mousedown', (e) => {
            e.stopPropagation()
        })

        this.element.onclick = (e) => {
            this.onClick(e)
        }

        this.element.oncontextmenu = (e) => {
            this.onContext(e)
        }

        this.element.onmouseenter = (e) => {
            this.onMouseEnter(e)
        }

        this.element.onmouseleave = (e) => {
            this.onMouseLeave(e)
        }

    }

    style(props) {
        for (const [key, value] of Object.entries(props)) {
            this.element.style[key] = value;
        }
        return this
    }

    addToDom(domElement) {
        domElement.appendChild(this.element);
        return this
    }

    show(bool) {
        this.element.style.display = bool ? 'flex' : 'none'
        return this
    }

    onClick(e) { }
    onContext(e) { }
    onMouseEnter(e) { }
    onMouseLeave(e) { }
}

class Column extends UI {
    constructor({ children }) {
        super({ children })
        this.element.style.display = 'flex'
        this.element.style.flexDirection = 'column'

        if (children) {
            children.forEach(child => {
                this.element.appendChild(child.element);
            });
        }
    }
}

class Row extends UI {
    constructor({ children }) {
        super({ children })
        this.element.style.display = 'flex'
        this.element.style.flexDirection = 'row'

        if (children) {
            children.forEach(child => {
                this.element.appendChild(child.element);
            });
        }
    }
}

class Label extends UI {
    constructor({ forElement, children }) {
        super({ children })
        this.element = document.createElement('label');
        this.element.htmlFor = forElement.element.id

        if (children) {
            children.forEach(child => {
                this.element.appendChild(child.element);
            });
        }
    }
}


class Text extends UI {
    constructor(text) {
        super()
        this.IEui = true;
        this.element = document.createElement('p');
        this.element.style.margin = '0px'

        this.element.innerText = text
    }

    setText(text) {
        this.element.innerText = text
        return this
    }
}

class Checkbox extends UI {
    constructor(id, value = true) {
        super()
        this.isInput = true
        this.IEui = true;
        this.element = document.createElement('input');
        this.element.type = 'checkbox'
        this.element.id = id
        this.element.style.margin = '0px'
        this.element.checked = value

        this.element.onchange = () => {
            this.onChanged(this.element.checked)
        }
    }

    setValue(value) {

        this.element.checked = value
        return this
    }

    getValue() {
        return this.element.checked
    }

    onChanged(value) {

    }
}

let inputId = 0

class Input extends UI {
    constructor(placeholder, type = 'text') {
        super()
        this.id = inputId++
        this.isInput = true
        this.type = type
        this.IEui = true;
        if(type == 'file'){
            this.input = document.createElement('input');
            this.input.style.display = 'none'
            this.input.type = type
            this.input.id = 'input'+this.id
            this.element = document.createElement('label');
            this.element.textContent = this.input.value || 'Select from file'
            this.element.htmlFor = 'input'+this.id
            this.element.style.margin = '0px'

            document.body.appendChild(this.input)
        
            this.input.onchange = () => {
                this.onChanged(this.input.value)
            }
        } else{
            this.element = document.createElement('input');
            this.element.type = type
            this.element.style.margin = '0px'
    
            this.element.placeholder = placeholder
    
            this.element.onchange = () => {
                this.onChanged(this.element.value)
            }
        }
        
    }

    setValue(value) {
        if (this.type === 'file') {
            this.element.textContent = value
            return this
        } else this.element.value = value
        return this
    }

    getValue() {
        if (this.type === 'file') return this.input.value
        return this.element.value
    }

    onChanged(value) {

    }
}


class MultiInputs extends UI {
    constructor({ title, children }) {

        super({ children })
        this.IEui = true;

        this.children = children

        this.element.style.display = 'flex'
        this.element.style.flexDirection = 'row'
        this.element.style.flexWrap = 'wrap'


        this.title = new Text(title)
            .style({
                fontSize: '11px',
                margin: '5px',
                marginLeft: '20px',
                marginRight: 'auto'
            })
            .addToDom(this.element)

        this.right = document.createElement('div')
        this.right.style.marginLeft = '20px'
        this.right.style.display = 'flex'
        this.element.appendChild(this.right)

        if (children) {
            children.forEach(child => {
                if (child.isInput) {
                    child.style({
                        margin: '5px',
                        backgroundColor: '#111',
                        borderRight: '1px solid #333',
                        // borderLeft: '1px solid #333',
                        fontSize: '11px',
                        borderTop: '1px solid #333',
                        borderBottom: '1px solid #333',
                        borderRadius: '5px',
                        color: 'white',
                        overFlow: 'hidden'
                    })
                }
                this.right.appendChild(child.element);
            });
        }

    }

    setTitle(text) {
        this.title.setText(text)
    }

    append(children) {
        if (children) {
            children.forEach(child => {
                if (child.isInput) {
                    child.style({
                        margin: '5px',
                        backgroundColor: '#111',
                        borderRight: '1px solid #333',
                        // borderLeft: '1px solid #333',
                        fontSize: '11px',
                        borderTop: '1px solid #333',
                        borderBottom: '1px solid #333',
                        borderRadius: '5px',
                        color: 'white',
                        overFlow: 'hidden'
                    })
                }
                this.right.appendChild(child.element);
            });
        }
    }
}


class Hr extends UI {
    constructor() {
        super()
        this.IEui = true;
        this.element = document.createElement('hr');
    }
}

class Panel extends UI {
    constructor({ title, children }) {
        super()
        this.element = document.createElement('div')
        this.element.style.display = 'flex'
        this.element.style.flexDirection = 'column'

        this.title = new Text(title)
            .style({
                fontSize: '11px',
                fontWeight: 'bold',
                margin: '0px',
                padding: '5px',
                backgroundColor: '#1e1e1e',
                borderRadius: '5px 5px 0px 0px'
            })
            .addToDom(this.element)
        new Hr(title)
            .style({
                border: 'none',
                // borderTop: "1px solid #333",
                margin: '5px',
                marginTop: '-5px'
            })
            .addToDom(this.element)


        if (children) {
            children.forEach(child => {
                this.element.appendChild(child.element);
            });
        }

    }

}

class MiniPreview extends UI {
    constructor() {
        super({});

        this.width = 75;
        this.height = 75;

        this.element.style.maxWidth = this.width + 'px';
        this.element.style.maxHeight = this.height + 'px';

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);

        this.geometry = new THREE.SphereGeometry(0.1, 16, 16);
        this.material = new THREE.MeshLambertMaterial({ color: 0xffffff });
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.width, this.height);
        this.element.appendChild(this.renderer.domElement);

        const light = new THREE.AmbientLight(0xaaaaaa); // soft white light
        this.scene.add(light);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(2, 3, 2);
        this.scene.add(directionalLight);

        this.camera.position.z = 3;
        this.camera.lookAt(this.mesh.position);

        this.animating = false;
    }

    render({ object = null, geometry = this.geometry, material = this.material }, animate = true) {
        this.element.style.maxWidth = this.width + 'px';
        this.element.style.maxHeight = this.height + 'px';
        this.renderer.setSize(this.width, this.height);


        // Clean up previous mesh if necessary
        if (this.mesh) {
            this.scene.remove(this.mesh);
            if (this.mesh.geometry) this.mesh.geometry.dispose();
            if (this.mesh.material) this.mesh.material.dispose();
        }

        if (object) {
            this.mesh = object;
        } else {
            this.mesh = new THREE.Mesh(geometry, material);
        }

        this.scene.add(this.mesh);

        const animatingCallback = () => {
            // Update camera to always view the object
            const box = new THREE.Box3().setFromObject(this.mesh);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = this.camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov / 2));

            cameraZ *= 3; // add some padding

            this.camera.position.z = cameraZ;
            this.camera.position.x = center.x;
            this.camera.position.y = center.y;
            this.camera.lookAt(center);

            // Update camera aspect ratio and projection matrix
            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();

            this.renderer.render(this.scene, this.camera);
        };

        if (animate) {
            // if (!this.animating) {
            this.renderer.setAnimationLoop(animatingCallback);
            this.animating = true;
            // }
        } else {
            // if (this.animating) {
            this.renderer.setAnimationLoop(null);
            this.animating = false;

            const canvas = this.renderer.domElement

            animatingCallback();

            return canvas.toDataURL('image/png')
            // }

        }
    }

    dispose() {
        // Clean up resources
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}


class Button extends UI {
    constructor(text = 'text', icon = null) {
        super()
        this.IEui = true;
        this.element = document.createElement('button');
        this.element.style.display = 'flex'
        this.element.style.gap = '5px'
        this.element.style.alignItems = 'center'
        this.element.style.justifyContent = 'center'
        this.element.style.margin = '0px'
        this.icon = icon

        this.iElement = document.createElement('ion-icon')
        this.element.appendChild(this.iElement)
        this.iElement.style.display = "none"

        if (this.icon) {
            this.iElement.style.display = "block"
            this.iElement.name = this.icon
        }


        this.text = document.createElement('span')
        this.element.appendChild(this.text)
        this.text.style.display = "none"

        if (text) {
            this.text.style.display = "block"
            this.text.textContent = text
        }






        this.element.onclick = (e) => {
            this.onClick(e)
        }
    }

    setText(text) {
        if (text) {
            this.text.style.display = "block"
            this.text.textContent = text
        }
        return this
    }

    setIcon(icon) {

        this.icon = icon

        if (this.icon) {
            this.iElement.style.display = "block"
            this.iElement.name = this.icon
        }
        return this
    }

    onClick(e) { }
}


class Select extends UI {
    constructor(menu = []) {
        super();

        this.element = document.createElement('div');
        this.element.className = "custom-select";
        // this.element.style.width = "100px";
        this.menu = menu;
        this.opened = false;
        this.styles = {};

        this.initializeSelect();
    }

    setMenu(menu) {
        this.menu = [{ name: 'select an item', value: '' }, ...menu];
        this.element.innerHTML = ''
        this.initializeSelect()
    }

    initializeSelect() {
        const selectElement = document.createElement("select");

        // Populate the select element with options
        this.menu.forEach(item => {
            const option = document.createElement("option");
            const span = document.createElement("span");

            if (item.icon) {
                const ion = document.createElement("ion-icon");
                ion.name = item.icon
                option.appendChild(ion)
            }
            option.appendChild(span)
            span.textContent = item.name;
            option.value = item.value
            selectElement.appendChild(option);
        });

        this.element.appendChild(selectElement);

        const selectedDiv = document.createElement("DIV");
        selectedDiv.className = "select-selected";
        selectedDiv.textContent = selectElement.options[selectElement.selectedIndex].textContent;
        this.element.appendChild(selectedDiv);

        const optionsDiv = document.createElement("DIV");
        optionsDiv.className = "select-items select-hide";

        for (let i = 1; i < selectElement.length; i++) {
            const optionDiv = document.createElement("DIV");
            optionDiv.textContent = selectElement.options[i].textContent;
            optionDiv.addEventListener("click", (e) => {
                this.optionSelected(e, selectElement, selectedDiv);
                this.onChanged(selectElement.value)
            });
            optionsDiv.appendChild(optionDiv);
        }

        this.element.appendChild(optionsDiv);

        selectedDiv.addEventListener("click", (e) => {
            e.stopPropagation();
            this.toggleSelectBox(selectedDiv, optionsDiv);
        });

        document.addEventListener("click", this.closeAllSelectBoxes);
        this.selectElement = selectElement
        this.selectedDiv = selectedDiv
    }

    optionSelected(event, selectElement, selectedDiv) {
        const clickedOption = event.target;
        selectElement.selectedIndex = Array.from(selectElement.options).findIndex(
            option => option.textContent === clickedOption.textContent
        );
        selectedDiv.textContent = clickedOption.textContent;

        const optionsDivs = this.element.querySelectorAll(".select-items div");
        optionsDivs.forEach(optionDiv => {
            optionDiv.classList.remove("same-as-selected");
        });
        clickedOption.classList.add("same-as-selected");

        this.toggleSelectBox(selectedDiv, clickedOption.parentNode);
    }

    toggleSelectBox(selectedDiv, optionsDiv) {
        this.closeAllSelectBoxes();
        optionsDiv.classList.toggle("select-hide");
        selectedDiv.classList.toggle("select-arrow-active");
    }

    closeAllSelectBoxes() {
        const allSelectItems = document.querySelectorAll(".select-items");
        const allSelectedItems = document.querySelectorAll(".select-selected");

        allSelectedItems.forEach(item => {
            item.classList.remove("select-arrow-active");
        });

        allSelectItems.forEach(item => {
            item.classList.add("select-hide");
        });
    }

    onChanged(value) { }

    setValue(value) {
        const selectElement = this.selectElement;
        const selectedDiv = this.selectedDiv;

        try {

            selectElement.value = value;
            selectedDiv.textContent = selectElement.options[selectElement.selectedIndex].textContent;

            const optionsDivs = this.element.querySelectorAll(".select-items div");
            optionsDivs.forEach(optionDiv => {
                optionDiv.classList.remove("same-as-selected");
                if (optionDiv.textContent === selectedDiv.textContent) {
                    optionDiv.classList.add("same-as-selected");
                }
            });
        } catch (error) {

        }


        return this;
    }
}


class ImageSelect extends UI {
    constructor(menu = []) {
        super();

        this.element = document.createElement('div');
        this.element.className = "custom-select";
        this.menu = menu;
        this.opened = false;
        this.styles = {};

        this.initializeSelect();
    }

    setMenu(menu) {
        this.menu = [{ name: 'select an item', value: '' }, ...menu];
        this.element.innerHTML = ''
        this.initializeSelect()
    }

    initializeSelect() {
        const selectElement = document.createElement("select");

        // Populate the select element with options
        this.menu.forEach(item => {
            const option = document.createElement("option");
            option.textContent = item.name;
            option.value = item.value;
            selectElement.appendChild(option);
        });

        this.element.appendChild(selectElement);

        const selectedDiv = document.createElement("DIV");
        selectedDiv.className = "select-selected selected-image";
        // selectedDiv.style.backgroundImage = `url(${selectElement.options[selectElement.selectedIndex].value})`;
        selectedDiv.style.backgroundSize = 'cover';
        this.element.appendChild(selectedDiv);

        const optionsDiv = document.createElement("DIV");
        optionsDiv.className = "select-items select-hide";


        for (let i = 1; i < selectElement.length; i++) {
            const optionDiv = document.createElement("DIV");
            optionDiv.style.display = 'flex'
            optionDiv.style.gap = '5px'

            const image = document.createElement('span')
            image.style.backgroundImage = `url(${selectElement.options[i].value})`;
            image.style.backgroundSize = 'cover';
            image.style.height = '25px'
            image.style.backgroundColor = 'black'
            image.style.flexShrink = 0
            image.style.aspectRatio = 1
            image.style.borderRadius = '5px'
            optionDiv.appendChild(image)

            const span = document.createElement('span')
            span.textContent = selectElement.options[i].textContent;
            span.style.alignContent = 'center'
            optionDiv.appendChild(span)

            optionDiv.addEventListener("click", (e) => {
                this.optionSelected(optionDiv, selectElement, selectedDiv);
                this.onChanged(selectElement.value);
            });
            optionsDiv.appendChild(optionDiv);
        }

        this.element.appendChild(optionsDiv);

        selectedDiv.addEventListener("click", (e) => {
            e.stopPropagation();
            this.toggleSelectBox(selectedDiv, optionsDiv);
        });

        document.addEventListener("click", this.closeAllSelectBoxes);

        this.selectElement = selectElement;
        this.selectedDiv = selectedDiv;
    }

    optionSelected(optionDiv, selectElement, selectedDiv) {
        const clickedOption = optionDiv
        selectElement.selectedIndex = Array.from(selectElement.options).findIndex(
            option => option.textContent === clickedOption.textContent
        );
        selectedDiv.style.backgroundImage = `url(${selectElement.options[selectElement.selectedIndex].value})`;

        const optionsDivs = this.element.querySelectorAll(".select-items div");
        optionsDivs.forEach(optionDiv => {
            optionDiv.classList.remove("same-as-selected");
        });
        clickedOption.classList.add("same-as-selected");

        this.toggleSelectBox(selectedDiv, clickedOption.parentNode);
    }

    toggleSelectBox(selectedDiv, optionsDiv) {
        this.closeAllSelectBoxes();
        optionsDiv.classList.toggle("select-hide");
        selectedDiv.classList.toggle("select-arrow-active");
    }

    closeAllSelectBoxes() {
        const allSelectItems = document.querySelectorAll(".select-items");
        const allSelectedItems = document.querySelectorAll(".select-selected");

        allSelectedItems.forEach(item => {
            item.classList.remove("select-arrow-active");
        });

        allSelectItems.forEach(item => {
            item.classList.add("select-hide");
        });
    }

    onChanged(value) { }

    setValue(value) {
        const selectElement = this.selectElement;
        const selectedDiv = this.selectedDiv;

        try {
            selectElement.value = value;
            selectedDiv.style.backgroundImage = `url(${value})`;

            const optionsDivs = this.element.querySelectorAll(".select-items div");
            optionsDivs.forEach(optionDiv => {
                optionDiv.classList.remove("same-as-selected");
                if (optionDiv.textContent === selectElement.options[selectElement.selectedIndex].textContent) {
                    optionDiv.classList.add("same-as-selected");
                }
            });
        } catch (error) {

        }

        return this;
    }
}


class Outliner extends UI {
    constructor(object, difference, options = { rowTemplate: {}, iconDiference: '', icons: {}, filter: {} }) {
        super();
        this.element = document.createElement('div');
        this.element.style.display = "flex"
        this.element.style.flexDirection = 'column'
        this.element.className = 'outliner';
        this.difference = difference
        this.iconDiference = options.iconDiference
        this.icons = options.icons
        this.rowTemplate = options.rowTemplate || {};
        this.filter = options.filter

        if (object) {
            this.setObject(object);
        }

    }

    addEventListener(type, callback = () => { }) {
        this.element.addEventListener(type, callback)
    }

    setObject(object) {
        this.object = object;
        this.update();
    }

    onSelect = (object) => {
    }

    selectObject(object) {

        try {
            if (object) {
                const selectedItem = this.element.querySelector(`[data-id="${object[this.difference]}"]`)
                this.element.querySelectorAll('.outline-item').forEach(items => {
                    items.classList.remove('selected')
                })

                selectedItem.classList.add('selected')

            }
        } catch (error) {

        }


    }

    focus(object) {
        const selectedItem = this.element.querySelector(`[data-id="${object[this.difference]}"]`)
        this.autoUncollapse(selectedItem)
        selectedItem.scrollIntoView()
    }

    autoUncollapse(object = new Element()) {
        const newObject = object.parentElement.parentElement
        newObject.style.display = 'flex'
        if (object.classList.contains('outline-item')) {
            this.autoUncollapse(newObject)
        }

    }


    update(newObject = this.object) {
        // Clear the current content
        this.element.innerHTML = '';

        this.object = newObject
        // Populate the element with object details based on the template
        this.createRows();
    }

    createRows() {
        const header = document.createElement('div')
        header.style.margin = '5px'
        header.style.display = 'flex'
        header.className = 'outline-item'


        for (const item in this.rowTemplate) {
            const span = document.createElement('span')
            span.style.flex = 1
            span.style.fontSize = "11px"
            span.textContent = item
            if (item == "Type") {
                span.style.textAlign = "end"
            }
            header.appendChild(span)
        }

        const headerHR = document.createElement('hr')
        headerHR.style.width = '100%'
        headerHR.style.border = "1px #333 solid"


        this.element.appendChild(header)
        this.element.appendChild(headerHR)
        this.createRow(this.object, this.element)
    }

    createRow(object, parentElem) {
        if (object) {
            const parent = document.createElement('div')
            // parent.style.margin = '5px'
            parent.style.display = 'flex'
            parent.style.flexDirection = 'column'


            const header = document.createElement('div')
            header.draggable = true
            header.style.padding = '5px'
            header.style.display = 'flex'
            header.style.alignItems = 'center'
            header.className = "outline-item"
            header.name = object.name
            header.setAttribute('data-id', object[this.difference])
            parent.appendChild(header)
            const value = object[this.difference]
            const selectEvent = new CustomEvent('onselect', { detail: { id: value } })

            header.onclick = () => {
                this.selectObject(object)
                this.element.dispatchEvent(selectEvent)
            }

            header.addEventListener('dragstart', (e) => {
                localStorage.setItem('adding', JSON.stringify(object))
                e.dataTransfer.setData('data', JSON.stringify([object.name, object.type]))
            })

            const caret = document.createElement('ion-icon')
            caret.style.paddingRight = '5px'
            caret.style.cursor = 'pointer'
            caret.name = 'caret-down'
            caret.style.display = 'none'
            header.appendChild(caret)


            const icon = document.createElement('ion-icon')
            icon.style.paddingRight = '5px'
            icon.style.cursor = 'pointer'
            icon.style.fontSize = '18px'

            icon.style.display = 'none'
            header.appendChild(icon)

            if (object[this.iconDiference] && this.icons[object[this.iconDiference]]) {
                const iconName = this.icons[object[this.iconDiference]]
                icon.name = iconName[0]
                icon.style.color = iconName[1] || '#ffffff'
                icon.style.display = 'flex'
            }



            for (const item in this.rowTemplate) {
                const span = document.createElement('span')
                span.style.flex = 1
                span.style.fontSize = "11px"
                span.textContent = object[this.rowTemplate[item]]
                if (item == "Type") {
                    span.style.textAlign = "end"
                }
                header.appendChild(span)
            }

            const childContainer = document.createElement('div')
            childContainer.name = object.name + 'collapsable-item'
            childContainer.style.paddingLeft = "20px"
            childContainer.style.display = 'flex'
            childContainer.style.flexDirection = 'column'

            let isCollapsed = false

            caret.onclick = (e) => {
                e.stopPropagation()
                if (isCollapsed) {
                    caret.name = 'caret-down'
                    childContainer.style.display = 'flex'
                    isCollapsed = false
                } else {
                    childContainer.style.display = 'none'
                    isCollapsed = true
                    caret.name = 'caret-forward'
                }
            }

            if (object.children) {
                let filtered = object.children.filter(child => child.type !== 'Appearances');

                if (this.filter && object.children) {
                    filtered = []
                    object.children.forEach(child => {
                        // Check if each filter property exists and matches
                        Object.keys(this.filter).every(key => {
                            if (child[key] === this.filter[key]) {
                                filtered.push(child)
                            }
                        });
                    });

                }

                if (filtered && filtered.length > 0) {
                    parent.appendChild(childContainer);
                    filtered.forEach(child => {
                        if (child.name) {
                            caret.style.display = 'block';
                            this.createRow(child, childContainer);
                        }
                    });
                }
            }





            parentElem.appendChild(parent)
        }
    }
}


class Breadcrumbs extends UI {
    constructor(breadcrumbs = []) {
        super();
        this.breadcrumbs = breadcrumbs;
        this.element = document.createElement('div');
        this.element.className = 'breadcrumbs';
        this.element.style.display = "flex"
        this.element.style.alignItems = 'center'
        this.basePath = ''
        this.render();
    }

    setBasePath(path) {
        this.basePath = path
    }

    render() {
        this.element.innerHTML = ``
        const ul = document.createElement('ul');
        ul.style.padding = '0px';
        ul.style.margin = '0px'
        ul.style.alignItems = 'center'
        ul.style.display = 'flex'


        this.breadcrumbs.forEach((breadcrumb, index) => {
            const li = document.createElement('button');
            li.className = 'hoverSoft'
            li.style.backgroundColor = 'transparent'
            li.style.border = 'none'
            li.style.display = 'flex'
            li.style.alignItems = 'center'
            li.style.justifyContent = 'center'
            li.style.color = 'white'
            li.style.margin = '0px'
            li.style.padding = '5px'
            li.style.borderRadius = '5px'
            li.style.gap = '5px'
            const a = document.createElement('span');
            a.style.textDecoration = 'none'
            a.style.fontSize = '11px'
            a.textContent = breadcrumb.name;
            li.appendChild(a);

            li.onclick = () => {

                const pathList = this.breadcrumbs.map(item => item.name)
                const newPath = pathList.slice(0, index + 1).join('/')

                const returnPath = this.basePath + '/' + newPath
                this.onClick(returnPath)
            }

            if (index < this.breadcrumbs.length - 1) {
                const separator = document.createElement('ion-icon');
                separator.name = 'chevron-forward';
                li.appendChild(separator);
            }

            ul.appendChild(li);
        });

        this.element.appendChild(ul);
    }
    update(breadcrumbs) {
        this.breadcrumbs = breadcrumbs
        this.render()
    }
}

class ContextMenu extends UI {
    constructor(menu = []) {
        super();
        this.element = document.createElement('div');
        this.element.style.zIndex = 1000
        this.element.style.display = 'flex';
        this.element.style.flexDirection = 'column';
        this.element.style.backgroundColor = '#111';
        this.element.style.border = "1px solid #333";
        this.element.style.borderRadius = "5px";
        this.element.style.padding = '5px';
        this.element.style.minWidth = '100px';
        this.element.style.position = 'absolute'

        this.target = null

        this.submenu = null
        this.menu = menu;
        this.update(menu);
    }

    update(menu) {
        this.element.innerHTML = ''; // Clear existing content

        this.createMenus(this.element, menu);
    }

    createMenus(parent, menu) {
        menu.forEach(item => {
            if (item.type === "separator") {
                const separator = document.createElement('div');
                separator.style.borderTop = item.style;
                separator.style.margin = '5px 0';
                parent.appendChild(separator);
            } else {
                const menuItem = document.createElement('div');
                menuItem.style.fontSize = '11px'
                menuItem.className = 'hoverSoft'
                menuItem.textContent = item.name;
                menuItem.style.cursor = 'pointer';
                menuItem.style.padding = '5px';
                menuItem.style.color = '#eee';

                menuItem.addEventListener('click', () => {
                    if (item.action && typeof item.action === 'function') {
                        item.action({ target: this.target, name: item.name });
                        this.close();
                    }
                });

                if (item.items) {
                    menuItem.onmouseenter = () => {
                        // Recursively create submenu
                        this.submenu = new ContextMenu(item.items);
                        this.submenu.open(this.target, this.element.offsetLeft + menuItem.offsetWidth, this.element.offsetTop + menuItem.offsetTop);
                    }
                }

                parent.appendChild(menuItem);
            }
        });
    }

    open(target, x, y) {
        this.target = target
        this.element.style.top = y + 'px';
        this.element.style.left = x + 'px';
        document.body.appendChild(this.element);

        // Close the menu when clicking outside of it
        document.addEventListener('click', this.handleOutsideClick);
        this.element.addEventListener('mouseleave', this.handleOutsideClick)
    }

    close() {
        document.removeEventListener('click', this.handleOutsideClick);
        if (document.body.contains(this.element)) {
            this.element.removeEventListener('mouseleave', this.handleOutsideClick)
            document.body.removeChild(this.element);
        }

    }

    handleOutsideClick = (event) => {
        if (!this.element.contains(event.target)) {
            if (this.submenu && !this.submenu.element.contains(event.target)) {
                this.close();
                this.submenu.close()

            } else {
                this.close()
            }
        }
    }
}


class GridContent extends UI {
    constructor(array, difference, options = { iconDiference: '', defaultIcon, icons: {}, type: () => { }, contextMenu: {} }) {
        super()
        this.element = document.createElement('div')
        this.element.style.display = 'flex'
        this.element.style.flexWrap = 'wrap'
        this.element.style.alignItems = 'stretch'
        this.element.style.justifyContent = 'flex-start'
        this.element.style.flexDirection = 'row'
        this.element.style.alignContent = 'flex-start'
        this.element.style.padding = '5px'
        this.array = array
        this.difference = difference
        this.iconDiference = options.iconDiference
        this.icons = options.icons
        this.defaultIcon = options.defaultIcon
        this.type = options.type
        this.contextMenu = options.contextMenu
        this.context = new ContextMenu(this.contextMenu)
        this.contents = []


        this.selectObjects = []

        this.update(this.array)
    }

    addEventListener(type, callback = () => { }) {
        this.element.addEventListener(type, callback)
    }

    onSelect = (object) => {
    }

    selectObject(object, multiple = false) {
        if (object) {

            if (!multiple) {
                this.element.querySelectorAll('.outline-item').forEach(items => {
                    items.classList.remove('selected')
                })
                this.selectObjects = [object]
                const selectedItem = this.element.querySelector(`[data-id="${object[this.difference]}"]`)
                if (selectedItem) selectedItem.classList.add('selected')
            } else {
                if (this.selectObjects.includes(object)) {
                    this.selectObjects = this.selectObjects.filter(item => item !== object)
                    const selectedItem = this.element.querySelector(`[data-id="${object[this.difference]}"]`)
                    if (selectedItem) selectedItem.classList.add('selected')
                } else {
                    this.selectObjects.push(object)
                    const selectedItem = this.element.querySelector(`[data-id="${object[this.difference]}"]`)
                    if (selectedItem) selectedItem.classList.add('selected')
                }
            }
        }

    }

    update(array) {
        this.array = array
        // Clear the current content
        this.element.innerHTML = '';

        // Populate the element with object details based on the template
        this.createRows();
    }

    createRows() {
        this.array.forEach((element, index) => {
            const container = document.createElement('div')
            container.className = 'outline-item'
            container.draggable = true
            container.style.display = "flex"
            container.style.overflow = 'hidden'
            container.style.flexDirection = 'column'
            container.style.minWidth = '100px'
            container.style.width = '25px'
            container.style.borderRadius = '5px'
            container.style.backgroundColor = '#111'

            container.setAttribute('data-id', element[this.difference])

            container.addEventListener('dragstart', (ev) => {
                if (this.selectObjects.length <= 1) {
                    ev.dataTransfer.setData("data", JSON.stringify([element]));
                } else {
                    ev.dataTransfer.setData("data", JSON.stringify(this.selectObjects));
                }

            })


            container.onclick = (e) => {
                if (e.shiftKey) {
                    this.selectObject(element, true)
                    const value = this.selectObjects.map(item => item[this.difference])
                    const selectEvent = new CustomEvent('onselect', { detail: { id: value } })
                    this.element.dispatchEvent(selectEvent)
                } else {
                    this.selectObject(element)
                    const value = this.selectObjects[0] ? [this.selectObjects[0][this.difference]] : []
                    const selectEvent = new CustomEvent('onselect', { detail: { id: value } })
                    this.element.dispatchEvent(selectEvent)
                }

            }

            container.oncontextmenu = (e) => {
                e.stopPropagation()
                if (this.selectObjects.length === 0) {
                    this.context.open([element], e.x, e.y)
                } else {
                    this.context.open(this.selectObjects, e.x, e.y)
                }
            }

            const previewRender = document.createElement('div')
            previewRender.style.width = "100%"
            previewRender.style.display = 'flex'
            previewRender.style.alignItems = 'center'
            previewRender.style.justifyContent = 'center'
            previewRender.style.aspectRatio = 1
            previewRender.style.backgroundColor = '#111'
            previewRender.style.borderBottom = '2px solid gray'
            previewRender.style.backgroundSize = 'cover'
            container.appendChild(previewRender)

            const icon = document.createElement('ion-icon')
            icon.style.paddingRight = '5px'
            icon.style.cursor = 'pointer'
            icon.style.fontSize = '64px'
            icon.style.display = 'none'



            icon.name = this.defaultIcon[0] || 'folder-open'
            icon.style.color = this.defaultIcon[1] || '#efb507'
            icon.style.display = 'flex'
            previewRender.style.borderColor = this.defaultIcon[1] || '#efb507'
            if (element.type == 'file') {
                icon.name = 'document'
                icon.style.color = '#83bce8'
                icon.style.display = 'flex'
                previewRender.style.borderColor = '#83bce8'
            }

            previewRender.appendChild(icon)



            if (element[this.iconDiference] && this.icons[element[this.iconDiference]]) {

                if (typeof this.icons[element[this.iconDiference]] === 'function') {
                    const existingIcon = localStorage.getItem(element.name)
                    if (existingIcon && JSON.parse(existingIcon)[0]) {
                        const iconPrev = JSON.parse(existingIcon)
                        previewRender.style.borderColor = iconPrev[1]
                        previewRender.innerHTML = ''
                        previewRender.style.backgroundImage = `url(${iconPrev[0].replace(/\\/g, '/')}`
                    } else {
                        const iconPrev = this.icons[element[this.iconDiference]]({ ...element, index })
                        // localStorage.setItem(element.name, JSON.stringify(iconPrev))
                        previewRender.style.borderColor = iconPrev[1]
                        previewRender.innerHTML = ''
                        previewRender.style.backgroundImage = `url(${iconPrev[0].replace(/\\/g, '/')}`
                        previewRender.style.backgroundSize = '100% 100%'
                    }
                } else {
                    const iconName = this.icons[element[this.iconDiference]]
                    icon.name = iconName[0]
                    icon.style.color = iconName[1] || '#ffffff'
                    previewRender.style.borderColor = iconName[1]
                    icon.style.display = 'flex'
                }
            }


            const title = document.createElement('span')
            title.className = 'line-clamp'
            title.style.margin = '5px'
            title.style.fontSize = '11px'
            title.textContent = element.name
            container.appendChild(title)


            if (this.type) {
                const type = document.createElement('span')
                type.style.margin = '5px'
                type.style.fontSize = '10px'
                type.style.opacity = 0.5
                type.textContent = this.type(element)
                container.appendChild(type)
            }




            const content = { ...element, element: container, preview: previewRender }

            this.contents.push(content)

            this.element.appendChild(container)

        });
    }
}


class Modal extends UI {
    constructor() {
        super();
        this.element = document.createElement('div');

        this.background = new UI();
        this.background.element = document.createElement('div');
        this.background.style({
            position: "absolute",
            top: '0px',
            left: '0px',
            height: '100vh',
            width: '100vw',
            zIndex: 99,
            backgroundColor: '#000000ee'
        }).addToDom(document.body);

        this.style({
            position: "absolute",
            top: "50vh",
            left: "50vw",
            transform: "translate(-50%, -50%)",
            backgroundColor: '#222',
            borderRadius: '5px',
            border: '1px solid #333',
            zIndex: 100,
            minWidth: '500px',
            minHeight: '200px',
            padding: '20px',
            color: '#fff'
        });

        this.addToDom(document.body);
    }

    close() {
        if (this.background.element && this.background.element.parentNode) {
            this.background.element.parentNode.removeChild(this.background.element);
        }
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}


class InputModal extends Modal {
    constructor(placeholder) {
        super()

        this.input = new Input(placeholder)
            .style({
                padding: '5px',
                borderRadius: '5px',
                border: '1px solid #333',
                backgroundColor: '#111',
                color: 'white',
                fontSize: '11px',
                width: '200px'
            })
            .addToDom(this.element)


        this.button = new Button('Done')
            .style({
                padding: '5px',
                borderRadius: '5px',
                border: '1px solid #333',
                backgroundColor: '#09f',
                color: 'white',
                fontSize: '11px'
            })
            .addToDom(this.element)
            .onClick = () => {
                this.onFinished(this.input.getValue())
                this.close()
            }

        this.style({
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            justifyContent: 'center',
            alignItems: 'center',
            minWidth: 'unset',
            minHeight: 'unset'
        })

        this.background.element.onclick = () => this.close()
    }

    onFinished(value) {
        consol.log(value)
    }
}

class Bool extends UI {
    constructor() {
        super()
        this.element = document.createElement('label');
        this.element.className = 'switch';

        this.input = document.createElement('input');
        this.input.type = 'checkbox';

        this.slider = document.createElement('span');
        this.slider.className = 'slider';

        this.element.appendChild(this.input);
        this.element.appendChild(this.slider);

        this.input.onchange = () => this.onChanged(this.getValue())
    }

    getValue() {
        return this.input.checked;
    }

    setValue(bool) {
        this.input.checked = bool;
        return this
    }

    onChanged(value) { }

    addTo(parent) {
        parent.appendChild(this.element);
    }
}




class PieMenu extends UI {
    constructor(radius) {
        super();
        this.element = document.createElement('div');
        this.element.id = 'Pi';
        this.options = [];
        this.radius = radius;   // radius of the pie menu
        this.angleStep = 0;     // angle between each option, calculated on show
        this.selectedOption = null;

        const svg = document.getElementById('plSVG');
        svg.addEventListener('mousedown', (e)=>{
            if(e.buttons == 2){
                this.back()
            }
        })

        this.line = document.getElementById('PieLine');

        this.endX = 0;
        this.endY = 0;

        this.navigationStack = []; // Stack to store previous menu states
    }

    createMenu() {
        this.element.innerHTML = '';
        this.options.forEach((option, index) => {
            let angle = index * this.angleStep;
            let x = this.centerX + this.radius * Math.cos(angle);
            let y = this.centerY + this.radius * Math.sin(angle);
            let optionElement = this.createOptionElement(option, x, y);
            this.element.appendChild(optionElement);
        });
    }

    createOptionElement(option, x, y) {
        option.uuid = THREE.generateUUID();
        let element = document.createElement('div');
        element.className = 'pie-menu-option';
        element.style.position = 'absolute';
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.innerText = option.label;
        element.style.zIndex = 1234567890;
        element.onmouseenter = () => {
            if(option.action && typeof option.action == 'function'){
                this.selectedOption = option;
                document.querySelectorAll('.pie-menu-option').forEach(option => {
                    option.classList.remove('selectedPie');
                });
                element.classList.add('selectedPie');
            }

            if(option.items && option.items.length > 0){
                this.navigationStack.push(this.options);
                this.showSubmenu(option, element);
            }
        };
        option.element = element;
        return element;
    }

    showSubmenu(option, element) {
        const bbox = element.getBoundingClientRect();
        const centerX = bbox.x + bbox.width / 2;
        const centerY = bbox.y + bbox.height / 2;
        this.clearSelection();
        this.hide();
        this.show(centerX, centerY, [
            {label: 'Back', action: () => this.back()},
            ...option.items
        ]);
    }

    back() {
        if (this.navigationStack.length > 0) {
            const previousOptions = this.navigationStack.pop();
            this.hide();
            this.show(this.centerX, this.centerY, previousOptions);
        }
    }

    show(centerX, centerY, options = this.options) {
        if (options.length === 0) return;
        this.options = options; // array of menu options
        this.centerX = centerX; // center X coordinate
        this.centerY = centerY; // center Y coordinate
        this.angleStep = 2 * Math.PI / options.length;
        if (document.getElementById('plSVG')) document.getElementById('plSVG').style.display = 'block';
        this.line = document.getElementById('PieLine');
        this.line.setAttribute('x1', centerX);
        this.line.setAttribute('y1', centerY);
        this.createMenu();
        document.body.appendChild(this.element);
    }

    hide() {
        if (this.selectedOption) {
            if (this.selectedOption.action) this.selectedOption.action();
            this.selectedOption = null;
        }

        if (document.getElementById('Pi')) document.getElementById('Pi').remove();
        if (document.getElementById('plSVG')) document.getElementById('plSVG').style.display = 'none';
    }

    update(x, y) {
        this.endX = x;
        this.endY = y;

        if (x - this.centerX < 50 && y - this.centerX < 50) this.clearSelection();
    }

    clearSelection() {
        document.querySelectorAll('.pie-menu-option').forEach(option => {
            option.classList.remove('selectedPie');
        });
        this.selectedOption = null;
    }
}




export {
    UI,
    Column,
    Row,
    Text,
    Panel,
    Hr,
    Input,
    Button,
    MultiInputs,
    MiniPreview,
    Outliner,
    Breadcrumbs,
    GridContent,
    ContextMenu,
    Select,
    Modal,
    InputModal,
    Bool,
    ImageSelect,
    Label,
    Checkbox,
    PieMenu
}
