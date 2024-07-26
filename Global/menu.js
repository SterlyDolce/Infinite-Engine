import { addPointLight, CustomShortcut } from "../Core/Engine/command.js";
// import { scene as project } from "./Viewport.js";

const data = {
    name: 'Infinite Engine'
}


class Menu {
    constructor(menuId) {
        this.menu = document.getElementById(menuId);
        const version = document.createElement("p");
        version.className = "status-message";
        version.style.marginLeft = "auto";
        version.innerText = 'Beta';

        this.version = version


    }

    showVersion() {
        this.menu.insertBefore(this.version, null);
    }

    showWindowControlButtons() {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'window-controls';
        this.menu.insertBefore(controlsContainer, null);
    
        const closeButton = document.createElement('div');
        closeButton.className = 'window-button close';
        closeButton.addEventListener('click', () => {
            ipcRenderer.send('window-control', 'close');
        });
    
        const minimizeButton = document.createElement('div');
        minimizeButton.className = 'window-button minimize';
        minimizeButton.addEventListener('click', () => {
            ipcRenderer.send('window-control', 'minimize');
        });
    
        const maximizeButton = document.createElement('div');
        maximizeButton.className = 'window-button maximize';
        maximizeButton.addEventListener('click', () => {
            ipcRenderer.send('window-control', 'maximize');
        });
    
        controlsContainer.appendChild(closeButton);
        controlsContainer.appendChild(minimizeButton);
        controlsContainer.appendChild(maximizeButton);
    }

    addMenuItem(label, contextMenuContent) {
        const button = document.createElement('button');
        button.className = 'menu-bar-button';
        button.textContent = label;

        // Create a context menu
        const contextMenu = this.createContextMenu(contextMenuContent);

        button.addEventListener('click', (event) => {
            this.openContextMenu(event, contextMenu);
        });

        this.menu.appendChild(button);

        return contextMenu.children
    }

    addComplexMenuItem(parent, label, contextMenuContent) {
        const button = document.createElement('button');
        button.className = 'context-menu-button';
        button.textContent = label;

        // Create a context menu
        const contextMenu = this.createContextMenu(contextMenuContent);

        button.addEventListener('mouseover', (event) => {
            this.openChildContextMenu(event, contextMenu, parent, button);
        });

        parent.appendChild(button); // Use 'parent' to specify where to add the menu item
    }

    addTitleMenuItem(label) {
        const button = document.createElement('button');
        button.className = 'menu-bar-button name';
        button.textContent = label;
        this.menu.appendChild(button);
    }

    createContextMenu(contents) {
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';

        contents.forEach(content => {
            if (Array.isArray(content)) {
                this.addComplexMenuItem(contextMenu, content[0], content[1]);
            } else if (content === "?/") {
                const separator = document.createElement('vseparator');
                contextMenu.appendChild(separator);
            } else if (content.includes("?<")) {
                const menu = document.createElement('button');
                menu.disabled = true
                menu.className = 'context-menu-button';
                menu.innerHTML = content.replace("?<", "");
                contextMenu.appendChild(menu);
            }
            else {
                const menu = document.createElement('button');
                menu.className = 'context-menu-button';
                menu.id = content.replace(" ", "-")
                menu.innerHTML = content;

                menu.onpointerdown = (e) => {
                    MenuClicked(e)
                }
                contextMenu.appendChild(menu);
            }
        });
        return contextMenu;
    }

    openChildContextMenu(event, contextMenu, parent, button) {
        contextMenu.style.position = 'absolute';
        contextMenu.style.top = event.target.offsetTop + event.target.offsetHeight + 'px';
        contextMenu.style.left = parent.offsetLeft + parent.offsetWidth - 20 + 'px';

        let mouseInside = false;

        contextMenu.addEventListener('mouseenter', () => {
            mouseInside = true;
        });

        contextMenu.addEventListener('mouseleave', () => {
            mouseInside = false;
        });

        document.addEventListener('mousemove', (ev) => {
            if (ev.target !== button && ev.target !== contextMenu && !mouseInside) {
                contextMenu.remove();
            }
        });

        document.body.appendChild(contextMenu);
    }


    openContextMenu(event, contextMenu) {
        contextMenu.style.position = 'absolute';
        contextMenu.style.top = event.target.offsetTop + event.target.offsetHeight + 'px';
        contextMenu.style.left = event.target.offsetLeft + 'px';

        document.addEventListener('click', (e) => {
            if (e.target !== event.target) {
                contextMenu.remove();
                document.removeEventListener('click', this.closeContextMenu);
            }
        });

        document.body.appendChild(contextMenu);
    }
}

const menuBar = new Menu('menu-bar');

menuBar.addTitleMenuItem(data.name);

// Example context menu content for the "File" menu item
const fileContextMenuContent = [
    'New Project',
    ['New Map', [
        'Blank Scene',
        'Basic Scene',
    ]],
    ['New File', [
        'New Script',
        'New Component',
    ]],
    '?/',
    'Open File',
    'Open Project',
    '?/',
    'Save',
    'Export Selection',
    'Import',
    '?/',
    'Exit',
];

const editContextMenuContent = [
    'Undo',
    'Redo',
    '?/',
    'Cut',
    'Copy',
    'Past',
    '?/',
    ['Add', [
        'Empty',
        ['Object', [
            'Cube',
            'Capsule',
            'Circle',
            'Cylinder',
            'Ring',
            'Torus',
            'Sprite',
            'Text'
        ]],
        ['Lights', [
            'Spot Light',
            'Point Light',
            'Directional Light',
            'Ambient Light',
            'Hemisphere Light'
        ]],
        ['Cameras', [
            'Orthographic Camera',
            'Perspective Camera'
        ]]
    ]],
];

const combinedRunDebugMenuContent = [
    'Start Debuging',
    'Run Game',
    'Stop ?<',
    '?/',
    'Toggle Breakpoint',
    'Inspect Variables',
    '?/',
    'Console',
];

const viewContextMenuContent = [
    'Toggle Full Screen',
    'Show Grid',
    'Hide UI',
];

const windowContextMenuContent = [
    'Minimize',
    'Maximize',
    'Close',
];

const terminalContextMenuContent = [
    'New Terminal',
    'Close Terminal',
];

const helpContextMenuContent = [
    'Documentation',
    'Community Forum',
    `About ${data.name}`,
];



const fileMenu = menuBar.addMenuItem('File', fileContextMenuContent);
const editMenu = menuBar.addMenuItem('Edit', editContextMenuContent);
const runMenu = menuBar.addMenuItem('Run', combinedRunDebugMenuContent);
menuBar.addMenuItem('View', viewContextMenuContent);
menuBar.addMenuItem('Window', windowContextMenuContent);
menuBar.addMenuItem('Terminal', terminalContextMenuContent);
menuBar.addMenuItem('Help', helpContextMenuContent);
menuBar.showVersion()
menuBar.showWindowControlButtons()






function MenuClicked(e) {
    console.log()

    if (e.target.id == 'Cube') {
        const map = new THREE.TextureLoader().load('../light.png');
        // const material = new THREE.SpriteMaterial({ map: map });

        // const sprite = new THREE.Sprite(material);

        // console.log(engine)
        // console.log(sprite)


        const geometry = new THREE.SphereGeometry(15, 32, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const sphere = new THREE.Mesh(geometry, material)
        sphere.name = "sphere"


        engine.addObject(sphere, engine.mainScene.children[0])
        console.log(e.target.id)
    }


    switch (e.target.id) {
        case 'New-Project':
            engine.createNewProject()
            break;
    
        default:
            break;
    }
}



let shortcuts = new CustomShortcut();


shortcuts.addShortcut('Ctrl+ ', () => {
    engine.toggleContentBrowser()
});



