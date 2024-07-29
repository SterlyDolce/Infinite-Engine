const fs = require('fs');
const path = require('path');
const os = require('os');
const { ipcRenderer, clipboard } = require('electron');
const { Interpreter, Environment } = require('../Core/Loom/Interpreter.js');


class Engine {
    constructor(project = null) {
        this.name = "Infinite Engine";
        this.version = "1.0.0";
        this.project = project;
        this.recentProjects = {};
        this.THREE = null
        this.environment = new Environment();
        this.isPlaying = false;
        this.isPaused = false;
        this.playingScene = null;
        this.mainScene = null;
        this.script = null;
        this.selectedObjects = [];
        this.focus = null;
        this.IEui = null
        this.IUG = null
        this.activeScene = null
        this.stateManager = new StateManager();
        this.deselectObject = () => { };
        this.deleteSelectedObjects = () => { }
        this.selectNewObject = () => { };
        this.deleteObject = () => { };
        this.openNewMap = async (map) => { };
        this.addObject = (Object, Parent) => { };
        this.showLoaderModal = (xhr) => { };


        this.pieMenu = {
            Viewport: [
                { label: 'Delete', action: () => this.deleteSelectedObjects() },
                { label: 'GeneratedTerrain', action: () => engine.addGeneratedTerrain() },
                {
                    label: 'Add ', items : [
                        {label: "Directional Light", action: () => {

                            const directionalLight = new this.THREE.DirectionalLight(0xffffff, 0.5);
                            directionalLight.name = 'light'
                            this.addObject(directionalLight,  this.activeScene.children[0]);
                        }},
                        {label: 'PointLight', action: () => {

                            const pointLight = new this.THREE.PointLight(0xffffff, 0.5, 100);
                            pointLight.name = 'light'
                            this.addObject(pointLight,  this.activeScene.children[0]);
                        }}
                    ]
                }
            ]
        }


        document.addEventListener('ThreeLoaded', (e) => {
            const THREE = e.detail
            this.THREE = THREE
            this.environment.MK_NATIVE_FN('Color', (...param) => new THREE.Color(...param));
        })


        if (!this.project) {
            // this.createNewProject();
        } else {
            this.openNewProject(this.project.path);
        }

        this.environment.MK_NATIVE_FN('spawnObject', this.spawnObject);


        this.setupEventListeners();

        window.engine = this
    }

    setupUI(UI) {
        this.environment.MK_VAR('UI', new UI)
    }

    setupEventListeners() {

        document.onkeydown = (e) => {

            if (e.key === 'Backspace' && ['Viewport', 'Outliner'].includes(this.focus._config.title)) {
                if (this.selectedObjects.length && this.selectedObjects.length > 0) {
                    this.selectedObjects.forEach(this.deleteObject);
                } else {
                    console.warn('Select the object you want to delete and try again.');
                }
            }
        };

        document.addEventListener('updateSelection', (e) => {
            this.selectedObjects = e.detail.object;
        });

        document.addEventListener('fileImported', (e) => {
            this.handleFileImported(e.detail);
        });
    }

    addEventListener(type = '', cb = () => { console.error('cb required a type of function, but istead found nothing. really? Yeah, in engine.addEventListener. it\' in the code somewhere.') }) {
        if (type && cb) {
            document.addEventListener(type, (e) => {
                if (e.detail) {
                    cb(e.detail)
                } else {
                    cb(e)
                }
            })
        }
    }

    addPanel(panel) {
        const elem = panel._contentElement[0]
        this['panel'] = panel
        elem.onclick = () => {
            this.focus = panel
        }
    }

    handleFileImported({ filePath, fileType, fileName }) {
        const loader = new this.THREE.ObjectLoader();

        if (fileName === '.DS_Store') return;

        const loaders = {
            Actor: (path) => loader.load(path, (actor) => this.setVar(actor, path, fileName), (xhr) => { }),
            Mesh: (path) => loader.load(path, (mesh) => { this.setVar(mesh, path, fileName); this.stopIndicate() }, (xhr) => { this.loadingIndicator('Mesh', xhr) }),
            Texture: (path) => {
                const textureLoader = new this.THREE.TextureLoader();
                const texture = textureLoader.load(path)
                texture.name = fileName
                const image = texture.image;
                console.log('loaded, ', image)
                this.setVar(texture, path, fileName)
            },
            Material: (path) => {
                const materialLoader = new this.THREE.MaterialLoader()
                materialLoader.load(path, material => {
                    material.filePath = path
                    this.setVar(material, path, fileName)
                })
            },
            Animation: (path) => loader.load(path, (animation) => this.setVar(animation, path, fileName)),
            Audio: (path) => {
                const audioLoader = new this.THREE.AudioLoader();
                audioLoader.load(path, (audio) => {
                    audio.filePath = path;
                    audio.name = fileName;
                    this.environment.MK_VAR(this.replaceSpacesWithCapital(fileName), audio);
                });
            },
            UI: (path) => this.IEui.load(path, (ui) => this.setVar(ui, path, fileName)),
            Scene: (path) => loader.load(path, (scene) => this.setVar(scene, path, fileName)),

            Map: (path) => loader.load(path, (map) => this.setVar(map, path, fileName)),

            Custom: (path) => this.environment.MK_VAR(this.replaceSpacesWithCapital(fileName), filePath),
            Script: (path) => {
                // const scriptLoader = new this.THREE.ScriptLoader()
                // scriptLoader.load(path, (script)=>{
                //     script.filePath = path
                //     this.environment.MK_VAR(this.replaceSpacesWithCapital(fileName), script)
                // })
            },
            Project: () => { },
            default: () => console.error(`Unsupported Type: ${fileType}, ${fileName}`),
        };

        (loaders[fileType] || loaders.default)(filePath);

        const fileImported = new CustomEvent('refreshContents', { detail: {} });
        document.dispatchEvent(fileImported);

        fs.watch(filePath, { recursive: true }, (eventType) => {
            if (eventType === 'change') {
                const fileUpdated = new CustomEvent('fileUpdated', { detail: { fileName, filePath, fileType } });
                document.dispatchEvent(fileImported);
                document.dispatchEvent(fileUpdated);
                this.handleFileImported({ filePath, fileType, fileName })
            }
        });

        fs.watchFile(filePath, { recursive: true }, (eventType) => {
            if (eventType === 'change') {
                const fileUpdated = new CustomEvent('fileUpdated', { detail: { fileName, filePath, fileType } });
                document.dispatchEvent(fileImported);
                document.dispatchEvent(fileUpdated);
                this.handleFileImported({ filePath, fileType, fileName })
            }
        });
    }

    setVar(item, filePath, fileName) {
        item.filePath = filePath;
        this.environment.MK_VAR(this.replaceSpacesWithCapital(fileName), item);
    }

    replaceSpacesWithCapital(str) {
        return str.split(' ').map((word, index) =>
            index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
        ).join('');
    }

    async createNewProject() {
        try {
            const templates = {
                _blank: path.join(__dirname, '../templates/blank')
            };

            // Await the result of saveCurrentProject
            const filePath = await this.saveCurrentProject();
            if (!filePath) return; // If the filePath is not valid, exit the function

            const source = templates._blank;
            const destination = filePath;

            // Create destination directory
            await fs.mkdirSync(destination, { recursive: true });

            // Read directory contents
            const items = await fs.readdirSync(source, { withFileTypes: true });

            // Copy each item from the source to the destination
            for (const item of items) {
                const srcPath = path.join(source, item.name);
                const destPath = path.join(destination, item.name);

                if (item.isDirectory()) {
                    // Recursively copy directories
                    await this.copyDirectory(srcPath, destPath);
                } else {
                    // Copy files
                    await fs.copyFileSync(srcPath, destPath);
                }
            }

            // Open the new project
            await this.openNewProject(filePath, true);

        } catch (error) {
            console.error('Error creating new project:', error);
        }
    }

    async copyDirectory(source, destination) {
        fs.mkdirSync(destination, { recursive: true });

        const items = fs.readdirSync(source, { withFileTypes: true });

        for (const item of items) {
            const srcPath = path.join(source, item.name);
            const destPath = path.join(destination, item.name);

            if (item.isDirectory()) {
                await this.copyDirectory(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }

    async saveCurrentProject(projectPath = '') {
        const defaultPath = path.join(os.homedir(), 'Documents', 'IEProjects');
        const result = await ipcRenderer.invoke('save-dir-dialog', defaultPath);
        if (!result.canceled && result.filePath) {
            return result.filePath
        }
    }

    async openNewProject(projectPath = '', imediate = false) {

        const processDirectory = async (directoryPath) => {
            if (imediate) {
                directoryPath = path.join(__dirname, directoryPath)
            }
            console.log(directoryPath)
            document.dispatchEvent(new CustomEvent('closeWelcomePage', { detail: {} }))
            try {
                const files = await fs.promises.readdir(directoryPath);

                for (const file of files) {
                    const filePath = path.join(directoryPath, file);
                    const type = this.determineFileType(filePath);
                    if (type === "Project") {
                        const projectJson = await fs.promises.readFile(filePath, 'utf-8');
                        const Project = JSON.parse(projectJson);
                        this.project = Project
                        window.localStorage.setItem('Project', JSON.stringify({ ...Project, path: directoryPath }));
                        this.parseProject(Project, directoryPath);
                    }
                }
                this.dir = this.getDirectoriesRecursive("Project", directoryPath);
                const openedEvent = new CustomEvent('openedProject', { detail: { dir: this.dir } });
                document.dispatchEvent(openedEvent);
            } catch (error) {
                console.error('Error processing directory:', error);
            }
        };

        if (projectPath) {
            if (imediate) {
                processDirectory(projectPath);
            } else {
                document.addEventListener('DOMContentLoaded', () => processDirectory(projectPath))
            }

        } else {
            const defaultPath = path.join(os.homedir(), 'Documents', 'IEProjects');
            const result = await ipcRenderer.invoke('open-dir-dialog', defaultPath);
            if (!result.canceled && result.filePaths.length) {
                processDirectory(result.filePaths[0]);
            }
        }
    }

    openMap(map) {
        this.openNewMap(map).then((newMap) => {
            this.sceneUpdated(newMap);
        });
    }

    generateTerrain(heightmap = '', width = 256, height = 256, depth = 50) {
        // Load the heightmap
        heightmap = 'https://raw.githubusercontent.com/cgcostume/pubg-maps/master/apollo/fortnite_apollo_height_l16_preview.png'
        const loader = new this.THREE.TextureLoader();
        const texture = loader.load(heightmap)

        console.log(texture)

        // Create a plane geometry
        const geometry = new this.THREE.PlaneGeometry(200, 200, width - 1, height - 1);
        geometry.rotateX(-Math.PI / 2);

        // Get the pixel data from the heightmap texture
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        context.drawImage(texture.image, 0, 0, width, height);
        const imageData = context.getImageData(0, 0, width, height).data;

        // Update the vertices of the plane geometry based on the heightmap data
        for (let i = 0, j = 0; i < imageData.length; i += 4, j++) {
            const gray = imageData[i] / 255;
            geometry.attributes.position.setY(j, gray * depth);
        }

        geometry.computeVertexNormals();

        // Create a mesh with the updated geometry
        const material = new this.THREE.MeshLambertMaterial({ color: 0x8b4513 });
        const terrain = new this.THREE.Mesh(geometry, material);
        if (this.activeScene) activeScene.add(terrain);
    }

    addGeneratedTerrain() {
        // Load the heightmap
        const heightmap = 'heightmap.png'
        const terrain = new this.THREE.Terrain(heightmap, 505, 505)
        terrain.name = 'Terrain'
        this.addObject(terrain, this.activeScene.children[0])
    }

    parseProject(project, directoryPath) {
        const { settings, maps, scripts } = project;
        const EditorMap = settings.maps.editor_default;



        for (const map of maps) {
            if (map.uuid === EditorMap) {
                const filePath = path.join(directoryPath, map.path);
                const loader = new this.THREE.ObjectLoader();
                loader.load(filePath, (object) => {
                    this.openMap(object);
                    document.dispatchEvent(new CustomEvent('openEditor', { detail: { filePath: filePath, type: 'Level' } }))
                    this.stopIndicate();
                }, (xhr) => this.loadingIndicator("Project ", xhr));
            }
        }

        for (const scriptJSON of scripts) {
            this.parseScripts(directoryPath, scriptJSON, settings)
        }
    }

    parseScripts(directoryPath, scriptJSON, settings) {
        const filePath = path.join(directoryPath, scriptJSON.path);
        const code = fs.readFileSync(filePath, { encoding: 'utf-8' })
        const script = new this.THREE.Script(scriptJSON.id, code)
        if (scriptJSON.env) script.environment = scriptJSON.env
        script.path = filePath
        this.environment.MK_VAR(this.replaceSpacesWithCapital(scriptJSON.id), script)
        if (scriptJSON.uuid == settings.scripts.main) engine.mainScript = script

        fs.watch(filePath, { recursive: true }, (eventType) => {
            if (eventType === 'change') {
                const fileUpdated = new CustomEvent('fileUpdated', { detail: { name: scriptJSON.id, filePath, fileType: 'Script' } });
                document.dispatchEvent(new CustomEvent('refreshContents', { detail: {} }));
                document.dispatchEvent(fileUpdated);
                this.parseScripts(directoryPath, scriptJSON, settings)
            }
        });

    }

    loadingIndicator(name, xhr) {
        if (xhr.total > 0) {
            this.indicate(`Loading: ${(xhr.loaded / xhr.total) * 100}%`);
        }
        this.indicate('Loading ' + name);
    }

    indicate(value) {
        const indicator = document.getElementById('plingIndicator');
        if (indicator) {
            indicator.style.display = 'block';
            indicator.textContent = value;
        }
    }

    stopIndicate() {
        const indicator = document.getElementById('plingIndicator');
        if (indicator) indicator.style.display = 'none';
    }

    async saveProject(projectName) {
        if (!projectName) {
            console.error("Project name is required to save a new project.");
            return;
        }

        const projectsFolder = path.join(os.homedir(), 'Documents', 'IEProjects', projectName);

        try {
            await fs.promises.access(projectsFolder, fs.constants.F_OK);
            console.error(`Project '${projectName}' already exists.`);
            return;
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.error(`Error checking project existence: ${error.message}`);
                return;
            }
        }

        try {
            await fs.promises.mkdir(projectsFolder, { recursive: true });
            const subdirs = ['.engine', 'plugins', 'scripts', 'contents'];
            for (const subdir of subdirs) {
                await fs.promises.mkdir(path.join(projectsFolder, subdir), { recursive: true });
            }
            const projectFilePath = path.join(projectsFolder, `${projectName}.iepr`);
            await fs.promises.writeFile(projectFilePath, '');
            this.openNewProject(projectFilePath);
        } catch (error) {
            console.error(`Error creating project directories: ${error.message}`);
        }
    }

    convertFileType(filePath) {
        const extension = path.extname(filePath).toLowerCase(); // Ensure extension is in lower case

        switch (extension) {
            case '.png':
            case '.jpg':
            case '.jpeg':
            case '.gif':
            case '.bmp':
            case '.tiff':
                return '.ieasset'; // Image files to 'Texture' type
            case '.wav':
            case '.mp3':
            case '.ogg':
            case '.flac':
                return '.ieaudio'; // Audio files to 'Audio' type
            case '.json':
                return '.ieanim'; // Assuming JSON files could be animations
            case '.txt':
            case '.md':
            case '.csv':
                return '.loom'; // Text files as 'Script' type
            // Add more cases as needed for other file types
            default:
                return extension; // Return the original extension if no conversion is needed
        }
    }

    async importToProject() {
        let data
        try {
            const defaultPath = path.join(os.homedir(), 'Documents', 'IEProjects');
            const result = await ipcRenderer.invoke('open-file-dialog', defaultPath);

            if (result.canceled || result.filePaths.length === 0) {
                console.log("No file selected.");
                return;
            }

            const filePaths = result.filePaths;
            filePaths.forEach(filePath => {
                const extension = path.extname(filePath)
                const fileName = path.basename(filePath, extension)
                const type = this.determineFileType(filePath)
                data = {
                    filePath: filePath,
                    fileName: fileName,
                    fileType: type,
                    fileExtension: extension
                }
            });



        } catch (error) {
            console.error(`Error importing file: ${error}`);
        }

        return data
    }

    async importFiles(filePaths = []) {
        if (filePaths.length === 0) return;
        for (const filePath of filePaths) {
            const dest = path.join(this.project.path, 'contents', path.basename(filePath));
            try {
                await fs.promises.copyFile(filePath, dest);
                this.handleFileImported(this.getFileInfo(dest));
            } catch (error) {
                console.error(`Error copying file: ${error.message}`);
            }
        }
    }

    async copyFile(filePath, dest) {
        await fs.promises.copyFile(filePath, dest);

        this.handleFileImported(this.getFileInfo(dest));
        return this.getFileInfo(dest)
    }

    getUniqueObjectName(parent, name) {
        let counter = 1;
        let uniqueName = `${name}`;
        while (parent.traverse(child => child.name == uniqueName)) {
            uniqueName = `${name}_${counter}`;
            counter++;
        }
        return uniqueName;
    }

    getUniqueFileName(directory, baseName, extension) {
        let counter = 1;
        let uniqueName = `${baseName}${extension}`;
        while (fs.existsSync(path.join(directory, uniqueName))) {
            uniqueName = `${baseName}_${counter}${extension}`;
            counter++;
        }
        return uniqueName;
    }

    async duplicateFile(filePath) {
        const { directory, name, extension } = this.getFileInfo(filePath);
        const newFileName = this.getUniqueFileName(directory, name, extension);
        const dest = path.join(directory, newFileName);
        try {
            await fs.promises.copyFile(filePath, dest);
            this.handleFileImported(this.getFileInfo(dest));
        } catch (error) {
            console.error(`Error duplicating file: ${error.message}`);
        }
    }

    async deleteFile(filePath) {
        try {
            await fs.promises.unlink(filePath);
            console.log(`File ${filePath} deleted successfully.`);
        } catch (error) {
            console.error(`Error deleting file: ${error.message}`);
        }
    }

    async readFile(filePath) {
        try {
            const data = await fs.promises.readFile(filePath, 'utf8');
            return data;
        } catch (error) {
            console.error(`Error reading file: ${error.message}`);
        }
    }

    getFileInfo(filePath) {
        const parsedPath = path.parse(filePath);
        return {
            filePath,
            directory: parsedPath.dir,
            name: parsedPath.name,
            extension: parsedPath.ext,
            type: this.determineFileType(filePath)
        };
    }

    determineFileType(filePath) {

        const extension = path.extname(filePath);
        const stat = fs.statSync(filePath)

        if (stat.isDirectory()) {
            return 'Folder'
        }

        switch (extension) {
            case '.ieactor': return 'Actor';
            case '.iemesh': return 'Mesh';
            case '.ieanim': return 'Animation';
            case '.ieaudio': return 'Audio';
            case '.ieui': return 'UI';
            case '.scene': return 'Scene';
            case '.iemat': return 'Material';
            case '.iemap': return 'Map';
            case '.ieasset': return 'Texture';
            case '.loom': return 'Script';
            case '.iepr': return 'Project';
            default: return 'Custom';
        }
    }

    getDirectoriesRecursive(name, dir, result = {}) {
        const files = fs.readdirSync(dir);

        // Initialize the object for the current directory
        result = { name: name, type: "directory", path: dir, children: [] };

        files.forEach(file => {
            const fullPath = path.join(dir, file);
            const extension = path.extname(fullPath)
            const fileName = path.basename(fullPath, extension)
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                const directory = { name: fileName, type: "directory", path: fullPath, children: [] };
                result.children.push(this.getDirectoriesRecursive(fileName, fullPath, directory));
            } else {
                result.children.push({ name: fileName, type: "file", path: fullPath, extension: extension })
                const data = {
                    filePath: fullPath,
                    fileName: fileName,
                    fileType: this.determineFileType(fullPath)
                }
                let fileImported = new CustomEvent('fileImported', { detail: data });
                document.dispatchEvent(fileImported);
            }

        });

        return result;
    }

    scanDir(dir) {
        const files = fs.readdirSync(dir);
        const result = []

        files.forEach((file, index) => {
            const fullPath = path.join(dir, file);
            const fileName = path.basename(fullPath, path.extname(fullPath))
            const extension = path.extname(fullPath)
            const stat = fs.statSync(fullPath);


            if (stat.isDirectory()) {
                if (!fileName.startsWith('.'))
                    result.push({ name: fileName, type: "directory", path: fullPath });
            } else {
                if (!fileName.startsWith('.'))
                    result.push({ name: fileName, type: "file", path: fullPath, extension: extension })
            }

        });

        return result
    }

    scanFile(fullPath) {

        return { name: path.basename(fullPath, path.extname(fullPath)), type: "file", path: fullPath, extension: path.extname(fullPath) }
    }

    async mkdir(name, parentPath) {
        try {
            const dirPath = path.join(parentPath, name);
            await fs.promises.mkdir(dirPath, { recursive: true });
            return dirPath;
        } catch (error) {
            console.error(`Error creating directory: ${error.message}`);
        }
    }

    async writeToFile(data, filePath) {
        try {
            await fs.promises.writeFile(filePath, data);
        } catch (error) {
            console.error(`Error writing to file: ${error.message}`);
        }
    }

    createPath(...paths) {
        return path.join(...paths);
    }

    async copyTextToClipboard(item) {
        try {
            await clipboard.writeText(item);
            console.log('Text copied to clipboard.');
        } catch (error) {
            console.error(`Error copying text to clipboard: ${error.message}`);
        }
    }

    async pasteTextFromClipboard() {
        try {
            const text = await clipboard.readText();
            console.log('Text pasted from clipboard:', text);
            return text;
        } catch (error) {
            console.error(`Error pasting text from clipboard: ${error.message}`);
        }
    }

    requestRelativePath(basePath, targetPath) {
        try {
            const relativePath = path.relative(basePath, targetPath);
            return relativePath;
        } catch (error) {
            console.error(`Error getting relative path: ${error.message}`);
        }
    }

    openEditor(filepath) {
        const { type } = this.getFileInfo(filepath)
        document.dispatchEvent(new CustomEvent('openEditor', { detail: { filePath: filepath, type: type } }))
        // switch (type) {
        //     case 'Actor':
        //         // ipcRenderer.invoke('open-actor-editor', filepath);
        //         break;

        //     case 'UI':

        //         // ipcRenderer.invoke('open-ui-editor', filepath);
        //         break;

        //     default:
        //         break;
        // }
    }

    executeUI(ui, scene, camera) {

        const interpreter = new Interpreter();
        interpreter.globalEnv.MK_VAR('self', ui);
        interpreter.globalEnv.parent = this.environment
        // ui.script.environment.parent = interpreter.globalEnv.parent
        interpreter.execute(ui.script.code, ui.filePath);
        interpreter.execute(
            `
if (onStarted):
    onStarted()
`, '', '')
        const updateLoop = () => {
            if (this.isPlaying && !this.isPaused) {
                requestAnimationFrame(updateLoop)
                interpreter.execute(
                    `
if (onTick):
    onTick()
`, '', '')
            }
        }
    }

    executeMainScript(scene, camera) {
        const script = this.mainScript
        script.environment.parent = this.environment
        const interpreter = new Interpreter();
        interpreter.globalEnv.parent = script.environment
        interpreter.execute(script.code, script.filePath);

        interpreter.execute(
            `
if (onStarted):
    onStarted()
`, '', '')
        const updateLoop = () => {
            if (this.isPlaying && !this.isPaused) {
                requestAnimationFrame(updateLoop)
                interpreter.execute(
                    `
if (onTick):
    onTick()
`, '', '')
            }
        }
    }

    executeActor(actor, scene, camera) {

        const interpreter = new Interpreter();
        interpreter.globalEnv.MK_VAR('self', actor);
        interpreter.globalEnv.parent = this.environment
        interpreter.execute(actor.script.code, actor.filePath);

        interpreter.execute(
            `
if (onStarted):
    onStarted()
`, '', '')
        const updateLoop = () => {
            if (this.isPlaying && !this.isPaused) {
                requestAnimationFrame(updateLoop)
                interpreter.execute(
                    `
if (onTick):
    onTick()
`, '', '')
            }
        }
    }

    setupPlayerEvents() {
        document.addEventListener('keypress', this.playerKeyPressEvents)
    }

    removePlayerEvents() {
        document.removeEventListener('keypress', this.playerKeyPressEvents)
    }
    playerKeyPressEvents(event) {
        const code = event.code
        const cEvent = new CustomEvent(code, {})
        document.dispatchEvent(cEvent)
        // console.log(event)
    }

    play() {
        this.isPlaying = true;
        this.isPaused = false;
        this.indicate('Playing')
        const [playSCene, camera] = this.startPlayer()
        this.playingScene = playSCene
        this.setupPlayerEvents()
        this.environment.MK_VAR("Scene", this.playingScene);
        this.dispatchEvent('play', { playingScene: this.playingScene });
        this.playingScene.traverse(child => {
            if (child.type === "Actor") {
                this.executeActor(child, playSCene, camera)
            }
        })

        this.IUG.traverse(child => {
            if (child.script) {
                this.executeUI(child, playSCene, camera)
            }
        })
        this.executeMainScript(playSCene, camera)

    }

    pause() {
        this.isPaused = true;
        this.removePlayerEvents()
        this.dispatchEvent('pause', { playingScene: this.playingScene });
    }

    stop() {
        this.isPlaying = false;
        this.isPaused = false;
        this.stopIndicate()
        this.stopPlayer()
        this.playingScene = null;
        this.removePlayerEvents()
        this.dispatchEvent('stop', { mainScene: this.mainScene });
        this.removeEvents()
    }

    removeEvents() {
        const event = new CustomEvent('removeEvents');
        document.dispatchEvent(event);
    }

    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail: detail });
        document.dispatchEvent(event);
    }

    spawnObject(name, uuid) {
        const spawnEvent = new CustomEvent('spawnObject', { detail: { name, uuid } });
        document.dispatchEvent(spawnEvent);
    }

    createActor(actor) {
        const actorEvent = new CustomEvent('createActor', { detail: { actor } });
        document.dispatchEvent(actorEvent);
    }

    previewActor(actor) {
        const previewEvent = new CustomEvent('previewActor', { detail: { actor } });
        document.dispatchEvent(previewEvent);
    }

    sceneUpdated(newMap) {
        this.mainScene = newMap;
        this.dispatchEvent('sceneUpdated', { mainScene: this.mainScene });
    }
}

if (window.localStorage.getItem('Project')) {
    const Project = JSON.parse(window.localStorage.getItem('Project'));
    new Engine(Project);
} else {
    new Engine();
}

