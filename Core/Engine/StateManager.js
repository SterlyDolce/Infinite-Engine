class StateManager {
    constructor() {
        this.history = []; // Array to keep track of states
        this.undos = [];   // Array to keep track of undone states
    }

    addState(newState, reverseState) {
        this.history.push({ newState, reverseState });
        this.undos = []; // Clear redos when a new state is added
    }

    undo() {
        if (this.history.length > 0) {
            const { newState, reverseState } = this.history.pop();
            reverseState(); // Apply the reverse state
            this.undos.push({ newState, reverseState });
        } else {
            console.log("can't undo");
        }
    }

    redo() {
        if (this.undos.length > 0) {
            const { newState, reverseState } = this.undos.pop();
            newState(); // Apply the new state
            this.history.push({ newState, reverseState });
        } else {
            console.log("can't redo");
        }
    }
}

module.exports = { StateManager };
