const electron = require('electron');
const {session, app, ipcMain, BrowserWindow} = electron;
const url = require('url');
const qs = require('querystring');
const debug = require('debug')('main');
const lib = require('./lib');
const vkLib = require('./vkLib');
const VKError = require('./vkError');

const COOKIE_URL = 'https://vk.sobesednik.media';

let win;
/**
 * Create main window.
 */
function createWindow() {
    win = new BrowserWindow({ width: 800, height: 600 });
    win.openDevTools();
    win.loadURL(`file://${__dirname}/html/index.html`);

    const startVkLoginPromise = startVkLogin(getSession(), COOKIE_URL); // init

    win.webContents.on('did-finish-load', () => {
        startVkLoginPromise.then((res) => {
            win.webContents.send('vkUser', res);
        }, (err) => {
            debug(err);
            if (err instanceof VKError && err.code === VKError.AUTH_FAILED) {
                lib.removeAccessTokenCookie(getSession(), COOKIE_URL);
            }
        }).then(() => {
            win.webContents.send('loaded');
        }, (err) => {
            debug(err);
        });
    });
}

/**
 * Find a token in cookies and check if it has not expired and permissions are sufficient.
 * Also loads information about the current user.
 * @returns {Promise} A promise fulfilled with user information or rejected if could not login.
 */
function startVkLogin(session, cookieUrl) {
    return lib.getAccessTokenCookie(session, cookieUrl).then((accessToken) => {
        debug('got token %o', accessToken);
        return vkLib.checkTokenPermissions(accessToken, vkLib.flags.PHOTOS);
    }).then(token => vkLib.getUser(token));
}

function getSession() {
    return session.defaultSession;
}

/**
 * Opens a new window to perform VK authentication.
 * @param {BrowserWindow} mainWin - main application window on top of which
 * the login window should be displayed.
 * @returns {Promise} A promise fillfilled with accessToken, userId and expiresIn values,
 * or rejected promise if login request was cancelled.
 */
function loginVK(mainWin) {
    const URL = 'https://oauth.vk.com/authorize';
    const APP_ID = process.env.APP_ID || '5551949';
    const SCOPE = 'photos';
    const RESPONSE_TYPE = 'token';

    const vkurl = `${URL}?client_id=${APP_ID}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}&display=popup`;

    const win = new BrowserWindow({ height: 430, width: 655, show: false });

    debug('open vk auth window %s', vkurl);
    win.loadURL(vkurl);
    win.once('ready-to-show', () => {
        win.show();
    });

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

ipcMain.on('asynchronous-message', (event, arg) => {
  if (arg === 'login') {
      loginVK(win).then((res) => {
          return lib.setAccessTokenCookie(getSession(), COOKIE_URL, res.accessToken, res.expiresIn)
              .then(() => {
                  return startVkLogin(getSession(), COOKIE_URL).then((res) => {
                      win.webContents.send('vkUser', res);
                  });
              });
      }, (err) => {
          debug(err);
          win.webContents.send('error', 'Could not login into VK');
      });
  } else if (arg === 'logout') {
      lib.logout(getSession()).then(() => {
          win.webContents.send('logout');
      });
  }
});

app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    app.quit();
});
