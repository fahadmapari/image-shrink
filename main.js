const path = require('path');
const os = require('os');
const { app, BrowserWindow, Menu,  ipcMain, shell } = require("electron");
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const slash = require('slash');

let mainWindow;
let aboutWindow;

process.env.NODE_ENV = "production";
const isDev = process.env.NODE_ENV === "development" ? true : false;
const isMac = process.platform === "darwin" ? true : false;
const isWin = process.platform === "win32" ? true : false;
const menu = [  
    ...(isMac ? [{ role: 'appMenu'}] : [])
    ,
    {
     role: 'fileMenu'
    },
    {label: 'About', 
     click: ()=>{ createAboutWindow() }
    }
    ,
    ...(isDev ? [{
        label: 'Developer',
        submenu: [
            { role: 'reload'},
            {role: 'forcereload'},
            {type: 'separator'},
            {role: 'toggledevtools'},
        ]
    }] : [])
];


function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: "ImageShrink",
        width: 500,
        height: 600,
        icon: `${__dirname}/assets/icons/Icon_256x256.png`,
        resizable: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    
    mainWindow.loadFile(`${__dirname}/app/index.html`);
}

function createAboutWindow() {
    aboutWindow = new BrowserWindow({
        title: "ImageShrink",
        width: 300,
        height: 300,
        icon: `${__dirname}/assets/icons/Icon_256x256.png`,
        resizable: false
    });
    
    aboutWindow.loadFile(`${__dirname}/app/about.html`);
}


//events

ipcMain.on('output:open', (e)=>{ 
    shell.openPath(path.join(os.homedir(), 'imageshrink'));
});

ipcMain.on('image:minimize', (e, options)=>{
    options.dest = path.join(os.homedir(), 'imageshrink');
    shrinkImage(options);
});



async function shrinkImage({imgPath, quality, dest}){
    try{
    const files = await imagemin([slash(imgPath)], {
        destination: dest,
        plugins: [
            imageminMozjpeg({quality}),
            imageminPngquant({
                quality: [quality / 100, quality / 100]
            })
        ]
    });

    mainWindow.webContents.send("image:done");
    shell.openPath(dest);
    }catch(err){
        console.log(err);
    }
}

app.on('ready', ()=>{
    createMainWindow();

    Menu.setApplicationMenu(Menu.buildFromTemplate(menu));

    mainWindow.on('closed', ()=>{
        mainWindow = null;
    });
});