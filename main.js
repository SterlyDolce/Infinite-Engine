const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const os = require('os')


const mainPath = path.join(__dirname, 'MainEditor', 'index.html');
const UIEditorPath = path.join(__dirname, 'UIEditor', 'index.html');
const ActorEditorPath = path.join(__dirname, 'ActorEditor', 'index.html');

let inputPath = mainPath;


function createWindow(html) {
    const mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        backgroundColor: 'black',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        frame: false
    });
    mainWindow.loadFile(html);
    // mainWindow.webContents.openDevTools();


    return mainWindow;
}

function openEditor(parentWindow, object, EditorPath) {
    const editorWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        backgroundColor: 'black',
        // parent: parentWindow,
        // modal: true,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    editorWindow.loadFile(EditorPath);

    

    editorWindow.webContents.on('did-finish-load', () => {
        editorWindow.webContents.send('data', object);
    });
}


function openChild(parentWindow, path, object) {
    const childWindow = new BrowserWindow({
        width: 800,
        height: 500,
        parent: parentWindow, // Set the parent window
        backgroundColor: 'black',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    childWindow.loadFile(path);

    // Send the object data to the new window after it has finished loading
    childWindow.webContents.on('did-finish-load', () => {
        childWindow.webContents.send('data', object);
    });


    return new Promise((resolve, reject) => {
        ipcMain.once('openProject', (event, result) => {
            resolve(result);
            console.log(result)
            childWindow.close();
        });

        childWindow.on('closed', () => {
            reject(new Error('Child window was closed'));
        });
    });
}


app.whenReady().then(() => {
    const mainWindow = createWindow(inputPath);
    // const mainWindow = createWindow(inputPath);

    // Add an IPC listener to open the ActorEditor
    ipcMain.handle('open-actor-editor', (event, object) => {
        openEditor(mainWindow, object, ActorEditorPath); // Pass the main window as the parent
    });

    ipcMain.handle('open-ui-editor', (event, object) => {
        openEditor(mainWindow, object, UIEditorPath); // Pass the main window as the parent
    });

    ipcMain.handle('createNew', (event, version) => {
        const createNewPath = path.join(__dirname, 'createNew', 'index.html');
        const result = openChild(mainWindow, createNewPath, version)

        return result
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow(inputPath);
    }
});

ipcMain.on('window-control', (event, arg) => {

    const window = BrowserWindow.fromWebContents(event.sender);

    if (arg === 'close') {
        window.close();
    } else if (arg === 'minimize') {
        window.minimize();
    } else if (arg === 'maximize') {
        if (process.platform === 'darwin') {
            window.setFullScreen(!window.isFullScreen());
        } else {
            if (window.isMaximized()) {
                window.unmaximize();
            } else {
                window.maximize();
            }
        }
    }
});

ipcMain.handle('save-dir-dialog', async () => {
    try {
        const result = await dialog.showSaveDialog({
            properties: ['createDirectory'],
            defaultPath: path.join(os.homedir(), 'Documents', 'IEProjects')
        });
        return result;
    } catch (error) {
        console.error('Error opening save directory dialog:', error);
        throw error; // Re-throw to propagate the error
    }
});

ipcMain.handle('open-dir-dialog', async () => {
    try {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory'],
            defaultPath: path.join(os.homedir(), 'Documents', 'IEProjects')
        });
        return result;
    } catch (error) {
        console.error('Error opening directory dialog:', error);
        throw error;
    }
});

ipcMain.handle('open-file-dialog', async () => {
    try {
        const result = await dialog.showOpenDialog({
            properties: ['openFile']
        });
        return result;
    } catch (error) {
        console.error('Error opening file dialog:', error);
        throw error;
    }
});
