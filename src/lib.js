const debug = require('debug')('app:lib');
const cookies = require('./lib-cookie');

async function getAccessTokenCookie(session, cookieURL) {
    const accessTokenCookies = await cookies.get(session, cookieURL, 'access_token');
    debug('Access token cookie: %o', accessTokenCookies);
    if (accessTokenCookies.length) {
        const cookie = accessTokenCookies[0];
        if (new Date().getTime() < cookie.expirationDate) {
            return cookie.value;
        }
        throw new Error('Access token cookie has expired');
    }
    throw new Error('No access token is stored');
}

async function setAccessTokenCookie(session, cookieURL, accessToken, expiresIn) {
    const expireDate = new Date().getTime() + parseInt(expiresIn * 1000);
    debug('set access token cookie %s, expires on %s', accessToken, new Date(expireDate));
    return await cookies.set(session, cookieURL, 'access_token', accessToken, expireDate);
}

async function removeAccessTokenCookie(session, cookieURL) {
    return await cookies.remove(session, cookieURL, 'access_token');
}

/**
 * Log user out by clearing all cookies.
 * @returns {Promise} A fulfilled promise when cookies were destroyed and 
 * rejected promise otherwise.
 */
function logout(session) {
    return new Promise((resolve, reject) => {
        session.clearStorageData((err) => {
            if (err) {
                return reject(err);
            }
            debug('Cleared session storage data');
            return resolve();
        });
    });
}

module.exports = {
    getAccessTokenCookie,
    setAccessTokenCookie,
    removeAccessTokenCookie,
    logout,
}
