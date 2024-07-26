function editoConfig(title, state = {}) {
    return {
        type: 'component',
        componentName: 'IE-Editor',
        title: title,
        state: state
    }
}

var config = {
    content: [{
        type: 'stack',
        id: 'Main-Editor',
        content: [
            // editoConfig('Level Editor'),
            // editoConfig('Actor Editor')
        ]
    }]
};

var mainLayout = new GoldenLayout(config, document.getElementById('editor'));

mainLayout.registerComponent('IE-Editor', function (container, state) {
    renderEditor(container)
});

mainLayout.init();

window.addEventListener('resize', () => {
    mainLayout.updateSize(document.getElementById('editor').clientWidth, document.getElementById('editor').clientHeight)
})


function renderEditor(container) {
    container._contentElement[0].style.backgroundColor = "#111"
    const title = container._config.title

    const type = engine.determineFileType(container._config.state.filePath)

    window.IERenderer(title, type, container._contentElement[0])



}

document.addEventListener('openEditor', (e) => {
    const filepath = e.detail.filePath
    const fileExtension = path.extname(filepath)
    const fileName = path.basename(filepath, fileExtension)
    mainLayout.root.contentItems[0].addChild(editoConfig(fileName, { filePath: filepath }));
    document.addEventListener('EditorReady', renderEditor)

    function renderEditor(e){
        e.detail.render(filepath, fileName)
        document.removeEventListener('EditorReady', renderEditor)
    }
})

