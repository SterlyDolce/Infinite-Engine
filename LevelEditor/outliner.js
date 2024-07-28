import { Column, Text, Panel, MultiInputs, Input, Button, MiniPreview, Outliner }  from "../Global/ui.js"



function renderOutliner(container, scene){
    container.element = container._contentElement[0]
    container.element.style.display = 'flex'
    container.element.style.flexDirection = 'column'
    // container.element.style.overflowY = 'auto'

    const searchBar = new Input("Scearch Outliner", 'text')
        .style({ border: '2px solid #333', padding: '3px 5px', fontSize: "11px", borderRadius: "5px", backgroundColor: '#222', margin: '5px', color: "white"})

        

    const outliner = new Outliner(scene, "uuid", {
        rowTemplate: {
            "Label" : "name",
            "Type" : "type"
        },
        iconDiference: 'type',
        icons:  {
            'World': ['planet', '#00a693'],
            'Camera': ['videocam', '#6607ef'],
            'Group': ['folder', '#efb507'],
            'Mesh': ['shapes', '#a65497'],
            'Text': ['text', '#a65497'],
            'Actor': ['cube', '#22710f'],
            'AmbientLight': ['moon', '#5473a6'],
            'DirectionalLight': ['sunny', '#e9ef07'],
            'PointLight': ['flame', '#e06666'],
            'Object3D': ['file-tray-full', '#b22929'],
            'Bone': ['bone', '#948d8c']
        }
    })
    .style({ border: 'none', padding: '3px 5px', fontSize: "11px", borderRadius: "5px", backgroundColor: '#222', margin: '5px', color: "white", overflowY: "scroll", height: "100%", maxHeight: "calc(100% - 60px)"})

    outliner.addEventListener('onselect', (e)=>{
        const uuid = e.detail.id

        const object = scene.getObjectByProperty('uuid', uuid)

        engine.selectNewObject(object)
    })
    outliner.onSelect = (object)=>{
        engine.selectNewObject(object)
    }

    const column = new Column({ children: [searchBar, outliner] })
        .style({
            margin: '5px',
            borderRadius: '4px',
            backgroundColor: '#111',
            height: "100%",
            maxHeight: "calc(100% - 10px)"
        })
        .addToDom(container.element)


        engine.addEventListener('updateSelection', (e) => {
            const objects = e.object
            if(!objects) {
                outliner.selectObject(null)
                return
            }


            // outliner.update()
            outliner.selectObject(objects[0])
        })

        engine.addEventListener('updateOutliner', e => {
            outliner.update()
        })


        engine.addEventListener('sceneUpdated', (e) => {
            scene = e.mainScene
            outliner.update(scene)
        })
}

window.renderOutliner = renderOutliner

document.dispatchEvent(new CustomEvent('panelReady', {detail: {panel: renderOutliner, title: 'Outliner'}}))