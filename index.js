const { ipcRenderer, BrowserWindow } = require('electron');
const path = require('path');
const ngrokPath = path.join(__dirname, 'ngrok.exe');
let items = [];
let server = '';
let devicesVisible = false;
localStorage.clear();

let devices = localStorage.getItem('devices') == null ? [] : JSON.parse(localStorage.getItem('devices'));
ipcRenderer.on('SentItem', (event, arg) => {
    if (devices.includes(arg.Item.from)) {
        document.getElementById('noItems')?.remove();
        document.getElementById('items').style.display = 'inline-block';
        var itemsElem = document.getElementById("items");
        items.push(arg.Item);
        let item = arg.Item.item;
        if (item.length > 128) {
            item = item.substring(0, 125) + '...';
         }
        let from = arg.Item.from;
        itemsElem.innerHTML += `<div  class="item"><div class="copyClose"><img id="copy${items.length - 1}" class="copy" alt="copy" height=30 width=30  src="./copyImg.png"> </div><h1>Sent From "${from}"</h1><h2 class="sentText" id="${items.length - 1}">${item}</h2></div>`;
        document.getElementById(`copy${items.length - 1}`).addEventListener('click', function () {
            var copyText = document.getElementById(items.length - 1);
            navigator.clipboard.writeText(copyText.textContent);
        });
        new Notification(`Item from ${arg.Item.from}`, { body: arg.Item.item, icon: 'icon.png' })
            .onclick = () => { }
    }
})
ipcRenderer.on('Server', (event, arg) => {
    console.log('recieved')
    document.querySelectorAll("#qrcode").forEach(elem => { 
        new QRCode(elem, arg.server);
        server = arg.server;
    })

});
ipcRenderer.on('NotConnected', (event, arg) => {
    document.getElementById('devices').style.display = 'none';
    document.getElementById('noItems').style.display = 'none';
    document.getElementById('devicesbtn').style.display = 'none';
    document.getElementById('items').style.display = 'none';
    document.getElementById('noConnection').style.display = 'inline-block';
});
ipcRenderer.on('DeviceRequest', async(event, arg) => {
    new Notification(`Device Join Request from ${arg.Item.from}`, { icon: 'icon.png' }).onshow = () => {
        if (window.confirm(`Allow ${arg.Item.from} to Link?`)) {
            ipcRenderer.send('Allowed', { allowed: true });
            devices.push(arg.Item.from);
            localStorage.setItem('devices', JSON.stringify(devices));
        }
        else {
            ipcRenderer.send('Allowed', { allowed: false });

        }
    }
});
function showDevices() {
    devicesVisible = !devicesVisible;
    if (devicesVisible) { 
        document.getElementById('devices').style.display = 'inline-block';
        document.getElementById('devices').innerHTML = '';
        devices.forEach(device => {
            document.getElementById('devices').innerHTML += `<div class="device"><h5 class="deviceName">${device}</h5></div>`;
        });
        document.getElementById('devices').innerHTML += `<div id="qrcodedevices"></div>`;
        new QRCode(document.getElementById('qrcodedevices'), server);

    }
    else {
        document.getElementById('devices').style.display = 'none';
    }
}
function refresh(){
    ipcRenderer.send('Refresh', { });


} function quit() {
    ipcRenderer.send('Quit', {});


}