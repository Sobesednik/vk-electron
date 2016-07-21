const electron = require('electron');
const {session, app, ipcMain, BrowserWindow} = electron;
const url = require('url');
const qs = require('querystring');
const debug = require('debug')('app:main');
const lib = require('./lib');
const vkLib = require('./vkLib');
const VKError = require('./vkError');
const Server = require('./server')
const VK = vkLib.VK;

const COOKIE_URL = 'https://vk.sobesednik.media';

function getSession() {
    return session.defaultSession;
}

/**
 * Opens a new window to perform VK authentication.
 * @returns {Promise} A promise fillfilled with accessToken, userId and expiresIn values,
 * or rejected promise if login request was cancelled.
 */
function authenticateVK(mainWin) {
    const URL = 'https://oauth.vk.com/authorize';
    const APP_ID = process.env.APP_ID || '5551949';
    const SCOPE = 'photos';
    const RESPONSE_TYPE = 'token';

    const vkurl = `${URL}?client_id=${APP_ID}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}&display=popup`;

    const win = new BrowserWindow({ parent: mainWin, height: 430, width: 655 });

    debug('open vk auth window %s', vkurl);
    win.loadURL(vkurl);

    return new Promise((resolve, reject) => {
        win.webContents.on('did-get-redirect-request', function (event, oldUrl, newUrl) {
            const data = url.parse(newUrl);
            debug(data);
            if (data.host === 'oauth.vk.com' && data.pathname === '/blank.html') {
                const query = qs.parse(data.hash.substring(1));
                win.destroy();
                debug(query);
                return resolve({
                    accessToken: query.access_token,
                    userId: query.user_id,
                    expiresIn: query.expires_in,
                });

            } else if (data.host === 'login.vk.com') {
                if (!data.hash) {
                    return;
                }
                const query = qs.parse(data.hash.substring(1));
                if ('error' in query) {
                    debug(query);
                    win.destroy();
                    return reject(new Error(`${query.error_reason}: ${query.error_description}`));
                }
            }
        });
    });
}

class App {
    constructor(session, cookieUrl, ipc) {
        this.session = session;
        this.cookieUrl = cookieUrl;

        ipc.on('asynchronous-message', (event, arg) => {
            debug('async message %s', arg);
            switch (arg) {
                case 'authVK':
                    this.vkAuthFlow().then((user) => {
                        this.sendMessage('authVK', user);
                    }, (err) => {
                        this.sendError('error', err);
                    });
                    break;
                case 'loginVK':
                    this.loginVK().then((user) => {
                        this.sendMessage('authVK', user);
                    }, (err) => {
                        this.sendError('error', err);
                    });
                    break;
                case 'logout':
                    this.logout();
                    break;
                case 'getAlbums':
                    this.getAlbums();
                    break;
            }
        });

        this.createWindow();
    }

    /**
     * Remove all session cookies.
     */
    logout() {
        lib.logout(this.session).then(() => {
            this.sendMessage('logout');
        });
    }

    /**
     * Send a message to the renderer process.
     * @param {string} channel - the channel
     * @param {object} message - the message
     */
    sendMessage(channel, message) {
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
    loginVK() {
        return authenticateVK(this.win).then((res) =>
            lib.setAccessTokenCookie(this.session, this.cookieUrl, res.accessToken, res.expiresIn)
        )
            .then(() => this.vkAuthFlow());
//            .then(user => this.sendMessage('vkUser', user))
//            .catch((err) => {
//                debug(err);
//                this.sendMessage('error', 'Could not login into VK');
//            });
    }

    /**
     * Initialise VK object, check permissions and get information about current user.
     */
    vkAuthFlow() {
        return this.createVK()
            .then(() => this.checkPermissions())
            .then(() => this.getUser())
            .catch((err) => {
                debug(err);
                if (err instanceof VKError && err.code === VKError.AUTH_FAILED) {
                    lib.removeAccessTokenCookie(this.session, this.cookieUrl);
                }
                throw err;
            });
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

        win.webContents.once('did-finish-load', () => {
            serverStartPromise.then(() => {
                win.loadURL('http://localhost:3000/');
            });
        });
    }

    /**
     * Find a token in cookies and create a new VK instance.
     * @returns {Promise} A promise resolved with VK object or rejected promise if token
     * could not be found in cookies.
     */
    createVK() {
        return lib.getAccessTokenCookie(this.session, this.cookieUrl).then((accessToken) => {
            debug('Got token %o', accessToken);
            this.vk = new VK(accessToken);
        });
    }

    /**
     * Check if access token has required permissions.
     */
    checkPermissions() {
        if (!this.vk) {
            return Promise.reject(new Error('VK object has not been initialised'));
        }
        return this.vk.checkTokenPermissions(vkLib.flags.PHOTOS);
    }

    /**
     * Return information about current VK user.
     */
    getUser() {
        if (!this.vk) {
            return Promise.reject(new Error('VK object has not been initialised'));
        }
        return this.vk.getUser();
    }

    getAlbums() {
        if (!this.vk) {
            return Promise.reject(new Error('VK object has not been initialised'));
        }
        return this.vk.getAlbums().then((res) => {
            this.sendMessage('albums', res);
        });
    }
}

function main() {
    const vkapp = new App(getSession(), COOKIE_URL, ipcMain);
}

app.on('ready', main);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    app.quit();
});
