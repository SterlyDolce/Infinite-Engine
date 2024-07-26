import { Column, Text, Panel, MultiInputs, Input, Button, MiniPreview, Outliner }  from "../Global/ui.js"


const library = {
    name: 'IEui Library',
    type: 'Library',
    children: [
        {name: 'IUGButton', type: 'Button'},
        {name: 'IUGLabel', type: 'Label'},
        {name: 'IUGCanvas', type: 'Canvas'},
        {name: 'IUGImage', type: 'Image'},
        {name: 'Containers', children : [
            {name: 'IUGContainer', type: 'Container'},
            {name: 'IUGColumn', type: 'Column'},
            {name: 'IUGRow', type: 'Row'},
            {name: 'IUGGrid', type: 'Grid'},
            {name: 'IUGStack', type: 'Stack'},
        ]},
    ]
}


function renderOutliner(container, scene){
    if (!container.element) container.element = container._contentElement[0]

    container.element.style.display = 'flex'
    container.element.style.flexDirection = 'column'
    // container.element.style.overflowY = 'auto'

    const searchBar = new Input("Scearch Outliner", 'text')
        .style({ border: '2px solid #333', padding: '3px 5px', fontSize: "11px", borderRadius: "5px", backgroundColor: '#222', margin: '5px', color: "white"})

        

    const outliner = new Outliner(library, "type", {
        rowTemplate: {"Label" : "name"},
        iconDiference: 'type',
        icons:  {
            'Library': ['library', '#efb507'],
            'Canvas': ['tablet-landscape-outline', '#00a693'],
            'Button': ['radio-button-on', '#6607ef'],
            'Container': ['tablet-landscape', '#a65497'],
            'Label': ['text', '#a65497'],
            'Column': ['swap-vertical', '#22710f'],
            'Row': ['swap-horizontal', '#5473a6'],
            'Stack': ['albums', '#e9ef07'],
            'Grid': ['grid', '#e06666'],
            'Image': ['image', '#00801a']
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


}
document.dispatchEvent(new CustomEvent('panelReady', {detail: {panel: renderOutliner, title: 'library'}}))
