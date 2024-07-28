import { IEuiLoader } from "./IUD.js";
import { Column, Row, Text, Panel, MultiInputs, Input, Button, MiniPreview, Breadcrumbs, Outliner, UI, GridContent, ContextMenu, Modal, InputModal } from "./ui.js"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import * as THREE from '../three/build/three.module.js'

const listener = new THREE.AudioListener();
const sound = new THREE.Audio(listener);
sound.setLoop(true);

engine.IEui = new IEuiLoader()
engine.THREE = THREE



function renderContentBrowser(container) {
    if (!container.element) container.element = container._contentElement[0]

    container.element.style.display = 'flex'
    container.element.style.flexDirection = 'column'
    container.element.style.overflowY = 'auto'

    let hideSourcePanel = localStorage.getItem('hideSourcePanel') || false


    const createFolder = new Button("Create Folder", "add-circle")
        .style({ border: 'none', padding: '3px 5px', fontSize: "11px", borderRadius: "5px", backgroundColor: '#0090ff', margin: '0px', color: "white" })

    const importFile = new Button("Import File")
        .style({ border: '2px solid #333', padding: '3px 5px', fontSize: "11px", borderRadius: "5px", backgroundColor: '#222', margin: '0px', color: "white" })

    const saveProject = new Button("Save Project")
        .style({ border: '2px solid #333', padding: '3px 5px', fontSize: "11px", borderRadius: "5px", backgroundColor: '#222', margin: '0px', color: "white" })

    const backwardButton = new Button(null, "chevron-back")
        .style({ border: '2px solid #333', padding: '3px 5px', fontSize: "11px", borderRadius: "5px", backgroundColor: '#222', margin: '0px', color: "white" })

    const forwardButton = new Button(null, "chevron-forward")
        .style({ border: '2px solid #333', padding: '3px 5px', fontSize: "11px", borderRadius: "5px", backgroundColor: '#222', margin: '0px', color: "white" })

    const breadcrumb = new Breadcrumbs()
        .style({ flex: 1 })

    const refresh = new Button(null, "reload")
        .style({ marginLeft: 'auto', border: '2px solid #333', padding: '3px 5px', fontSize: "11px", borderRadius: "5px", aspectRatio: 1, backgroundColor: 'transparent', margin: '0px', color: "white" })



    const header = new Row({ children: [createFolder, importFile, saveProject, backwardButton, forwardButton, breadcrumb, refresh] })
        .style({
            margin: '5px',
            borderRadius: '4px',
            backgroundColor: '#111',
            gap: '10px'
        })
        .addToDom(container.element)


    const sourcesPanel = new Outliner({}, "path", {
        rowTemplate: { "Name": "name" },
        iconDiference: 'type',
        icons: {
            'file': ['document', '#83bce8'],
            'directory': ['folder-open', '#efb507'],
        },
        filter: {
            "type": "directory"
        }
    })
        .style({ border: 'none', padding: '3px 5px', fontSize: "11px", borderRadius: "5px", backgroundColor: '#222', color: "white", overflowY: "scroll", height: "100%", width: '200px' })
        .show(!hideSourcePanel)


    const searchBar = new Input("Scearch Assets", 'text')
        .style({ border: '2px solid #333', padding: '3px 5px', fontSize: "11px", borderRadius: "5px", backgroundColor: '#222', color: "white", flex: 1, marginRight: '100px' })

    const filter = new Button(null, "filter")
        .style({ border: '2px solid #333', padding: '3px 5px', fontSize: "11px", borderRadius: "20px", aspectRatio: 1, backgroundColor: 'transparent', margin: '0px', color: "white" })

    const indictor = new Text("0 of 0 items selected")
        .style({ padding: '3px 5px', fontSize: "12px", margin: '0px', color: "white" })

    const assetsHeader = new Row({ children: [searchBar, filter, indictor] })
        .style({
            borderRadius: '4px',
            backgroundColor: '#111',
            gap: '10px',
            alignItems: 'center'
        })

    const createItems = [
        { name: "Folder", action: createNewFile },
        { name: "Texture", action: createNewFile },
        { name: "Script", action: createNewFile },
        { name: "Model", action: createNewFile },
        { name: "Sound", action: createNewFile },
        { name: "Shader", action: createNewFile },
        { name: "Animation", action: createNewFile }
        // Add more asset types as needed
    ]


    const mini = new MiniPreview()
    const assetsView = new GridContent([], "filePath", {
        type: (item) => {
            if (item.type == 'directory') {
                return 'Folder'
            } else {
                return engine.determineFileType(item.filePath)
            }
        },
        iconDiference: 'extension',
        defaultIcon: ['folder-open', '#efb507'],
        icons: {
            '.loom': ['document-text', '#6607ef'],
            '.ieactor': ['cube', '#616ca0'],
            '.iemat': ['bowling-ball', '#a65497'],
            '.iepr': ['file-tray-stacked', '#a65497'],
            '.ieaudio': ['volume-high', '#8ca061'],
            '.iemesh': (content) => {

                const name = engine.replaceSpacesWithCapital(content.name)
                const object = engine.environment.get(name)

                let img
                if (object && mini) {
                    mini.height = 100
                    mini.width = 100
                    img = mini.render({ object: object }, false)
                }
                return [img, "#6607ef"]
            }, '.ieasset': (content) => {

                const name = engine.replaceSpacesWithCapital(content.name)
                const object = engine.environment.get(name)

                console.log(object)

                // const img = object.filePath

                return ["https://opengameart.org/sites/default/files/oga-textures/115038/templategrid_albedo.png", "#E55137"]
            },
            '.iemap': ['prism', '#317F43'],
            '.ieui': ['browsers', '#1E2460']
        },
        contextMenu: [
            { name: "Open", action: openFile },
            { name: "Rename", action: renameFile },
            { name: "Copy", action: copyFiles },
            { name: "Duplicate", action: duplicateFile },
            { name: "Delete", action: deleteFile },
            { name: "Move to Folder", action: moveFileToFolder },

            { type: "separator", style: '1px solid #222' }, // Separator line

            {
                name: "Create New Asset",
                items: createItems
            },

            { type: "separator", style: '1px solid #222' }, // Another separator line

            { name: "Preview", action: previewFile },
            { name: "Export", action: exportFile },
            { name: "Import", action: importNewFile },
            { name: "Find References", action: findReferences },
            { name: 'Toggle Source Panel', action: toggleSource }
        ]




    })
        .style({
            gap: '10px',
            height: '100%',
            flex: 1
        })


    const assetsBody = new Column({ children: [assetsView] })
        .style({
            borderRadius: '4px',
            backgroundColor: '#222',
            gap: '10px',
            height: '100%',
            maxHeight: "calc(100% - 0px)",
            overflowY: 'scroll'
        })

    const assetsContainer = new Column({ children: [assetsHeader, assetsBody] })
        .style({
            borderRadius: '4px',
            backgroundColor: '#111',
            gap: '10px',
            height: '100%',
            flex: 1
        })




    const body = new Row({ children: [sourcesPanel, assetsContainer] })
        .style({
            margin: '5px',
            borderRadius: '4px',
            backgroundColor: '#111',
            gap: '10px',
            height: '100%',
            maxHeight: "calc(100% - 50px)"
        })





    new Column({ children: [header, body] })
        .style({
            margin: '5px',
            borderRadius: '4px',
            backgroundColor: '#111',
            height: '100%',
            maxHeight: 'calc(100% - 10px)'
        })
        .addToDom(container.element)



    const menu = [
        { name: 'Toggle Source Panel', action: toggleSource },
        { name: `Paste File`, action: pasteFile },
        { name: `Create New Asset`, items: createItems }
    ]

    const assetsContext = new ContextMenu(menu)
    const createContext = new ContextMenu(createItems)


    function toggleSource() {
        hideSourcePanel = !hideSourcePanel
        sourcesPanel.show(!hideSourcePanel)
        localStorage.setItem('hideSourcePanel', hideSourcePanel)
    }

    function openFile(file) {
        console.log('Opening: ', file)
    }

    function renameFile(file) {

    }

    function duplicateFile(files) {
        files.target.forEach(file => {
            console.log(file)
            engine.duplicateFile(file.filePath)
        });
    }

    function copyFiles(files) {
        const filePaths = []
        files.target.forEach(file => {
            filePaths.push(file.path)
        });

        engine.copyTextToClipboard(JSON.stringify(filePaths))
    }

    function pasteFile(dirPath) {

        const pathJSON = engine.pasteTextFromClipboard()

        try {
            const filePaths = JSON.parse(pathJSON)
            engine.copyFile(filePaths, dirPath)
        } catch (error) {
            console.warn('Please copy a file from the content browser and try agin.')
        }
    }

    function moveFileToFolder(file, folder) {

    }

    function deleteFile(files) {
        files.target.forEach(file => {
            engine.deleteFile(file.filePath).then(() => {
                document.dispatchEvent(new CustomEvent('refreshContents', { detail: {} }));
            })
        });
    }

    function createNewFile(file) {
        let currentPath
        if (file.currentPath) {
            currentPath = file.currentPath
        } else {
            currentPath = engine.getFolderPath(file.target[0].filePath)
        }
        const refreshFile = new CustomEvent('refreshContents', { detail: {} });
        const inputModal = new InputModal("Create " + file.name)
        switch (file.name) {
            case 'Folder':
                inputModal.onFinished = (name) => {
                    engine.mkdir(name, currentPath).then((path) => {
                        console.log(path)
                        document.dispatchEvent(refreshFile);
                    })
                }

                break;

            default:
                break;
        }



    }

    function previewFile(file) {

    }

    function exportFile(file) {

    }

    function importNewFile(file) {

    }

    function findReferences(file) {

    }

    // Function to import GLB and process its contents
    function importGltf(data, currentPath) {
        const loader = new GLTFLoader();
        const filePath = engine.createPath(currentPath, `${data.fileName}.iemesh`);

        // Function to handle the loaded GLTF file
        function onLoad(gltf) {
            const jsonScene = gltf.scene.toJSON();
            engine.writeToFile(JSON.stringify(jsonScene, null, 2), filePath)
                .catch(error => console.error(`Error writing scene file: ${filePath}`, error));

            gltf.scene.traverse(object => processMesh(object, currentPath));
            engine.stopIndicate();
        }

        // Function to handle the progress of the loading
        function onProgress(xhr) {
            engine.loadingIndicator(data.fileName, xhr);
        }

        // Function to handle errors during loading
        function onError(error) {
            engine.indicate('An error happened');
            setTimeout(engine.stopIndicate, 5000);
            console.error('An error happened', error);
        }

        // Load the GLB file
        loader.load(data.filePath, onLoad, onProgress, onError);
    }

    // Function to process individual mesh objects
    function processMesh(object, currentPath) {
        if (!object.isMesh) return;

        const filePath = engine.createPath(currentPath, `${object.name}.iemesh`);
        const jsonMesh = object.toJSON();
        engine.writeToFile(JSON.stringify(jsonMesh, null, 2), filePath)

        if (object.material) {
            // Import material
            importMaterial(object.material, currentPath);


            // // Import textures
            // if (object.material.map) {
                
            //     console.log(object.material)
            //     importTextures(object.material.map, currentPath, object.material.name);
            // }
        }
    }

    // Function to import material
    function importMaterial(material, currentPath) {
        console.log('material: ',material)




        const prefixMap = {
            'map': 'D_',                  // Diffuse map
            'normalMap': 'N_',            // Normal map
            'specularMap': 'S_',          // Specular map
            'roughnessMap': 'R_',         // Roughness map
            'metalnessMap': 'M_',         // Metallic map
            'aoMap': 'A_',                // Ambient Occlusion map
            'displacementMap': 'H_',      // Height map (Displacement)
            'alphaMap': 'O_',             // Opacity map
            'emissiveMap': 'E_',          // Emissive map (if used)
            // Add other mappings as needed
        };
        
        
        // Iterate over the material properties and apply prefixes based on the mapping
        Object.keys(material).forEach(key => {
            const texture = material[key];
            if (texture && texture instanceof THREE.Texture) {
                const prefix = prefixMap[key] || 'U_'; // Default to 'U_' if key is not in the map
                texture.name = `${prefix}${material.name}`
                importTextures(texture, currentPath, `${prefix}${material.name}`);
            }
        });


        const materialFilePath = engine.createPath(currentPath, `M_${material.name}.iemat`);
        const jsonMaterial = material.toJSON();
        engine.writeToFile(JSON.stringify(jsonMaterial, null, 2), materialFilePath)
            .catch(error => console.error(`Error writing material file: ${materialFilePath}`, error));
    }

    // Function to import textures
    function importTextures(texture, currentPath, materialName) {
        const textureFilePath = engine.createPath(currentPath, `T_${materialName}.ieasset`);
        const jsonTexture = texture.toJSON(); // Assuming texture has a toJSON method
        engine.writeToFile(JSON.stringify(jsonTexture, null, 2), textureFilePath)
            .catch(error => console.error(`Error writing texture file: ${textureFilePath}`, error));
    }

    function importImage(data, currentPath) {
        const dest = engine.createPath(currentPath, `${data.fileName}.ieasset`);

        engine.copyFile(data.filePath, dest).then(() => {
            const fileImported = new CustomEvent('refreshContents', { detail: {} });
            document.dispatchEvent(fileImported);
        })

    }

    refresh.onClick = () => {
        // const refreshFile = new CustomEvent('refreshContents', { detail: {} });
        // document.dispatchEvent(refreshFile);

        loadContents(engine)
    }



    function loadContents(e) {
        const dir = e.dir
        breadcrumb.setBasePath(dir.path);

        let forward = []
        let backward = []

        const contents = dir.children.find(item => item.name == "Contents");
        sourcesPanel.setObject(contents);

        let currentPath = contents.path;
        let items = engine.scanDir(contents.path);

        let relativePath = engine.requestRelativePath(dir.path, contents.path);
        let breadcrumbs = relativePath.split(path.sep).map(name => ({ name, path: contents.path }));
        breadcrumb.update(breadcrumbs);

        let selected = [];
        openDir(currentPath)

        forward = []
        backward = []

        sourcesPanel.addEventListener('onselect', (e) => {
            openDir(e.detail.id)
        });

        assetsView.addEventListener('onselect', (e) => {
            const paths = e.detail.id;

            selected = []

            paths.forEach(path => {
                selected.push(engine.scanFile(path))
            });

            indictor.setText(`${selected.length} of ${items.length} items selected`);
        });

        importFile.onClick = async () => {
            const data = await engine.importToProject();

            switch (data.fileExtension) {
                case '.gltf':
                case '.glb':
                    importGltf(data, currentPath)
                    break;
                case '.png':
                case '.jpg':
                case '.jpeg':
                case '.gif':
                case '.bmp':
                case '.tiff':
                    importImage(data, currentPath)
                    break;

                default:
                    break;
            }
        };


        engine.addEventListener('refreshContents', () => {
            selected = []
            items = engine.scanDir(currentPath);
            const elements = []
            items.forEach(item => {
                const info = engine.getFileInfo(item.path)
                elements.push(info)
            })


            assetsView.update(elements);
            indictor.setText(`${selected.length} of ${items.length} items selected`);

            AssetsEnvets()

        });


        assetsBody.onContext = (e) => {
            assetsContext.open(currentPath, e.x, e.y)
        }

        function AssetsEnvets() {
            let timeout, time
            time = 500
            assetsView.contents.forEach((content) => {
                try {
                    const type = engine.determineFileType(content.filePath)
                    const name = engine.replaceSpacesWithCapital(content.name)
                    content.element.onmouseenter = () => {
                        clearTimeout(timeout)
                        timeout = setTimeout(() => {
                            switch (type) {
                                case 'Audio':
                                    const audio = engine.environment.get(name)
                                    if (audio) {
                                        sound.setBuffer(audio);
                                        sound.play()
                                    }
                                    break;
                                // case 'Mesh':
                                //     const mesh = engine.environment.get(name)
                                //     if(mesh){
                                //         console.log(mesh)
                                //     }
                                default:
                                    break;
                            }
                        }, time)
                    }

                    content.element.onmouseleave = () => {
                        clearTimeout(timeout)
                        switch (type) {
                            case 'Audio':
                                const audio = engine.environment.get(name)
                                if (audio) {
                                    sound.stop()
                                    sound.setBuffer(null);
                                }
                                break;

                            default:
                                break;
                        }
                    }


                    content.element.ondblclick = () => {

                        if (content.type == 'Folder') {
                            openDir(content.filePath)
                        } else if (content.type == 'Map') {
                            const map = engine.environment.get(name)
                            if (map) {
                                engine.openMap(map)
                            }
                        } else {
                            engine.openEditor(content.filePath)
                        }


                    }
                } catch (error) {

                }



            })
        }

        breadcrumb.onClick = (path) => {
            openDir(path)
        }

        function openDir(dirPath, push = true) {

            const history = currentPath

            breadcrumbs = [];
            selected = [];
            currentPath = dirPath

            relativePath = engine.requestRelativePath(dir.path, currentPath);

            breadcrumbs = relativePath.split(path.sep).map(name => ({ name, path: currentPath }));
            breadcrumb.update(breadcrumbs);

            items = engine.scanDir(currentPath);
            const elements = []
            items.forEach(item => {
                const info = engine.getFileInfo(item.path)
                elements.push(info)
            })


            assetsView.update(elements);
            indictor.setText(`${selected.length} of ${items.length} items selected`);

            sourcesPanel.selectObject({ path: dirPath })
            AssetsEnvets()

            if (push) {
                backward.push(history)
                backwardButton.element.disabled = false
            }

            return history




        }


        forwardButton.element.disabled = true
        backwardButton.element.disabled = true
        backwardButton.onClick = () => {

            if (backward.length > 0) {
                forwardButton.element.disabled = false
                const path = backward.pop()
                const history = openDir(path, false);
                forward.push(history);
            } else {
                backwardButton.element.disabled = true
            }
        };

        // Forward button click event handler
        forwardButton.onClick = () => {
            if (forward.length > 0) {
                backwardButton.element.disabled = false
                const path = forward.pop();
                openDir(path);
                // backward.push(path); 
            } else {
                forwardButton.element.disabled = true
            }
        };

        engine.addEventListener('fileUpdated', () => {

            const elements = []
            items.forEach(item => {
                const info = engine.getFileInfo(item.path)
                elements.push(info)
            })


            assetsView.update(elements);
            indictor.setText(`${selected.length} of ${items.length} items selected`);

            AssetsEnvets()
        })





        createFolder.onClick = () => {
            createNewFile({ name: 'Folder', currentPath })
        }





    }



    engine.addEventListener('openedProject', (e) => {
        loadContents(e)
    })
}


window.renderContentBrowser = renderContentBrowser