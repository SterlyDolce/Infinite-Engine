

class UI {
    constructor() {

    }

    addToScreen(IEui) {
        engine.IUG.add(IEui.clone())
    }

    removeFromScreen(IEui) {
        engine.IUG.remove(IEui)
    }

    removeFromParent(IEui) {
        const child = engine.IUG.getObjectByProperty('uuid', IEui.uuid)
        if (child) {
            child.parent.remove(child)
        }
    }

    get(IEui) {
        const store = IEui.script.environment.store;
        const result = {};

        engine.IUG.traverse(ui => {
            result[ui.name] = ui
        })

        // for (const key in store) {
        //     if (Object.hasOwnProperty.call(store, key)) {
        //         const element = store[key];
        //         if (element.value && element.value.accessable !== undefined) {
        //             result[element.name] = element.value;
        //         }
        //     }
        // }

        return result;
    }

}


engine.setupUI(UI)