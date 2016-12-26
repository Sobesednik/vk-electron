const { ipcRenderer } = require('electron');

function createIpcPromise(event) {
    return new Promise((resolve, reject) => {
        const handler = (e, message) => {
            console.log(`${event} response`, e, message);
            ipcRenderer.removeListener(event, handler);
            if (message && message.error) {
                return reject(message.error);
            }
            return resolve(message);
        }
        console.log(ipcRenderer)
        ipcRenderer.on(event, handler);
    });
}

function send(data, listener) {
    const p = createIpcPromise(listener || data);
    ipcRenderer.send('asynchronous-message', data);
    return p;
}

module.exports = {
    send,
};
