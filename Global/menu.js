import * as COMMAND from "../Core/Engine/command.js";
import * as THREE from "../three/build/three.module.js";
import { PieMenu } from "./ui.js";

let shortcuts = new COMMAND.CustomShortcut();

const data = {
    name: 'Infinite Engine'
}

class Menu {
    constructor(menuId) {
        this.menu = document.getElementById(menuId);
        this.version = this.createVersionElement();
    }

    createVersionElement() {
        const version = document.createElement("p");
        version.className = "status-message";
        version.style.marginLeft = "auto";
        version.innerText = 'Beta';
        return version;
    }

    showVersion() {
        this.menu.insertBefore(this.version, null);
    }

    showWindowControlButtons() {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'window-controls';

        ['close', 'minimize', 'maximize'].forEach(action => {
            const button = this.createControlButton(action);
            controlsContainer.appendChild(button);
        });

        this.menu.appendChild(controlsContainer);
    }

    createControlButton(action) {
        const button = document.createElement('div');
        button.className = `window-button ${action}`;
        button.addEventListener('click', () => {
            ipcRenderer.send('window-control', action);
        });
        return button;
    }

    addMenuItem(label, contextMenuContent) {
        const button = document.createElement('button');
        button.className = 'menu-bar-button';
        button.textContent = label;

        const contextMenu = this.createContextMenu(contextMenuContent);
        button.addEventListener('click', (event) => {
            this.openContextMenu(event, contextMenu);
        });

        this.menu.appendChild(button);
        return contextMenu.children;
    }

    addComplexMenuItem(parent, label, contextMenuContent) {
        const button = document.createElement('button');
        button.className = 'context-menu-button';
        button.textContent = label;

        const contextMenu = this.createContextMenu(contextMenuContent);
        button.addEventListener('mouseover', (event) => {
            this.openChildContextMenu(event, contextMenu, parent, button);
        });

        parent.appendChild(button);
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
                const menu = this.createDisabledMenuButton(content.replace("?<", ""));
                contextMenu.appendChild(menu);
            } else {
                const menu = this.createMenuButton(content);
                contextMenu.appendChild(menu);
            }
        });

        return contextMenu;
    }

    createDisabledMenuButton(content) {
        const menu = document.createElement('button');
        menu.disabled = true;
        menu.className = 'context-menu-button';
        menu.innerHTML = content;
        return menu;
    }

    createMenuButton(content) {
        const menu = document.createElement('button');
        menu.className = 'context-menu-button';
        menu.id = content.replace(" ", "-");
        menu.innerHTML = content;
        menu.addEventListener('pointerdown', (e) => {
            MenuClicked(e);
        });
        return menu;
    }

    openChildContextMenu(event, contextMenu, parent, button) {
        contextMenu.style.position = 'absolute';
        contextMenu.style.top = `${parent.offsetTop + event.target.offsetTop}px`;
        contextMenu.style.left = `${parent.offsetLeft + parent.offsetWidth - 20}px`;

        let mouseInside = false;
        contextMenu.addEventListener('mouseenter', () => { mouseInside = true; });
        contextMenu.addEventListener('mouseleave', () => { mouseInside = false; });

        document.addEventListener('mousemove', (ev) => {
            if (ev.target !== button && ev.target !== contextMenu && !mouseInside) {
                contextMenu.remove();
            }
        });

        document.body.appendChild(contextMenu);
    }

    openContextMenu(event, contextMenu) {
        contextMenu.style.position = 'absolute';
        contextMenu.style.top = `${event.target.offsetTop + event.target.offsetHeight}px`;
        contextMenu.style.left = `${event.target.offsetLeft}px`;

        const closeContextMenu = (e) => {
            if (e.target !== event.target) {
                contextMenu.remove();
                document.removeEventListener('click', closeContextMenu);
            }
        };

        document.addEventListener('click', closeContextMenu);
        document.body.appendChild(contextMenu);
    }
}

const menuBar = new Menu('menu-bar');
menuBar.addTitleMenuItem(data.name);

// Example context menu content for the "File" menu item
const fileContextMenuContent = [
    'New Project',
    ['New Map', ['Blank Scene', 'Basic Scene']],
    ['New File', ['New Script', 'New Actor']],
    '?/',
    'Open Project',
    '?/',
    'Save',
    'Save as',
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
    'Paste',
    '?/',
    ['Add', [
        'Empty',
        ['Object', ['Cube', 'Capsule', 'Circle', 'Cylinder', 'Ring', 'Torus', 'Sprite', 'Text']],
        ['Lights', ['Spot Light', 'Point Light', 'Directional Light', 'Ambient Light', 'Hemisphere Light']],
        ['Cameras', ['Orthographic Camera', 'Perspective Camera']]
    ]],
];

const combinedRunDebugMenuContent = [
    'Start Debugging',
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

menuBar.addMenuItem('File', fileContextMenuContent);
menuBar.addMenuItem('Edit', editContextMenuContent);
menuBar.addMenuItem('Run', combinedRunDebugMenuContent);
menuBar.addMenuItem('View', viewContextMenuContent);
menuBar.addMenuItem('Window', windowContextMenuContent);
menuBar.addMenuItem('Terminal', terminalContextMenuContent);
menuBar.addMenuItem('Help', helpContextMenuContent);

menuBar.showVersion();
menuBar.showWindowControlButtons();

const _DefaultMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeee });

function MenuClicked(e) {
    switch (e.target.id) {
        // File
        case 'New-Project':
            engine.createNewProject();
            break;
        case 'Open-Project':
            engine.openNewProject();
            break;
        case 'Save':
            engine.saveCurrentProject();
        case 'Save-as':
            engine.saveCurrentProject();
            break;
        case 'Export-Selection':
            engine.exportSelection();
            break;
        case 'Import':
            engine.importFile();
            break;
        case 'Exit':
            engine.exitApplication();
            break;

        // Edit
        case 'Undo':
            engine.stateManager.undo();
            break;
        case 'Redo':
            engine.stateManager.redo();
            break;
        case 'Cut':
            engine.cut();
            break;
        case 'Copy':
            engine.copy();
            break;
        case 'Paste':
            engine.paste();
            break;

        // Add
        case 'Cube':
            if (engine.activeScene) {
                engine.addObject(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), _DefaultMaterial), engine.activeScene.children[0]);
            }
            break;
        case 'Sphere':
            if (engine.activeScene) {
                engine.addObject(new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), _DefaultMaterial), engine.activeScene.children[0]);
            }
            break;

        // Run/Debug
        case 'Start-Debugging':
            engine.startDebugging();
            break;
        case 'Run-Game':
            engine.play();
            break;
        case 'Stop-Debugging':
            engine.stopDebugging();
            break;
        case 'Toggle-Breakpoint':
            engine.toggleBreakpoint();
            break;
        case 'Inspect-Variables':
            engine.inspectVariables();
            break;
        case 'Console':
            engine.showConsole();
            break;

        // View
        case 'Toggle-Full-Screen':
            engine.toggleFullScreen();
            break;
        case 'Show-Grid':
            engine.showGrid();
            break;
        case 'Hide-UI':
            engine.hideUI();
            break;

        // Window
        case 'Minimize':
            ipcRenderer.send('window-control', 'minimize');
            break;
        case 'Maximize':
            ipcRenderer.send('window-control', 'maximize');
            break;
        case 'Close':
            ipcRenderer.send('window-control', 'close');
            break;

        // Terminal
        case 'New-Terminal':
            engine.createNewTerminal();
            break;
        case 'Close-Terminal':
            engine.closeTerminal();
            break;

        // Help
        case 'Documentation':
            window.open('https://your-documentation-url.com', '_blank');
            break;
        case 'Community-Forum':
            window.open('https://your-community-forum-url.com', '_blank');
            break;
        case 'About':
            alert(`About ${data.name}`);
            break;

        default:
            console.log(`No action defined for ${e.target.id}`);
            break;
    }
}




shortcuts.addShortcut('Ctrl+ ', () => {
    engine.toggleContentBrowser();
});

shortcuts.addShortcut('Ctrl+n', () => {
    engine.createNewProject();
});

shortcuts.addShortcut('Ctrl+o', () => {
    engine.openNewProject();
});

shortcuts.addShortcut('Ctrl+s', () => {
    engine.saveCurrentFile();
});

shortcuts.addShortcut('Ctrl+e', () => {
    engine.exportSelection();
});

shortcuts.addShortcut('Ctrl+i', () => {
    engine.importFile();
});

shortcuts.addShortcut('Ctrl+q', () => {
    engine.exitApplication();
});

shortcuts.addShortcut('Ctrl+z', () => {
    engine.stateManager.undo();
});

shortcuts.addShortcut('Ctrl+Shift+z', () => {
    engine.stateManager.redo();
});

shortcuts.addShortcut('Ctrl+x', () => {
    engine.cut();
});

shortcuts.addShortcut('Ctrl+c', () => {
    engine.copy();
});

shortcuts.addShortcut('Ctrl+v', () => {
    engine.paste();
});

shortcuts.addShortcut('F5', () => {
    engine.runGame();
});

shortcuts.addShortcut('F9', () => {
    engine.toggleBreakpoint();
});

shortcuts.addShortcut('F10', () => {
    engine.startDebugging();
});

shortcuts.addShortcut('F11', () => {
    engine.stopDebugging();
});

shortcuts.addShortcut('F12', () => {
    engine.showConsole();
});

shortcuts.addShortcut('Alt+Enter', () => {
    engine.toggleFullScreen();
});

shortcuts.addShortcut('Ctrl+g', () => {
    engine.showGrid();
});

shortcuts.addShortcut('Ctrl+Shift+u', () => {
    engine.hideUI();
});







shortcuts.addShortcut(' ', () => {
    document.dispatchEvent(new CustomEvent('openPie'));
}, () => {
    document.dispatchEvent(new CustomEvent('closePie'));
});

let pieMenu = new PieMenu(100); // Example radius of 100
let me = [
    { label: 'Option 1', action: () => console.log('Option 1 selected') },
    { label: 'Option 2', action: () => console.log('Option 2 selected') },
    { label: 'Option 3', action: () => console.log('Option 3 selected') }
]; // Example menu options

document.addEventListener('mousemove', updateMouse);

let mouseX = 0;
let mouseY = 0;
let target = null
let isPie = false;

function updateMouse(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    target = e.target

    
    
    pieMenu.line.setAttribute('y2', e.clientY)
    pieMenu.line.setAttribute('x2', e.clientX)
}

document.addEventListener('openPie', openPie);
document.addEventListener('closePie', closePie);

function openPie() {
    if (!isPie) {
        isPie = true;
        pieMenu.show(mouseX, mouseY, engine.pieMenu[target.getAttribute('panel')] || []);
        // console.log(target.getAttribute('panel'))
    }
}

function closePie() {
    if (isPie) {
        pieMenu.hide();
        isPie = false;
    }
}




