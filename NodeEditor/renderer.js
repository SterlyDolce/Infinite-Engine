


function renderUIEditor(filepath, id, arrangement) {
    var config = {
        settings: {
            selectionEnabled: true
        },
        content: [{
            id: 'UI-Editor',
            type: 'row',
            content: [{
                title: 'Details',
                type: 'component',
                width: 25,
                componentName: id,
            }, {
                type: 'column',
                content: [{
                    id: 'test',
                    title: 'Visual',
                    type: 'component',
                    componentName: id
                }]
            }]
        }]
    };


    let scene
    const init = async function (container, state) {
        const title = container._config.title

        document.addEventListener('panelReady', (e) => {
            if (title == e.detail.title) {
                engine.Loom.load(filepath, arrangement).then((json) => {
                    e.detail.panel(container, json)
                })
            }

        })

        engine.addPanel(container)
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