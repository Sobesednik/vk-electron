const { ipcRenderer } = require('electron')

function getRandomId() {
    return Math.floor(Math.random() * 1000000)
}

function createIpcPromise(mid) {
    return new Promise((resolve, reject) => {
        const handler = (e, message) => {
            console.log(`${mid} response`, message)
            ipcRenderer.removeListener(mid, handler)
            if (message && message.error) {
                console.error(message.error)
                return reject(message.error)
            }
            return resolve(message)
        }
        ipcRenderer.on(mid, handler)
    });
}

function send(method, data) {
    const mid = String(getRandomId())
    const p = createIpcPromise(mid)
    const message = { mid, method, data }
    console.log('sending message', message)
    ipcRenderer.send('asynchronous-message', message)
    return p
}

module.exports = {
    send,
};
