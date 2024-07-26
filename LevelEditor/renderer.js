
const isfBC = localStorage.getItem('floatingBC')
let scene
let cbTab


function renderLevelEditor(filepath, id){

    var config = {
        content: [{
            id: 'Level-Editor',
            type: 'row',
            content: [{
                width: 70,
                type: 'column',
                content: [{
                    title: 'Viewport',
                    type: 'component',
                    componentName: 'IE-Panel'
                },
                {
                    title: 'Content Browser',
                    type: 'component',
                    componentName: 'IE-Panel',
                }
                ]
            },
            {
                type: "column",
                content: [{
                    title: 'Outliner',
                    type: 'component',
                    componentName: 'IE-Panel',
                    height: 40,
                }, {
                    title: 'Details',
                    type: 'component',
                    componentName: 'IE-Panel',
    
                }]
            }
            ]
        }],
    
    };
    
    
    var myLayout,
        savedState = localStorage.getItem('savedState');
    
    if (savedState !== null) {
        myLayout = new GoldenLayout(JSON.parse(savedState), document.getElementById(id));

    } else {
        myLayout = new GoldenLayout(config, document.getElementById(id));
    }
    
    myLayout.on('stateChanged', function () {
        var state = JSON.stringify(myLayout.toConfig());
        localStorage.setItem('savedState', state);
    });
    
    var persistentComponent = function (container, state) {
        const title = container._config.title
        setInterval(() => {
            container.setState({
                label: title
            });
        })
    
        render(container)
    
    };
    
    myLayout.registerComponent('IE-Panel', persistentComponent);
    myLayout.init();
    
    window.addEventListener('resize', () => {
        myLayout.updateSize(document.getElementById(id).clientWidth, document.getElementById(id).clientHeight)
    })
        
    
    function render(container) {
        const title = container._config.title
    
        if (title === "Content Browser") {
            document.dispatchEvent(new CustomEvent('contentChanged', { detail: { defaultContentBrowser: true } }))
            window.renderContentBrowser(container);
            engine.addPanel(container)
            cbTab = container

    
        }
    
        if (title === "Viewport") {
            document.addEventListener('panelReady', (e) => {
                if(e.detail.title == title){
                    scene = e.detail.panel(container);
                    engine.addPanel(container)
                    console.log(cbTab)
                    if(cbTab && cbTab.tab){
                        if(isfBC){
                            cbTab.tab.closeElement[0].click()
                        }
                    }
                }
            })
        }
    
        if (title === "Details") {
            document.addEventListener('panelReady', (e) => {
                if(e.detail.title == title){
                    e.detail.panel(container);
                    engine.addPanel(container)
                }
                
            })
        }
    
        if (title === "Outliner") {
    
            document.addEventListener('panelReady', (e) => {
                if(e.detail.title == title){
                    e.detail.panel(container, scene);
                    engine.addPanel(container)
                }
                
            })
    
        }
    
    }
    
    document.addEventListener('keypress', (e)=>{
    
        const key = e.key
    
        const editorRow = myLayout.root.contentItems[ 0 ]
        const fCol = editorRow.contentItems[0]
        const vp = fCol.contentItems[0]
        const sCol = editorRow.contentItems[1]
    
    
        var newItemConfig = {
            title: 'Content Browser',
            type: 'component',
            componentName: 'IE-Panel',
        };
    
        // console.log(myLayout.root.contentItems)
      
        // vp.addChild( newItemConfig );
    })
}

document.dispatchEvent(new CustomEvent('EditorReady', { detail: { render: renderLevelEditor, title: 'Level Editor' } }))