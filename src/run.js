const electron = require('electron');
const {session, app, ipcMain, BrowserWindow} = electron;
const url = require('url');
const qs = require('querystring');
const authenticateVK = require('electron-vk-oauth2');
const debug = require('debug')('app:main');
const lib = require('./lib');
const Server = require('./server')
const VKError = require('./vkError');
const vkLib = require('./vkLib');
const VK = vkLib.VK;

const COOKIE_URL = 'https://vk.sobesednik.media';

function getSession() {
    return session.defaultSession;
}
    
process.on('unhandledRejection', (reason, promise) => {
    console.log(promise);
});

//
///**
// * Opens a new window to perform VK authentication.
// * @returns {Promise} A promise fillfilled with accessToken, userId and expiresIn values,
// * or rejected promise if login request was cancelled.
// */
//function authenticateVK(mainWin) {
//    const URL = 'https://oauth.vk.com/authorize';
//    const APP_ID = process.env.APP_ID || '5551949';
//    const SCOPE = 'photos';
//    const RESPONSE_TYPE = 'token';
//    const DISPLAY = 'popup';
//    const state = Math.floor(Math.random() * 10000);
//
//    const query = qs.stringify({
//        state,
//        client_id: APP_ID,
//        response_type: RESPONSE_TYPE,
//        scope: SCOPE,
//        display: DISPLAY,
//        revoke: 1,
//        redirect_uri: 'https://oauth.vk.com/blank.html',
//    });
//
//    const vkurl = `${URL}?${query}`;
//
//    const win = new BrowserWindow({ parent: mainWin, height: 430, width: 655 });
//
//    debug('open vk auth window %s', vkurl);
//    win.loadURL(vkurl);
//
//    return new Promise((resolve, reject) => {
//        win.webContents.on('did-get-redirect-request', function (event, oldUrl, newUrl) {
//            const data = url.parse(newUrl);
//            debug(data);
//            // http://stackoverflow.com/questions/16733863/oauth2-0-implicit-grant-flow-why-use-url-hash-fragments
//            if (data.host === 'oauth.vk.com' && data.pathname === '/blank.html' && data.hash) {
//                const query = qs.parse(data.hash.substring(1));
//                debug(query);
//
//                if(!('state' in query && query.state === String(state))) {
//                    reject(new Error(`Incorrect state: expected ${query.state} to equal ${state}`));
//                } else if ('error' in query) {
//                    reject(new Error(query.error_description));
//                } else if ('access_token' in query && 'user_id' in query && 'expires_in' in query) {
//                    resolve({
//                        accessToken: query.access_token,
//                        userId: query.user_id,
//                        expiresIn: query.expires_in,
//                    });
//                }
//                win.destroy();
//            }
//        });
//        win.on('closed', () => {
//            reject(new Error('Auth window was closed before completing authentication'))
//        });
//    });
//}

async function onAsyncMessage(event, arg) {
    // ctx = app (for koa!!!)
    // this = app;

    debug('async message %s', arg);
    switch (arg) {
        case 'authVK':
            try {
                const user = await this.vkAuthFlow()
                debug('authVK: got user after auth', user);
                this.sendMessage('authVK', user)
            } catch(err) {
                this.sendError('error', err);
            }
            break;
        case 'loginVK':
            try {
                const user = await this.loginVK();
                debug('user after login', user);
                this.sendMessage('authVK', user);
            } catch(err) {
                this.sendError('error', err);
            }
            break;
        case 'logout':
            await this.logout();
            break;
        case 'getAlbums':
            await this.getAlbums();
            break;
    }
}

class App {
    constructor(session, cookieUrl, ipc) {
        this.session = session;
        this.cookieUrl = cookieUrl;

        ipc.on('asynchronous-message', onAsyncMessage.bind(this));

        this.createWindow();
    }

    /**
     * Remove all session cookies.
     */
    async logout() {
        const res = await lib.logout(this.session)
        this.sendMessage('logout');
    }

    /**
     * Send a message to the renderer process.
     * @param {string} channel - the channel
     * @param {object} message - the message
     */
    sendMessage(channel, message) {
        debug('sending message', channel, message)
        if (this.win && this.win.webContents) {
            this.win.webContents.send(channel, message);
        }
    }
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

        win.openDevTools();
        win.loadURL(`file://${__dirname}/html/loading.html`);

        const server = this.server = new Server();
        const serverStartPromise = server.start(3000);

        // const p = this.vkAuthFlow();

        win.webContents.once('did-finish-load', async () => {
            await serverStartPromise;
            win.loadURL('http://localhost:3000/');
        });
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
