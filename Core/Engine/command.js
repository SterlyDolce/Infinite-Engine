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


export class CustomShortcut {
    constructor() {
        this.shortcuts = {};
        this.init();
    }

    init() {
        document.addEventListener('keydown', this.handleKeydown.bind(this));
        document.addEventListener('keyup', this.handleKeyup.bind(this));
    }

    handleKeydown(event) {
        const key = this.getKey(event);
        if (this.shortcuts[key] && this.shortcuts[key][0]) {
            event.preventDefault(); // Prevent default action if a shortcut is triggered
            this.shortcuts[key][0]();
        }
    }

    handleKeyup(event) {
        const key = this.getKey(event);
        if ( this.shortcuts[key] && this.shortcuts[key][1]) {
            event.preventDefault(); // Prevent default action if a shortcut is triggered
            this.shortcuts[key][1]();
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

    addShortcut(keyCombination, action, actionEnd = ()=>{}) {
        if (typeof keyCombination === 'string' && typeof action === 'function') {
            this.shortcuts[keyCombination] = [action, actionEnd];
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


export const addObject = function(parent, object, position = new THREE.Vector3()){

    const newCommand = new Command(()=>{
        object.position.copy(position)
        parent.add(object)
        engine.selectNewObject(object)
    },()=>{
        object.parent.remove(object)
    })

    newCommand.execute()
}





// Example usage
let myShortcuts = new CustomShortcut();


