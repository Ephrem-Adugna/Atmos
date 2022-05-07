const { app, BrowserWindow, Menu, Tray, nativeImage } = require('electron')
const path = require('path')
const http = require("http");
var os = require('os');
const dns = require("dns");
let connected = false;
let tray = null
let host = '';
let port = '';
const { ipcMain } = require('electron')
let spawn = require("child_process").spawn;

  

    const createWindow = () => {
        const win = new BrowserWindow({
            width: 960,
            height: 540,
            webPreferences: {
                sandbox: false,
                preload: path.join(__dirname, 'preload.js'),
                nodeIntegration: true,
                enableRemoteModule: true,
                contextIsolation: false,
                webSecurity: false,
            },
            autoHideMenuBar: true,
            icon: './icon.png',
            titleBarStyle: 'hidden',
            titleBarOverlay: {
                color: '#211134',
                symbolColor: '#ffffff'
            }

        })

        win.loadFile('index.html').then(() => {
            if (connected) {
                console.log('sent')
                win.webContents.send('Server', { 'server': `http://${host}:${port}` });
            }
            else {
                win.webContents.send('NotConnected', {});

            }
         })
     
        win.on('minimize', function (event) {
            event.preventDefault();
            win.hide();
        });
        win.on('close', function (event) {
            if (!app.isQuiting) {
                event.preventDefault();
                win.hide();
            }

            return false;
        });
        const requestListener = function (req, res) {
            res.writeHead(200);
            req.on('data', data => {
                console.log(req.url);

                if (req.url == '/send') {
                    win.webContents.send('SentItem', { 'Item': JSON.parse(data) });
                    res.end();

                }
                else if (req.url == '/request') {
                    win.webContents.send('DeviceRequest', { 'Item': JSON.parse(data) });
                    ipcMain.on('Allowed', (event, arg) => { 
                        res.end('{ "allowed": ' + arg.allowed + '}');
                       

                    })
                }
            });
        };
        dns.resolve("www.google.com", function (err, addr) {
            if (err) {
                connected = false;
                return;
            }
            connected = true;
            var networkInterfaces = os.networkInterfaces();

             host = networkInterfaces['Wi-Fi'][networkInterfaces['Wi-Fi'].length - 1].address;
                const server = http.createServer(requestListener);
                server.listen(0, host, () => {
                    port = server.address().port;
                    console.log(`Server is running on http://${host}:${server.address().port}`);

                });
           
        });
      
    }
   

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit()
    })
    app.whenReady().then(() => {
        createWindow()

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) createWindow()
        });
        if (process.platform === 'win32') {
            app.setAppUserModelId(app.name);
        }
        icon = nativeImage.createFromPath(path.join(__dirname, "icon.png"))

        tray = new Tray(icon)
        const contextMenu = Menu.buildFromTemplate([
            {label: "Quit",
            click() {
                app.quit();
            }}
        ])
        tray.setToolTip('Open Atmos')
        tray.setContextMenu(contextMenu)
        tray.on('click', () => {
            BrowserWindow.getAllWindows()[0].show();
        });
    })

ipcMain.on('Refresh', (event, arg) => { 
    app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) })

});
ipcMain.on('Quit', (event, arg) => {

    app.exit(0);
});