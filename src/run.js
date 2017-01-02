const electron = require('electron');
const {session, app, ipcMain, BrowserWindow} = electron;
const url = require('url');
const qs = require('querystring');
const authenticateVK = require('electron-vk-oauth2');
const debug = require('debug')('app:main');
const lib = require('./lib');
const VKError = require('./vkError');
const vkLib = require('./vkLib');
const api = require('./api')
const VK = vkLib.VK;

const COOKIE_URL = 'https://vk.sobesednik.media';

const getSession = () => session.defaultSession

process.on('unhandledRejection', console.log);

class App {
    constructor(session, cookieUrl, ipc) {
        this.session = session;
        this.cookieUrl = cookieUrl;

        ipc.on('asynchronous-message', api.bind(this));

        this.createWindow();
    }

    /**
     * Remove all session cookies.
     */
    async logout() {
        const res = await lib.logout(this.session)
        this.vk.logout()
        return res
    }

    // /**
    //  * Send a message to the renderer process.
    //  * @param {string} channel - the channel
    //  * @param {object} message - the message
    //  */
    // sendMessage(channel, message) {
    //     debug('sending message', channel, message)
    //     if (this.win && this.win.webContents) {
    //         this.win.webContents.send(channel, message);
    //     }
    // }
    sendError(channel, error) {
        this.sendMessage(channel, error.message);
    }

    /**
     * This function is invoked when users click on "login vk" button.
     */
    async loginVK() {
        debug('loginVK: start');
        const authVk = await authenticateVK({
            appId: '5551949',
            scope: 'photos',
            revoke: true,
            display: 'page',
        }, {
            width: 1024,
            height: 720,
            minimizable: false,
            maximizable: false,
            resizable: false,
            parent: this.win,
        })
        debug('loginVK: authenticated vk', authVk);
        const res2 = await lib.setAccessTokenCookie(this.session, this.cookieUrl, authVk.accessToken, authVk.expiresIn)
        debug('loginVK: set access token cookie', res2);
        return this.vkAuthFlow();
//            .then(user => this.sendMessage('vkUser', user))
//            .catch((err) => {
//                debug(err);
//                this.sendMessage('error', 'Could not login into VK');
//            });
    }

    /**
     * Initialise VK object, check permissions and get information about current user.
     */
    async vkAuthFlow() {
        debug('vkAuthFlow: start')
        try {
            const vk = await this.createVK();
            debug('vkAuthFlow: created vk', vk);
            const permissions = await this.checkPermissions();
            debug('vkAuthFlow: checked permissions', permissions);
            const user = await this.getUser();
            debug('vkAuthFlow: got user', user);
            return user;
        } catch(err) {
            debug(err);
            if (err instanceof VKError && err.code === VKError.AUTH_FAILED) {
                lib.removeAccessTokenCookie(this.session, this.cookieUrl);
            }
            throw err;
        }
    }

    /**
     * Create main window.
     */
    createWindow() {
        const win = this.win = new BrowserWindow({ width: 800, height: 600 });

        win.loadURL(`http://localhost:3000`)
        win.openDevTools();

        // if (process.env.NODE_ENV === 'development') {
        // } else {
        //     win.loadURL(`file://${__dirname}/index.html`)
        // }

        // win.loadURL(`file://${__dirname}/html/loading.html`);

        // const server = this.server = new Server();
        // const serverStartPromise = server.start(3000);

        // const p = this.vkAuthFlow();

        // win.webContents.once('did-finish-load', async () => {
        //     await serverStartPromise;
        //     win.loadURL('http://localhost:3000/');
        // });
    }

    /**
     * Find a token in cookies and create a new VK instance.
     * @returns {Promise} A promise resolved with VK object or rejected promise if token
     * could not be found in cookies.
     */
    async createVK() {
        debug('create vk');
        const accessToken = await lib.getAccessTokenCookie(this.session, this.cookieUrl)
        debug('Got token %o', accessToken);
        this.vk = new VK(accessToken);
        return this.vk;
    }

    /**
     * Check if access token has required permissions.
     */
    async checkPermissions() {
        if (!this.vk) {
            throw new Error('VK object has not been initialised');
        }
        const permissions = await this.vk.checkTokenPermissions(vkLib.flags.PHOTOS);
        debug('checkPermissions', permissions);
        return permissions;
    }

    /**
     * Return information about current VK user.
     */
    async getUser() {
        if (!this.vk) {
            throw new Error('VK object has not been initialised');
        }
        const user = await this.vk.getUser();
        debug('getUser', user);
        return user;
    }

    async getAlbums() {
        if (!this.vk) {
            throw new Error('VK object has not been initialised');
        }
        const albums = await this.vk.getAlbums();
        debug('getAlbums', albums);
        return albums;
    }
}

function main() {
    const vkapp = new App(getSession(), COOKIE_URL, ipcMain);
}

app.on('ready', main);

// Quit when all windows are closed.
app.on('window-all-closed', app.quit);
