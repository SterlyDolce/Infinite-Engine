


function renderUIEditor(filepath, id) {
    var config = {
        settings: {
            selectionEnabled: true
        },
        content: [{
            id: 'UI-Editor',
            type: 'row',
            content: [{
                title: 'Library',
                type: 'component',
                componentName: id,
            }, {
                type: 'column',
                width: 50,
                content: [{
                    id: 'test',
                    title: 'IUG',
                    type: 'component',
                    componentName: id
                }, {
                    title: 'Content Browser',
                    type: 'component',
                    componentName: id,
                }]
            }, {
                type: "column",
                width: 25,
                content: [{
                    title: 'Details',
                    type: 'component',
                    componentName: id,

                }]
            }]
        }]
    };


    let scene
    const init = async function (container, state) {
        const title = container._config.title

        if (title === "Content Browser") {
            document.dispatchEvent(new CustomEvent('contentChanged', { detail: { defaultContentBrowser: true } }))
            window.renderContentBrowser(container);
            engine.addPanel(container)

        }



        document.addEventListener('panelReady', (e) => {
            if (e.detail.title == 'IUG') {
                engine.IEui.load(filepath, (ui) => {
                    if (title === "IUG") {
                        ui.path = filepath
                        scene = e.detail.panel(container, ui);
                        engine.addPanel(container)
                    }
                })
            }
        })


        if (title === "Details") {
            document.addEventListener('panelReady', (e) => {
                if (e.detail.title == 'IEuiDetails') {
                    e.detail.panel(container);
                    engine.addPanel(container)
                }
            })
        }

        if (title === "Library") {
            document.addEventListener('panelReady', (e) => {
                if (e.detail.title == 'library'){
                    e.detail.panel(container);
                }
            })
        }

    };

    var myLayout = new GoldenLayout(config, document.getElementById(id));

    myLayout.registerComponent(id, function (container, state) { init(container, state) });

    myLayout.init();





    // const myLayout = new GoldenLayout(config, document.getElementById('layoutContainer'));

    // myLayout.registerComponent(id, init);
    // myLayout.init();

    window.addEventListener('resize', () => {
        myLayout.updateSize(document.getElementById(id).clientWidth, document.getElementById(id).clientHeight)
    })

}

document.dispatchEvent(new CustomEvent('EditorReady', { detail: { render: renderUIEditor, title: 'UI Editor' } }))