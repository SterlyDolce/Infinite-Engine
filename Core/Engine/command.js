import * as THREE from '../../three/build/three.module.js'

const commandStack = [];

export class Command {
    constructor(executeFunction, undoFunction) {
        this.executeFunction = executeFunction;
        this.undoFunction = undoFunction;
        this.executed = false;
        
    }

    async execute() {
        if (!this.executed) {
            await this.executeFunction();
            this.executed = true;
            commandStack.push(this)
            console.log(commandStack)
        }
    }

    async undo() {
        if (this.executed) {
            await this.undoFunction();
            this.executed = false;
        }
    }
}

export class undoShortcut {
    constructor(key = "z", isCtrlKey = true) {
        this.handleUndo = this.handleUndo.bind(this);

        document.onkeydown = (e)=>{
            this.handleUndo(e);
        }

        this.key = key;
        this.isCtrlKey = isCtrlKey;
    }

    handleUndo(e) {
        if (
            (this.isCtrlKey && (e.key === this.key && e.ctrlKey)) ||
            (this.isCtrlKey && (e.key === this.key && e.metaKey))
        ) {
            if (commandStack.length > 0) {
                const lastExecutedCommand = commandStack.pop();
                lastExecutedCommand.undo();
                console.log(commandStack)
            }
        }
    }

}


export const addPointLight = function(helperScene, projectScene){

    let object, helper;
    const newCommand = new Command(()=>{
        const pointLight = new THREE.PointLight( 0x0090ff, 5, 100 );
        pointLight.position.set( 0, 10, 0 );
        projectScene.add( pointLight );
        object = pointLight
        
        const sphereSize = 1;
        const pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
        helperScene.add( pointLightHelper );

        helper = pointLightHelper
    },()=>{
        projectScene.remove(object)
        helperScene.remove(helper)
    })

    newCommand.execute()
}




export class CustomShortcut {
    constructor() {
        this.shortcuts = {};
        this.init();
    }

    init() {
        document.addEventListener('keydown', this.handleKeydown.bind(this));
    }

    handleKeydown(event) {
        const key = this.getKey(event);
        if (this.shortcuts[key]) {
            event.preventDefault(); // Prevent default action if a shortcut is triggered
            this.shortcuts[key]();
        }
    }

    getKey(event) {
        let key = '';
        if (event.ctrlKey) key += 'Ctrl+';
        if (event.altKey) key += 'Alt+';
        if (event.shiftKey) key += 'Shift+';
        if (event.metaKey) key += 'Meta+';
        key += event.key;
        return key;
    }

    addShortcut(keyCombination, action) {
        if (typeof keyCombination === 'string' && typeof action === 'function') {
            this.shortcuts[keyCombination] = action;
        } else {
            console.error('Invalid keyCombination or action');
        }
    }

    removeShortcut(keyCombination) {
        if (this.shortcuts[keyCombination]) {
            delete this.shortcuts[keyCombination];
        } else {
            console.warn(`No action assigned for keyCombination: ${keyCombination}`);
        }
    }
}

// Example usage
let settings = { /* settings object */ };
let myShortcuts = new CustomShortcut();


myShortcuts.addShortcut('Meta+s', () => {
    console.log('Save shortcut triggered!');
});

myShortcuts.addShortcut('Ctrl+z', () => {
    console.log('Undo shortcut triggered!');
});

// Additional example: removing a shortcut
// myShortcuts.removeShortcut('Ctrl+s');
