const debug = require('debug')('lib');

function getCookie(session, cookieURL, name) {
    debug('get cookie %s from %s', name, cookieURL);
    return new Promise((resolve, reject) => {
        session.cookies.get({
            name,
            url: cookieURL,
        }, (err, res) => {
            if (err) {
                return reject(err);
            }
            return resolve(res);
        });
    });
}

function setCookie(session, cookieURL, name, value, expirationDate) {
    debug('set cookie %s = %s for %s', name, value, cookieURL);
    return new Promise((resolve, reject) => {
        session.cookies.set({
            name,
            value,
            expirationDate,
            url: cookieURL,
        }, (err) => {
            if (err) {
                return reject(err);
            }
            return resolve();
        });
    });
}

function getAccessTokenCookie(session, cookieURL) {
    return getCookie(session, cookieURL, 'access_token').then((res) => {
        debug('Access token cookie: %o', res);
        if (res.length) {
            const cookie = res[0];
            if (new Date().getTime() < cookie.expirationDate) {
                return cookie.value;
            }
            throw new Error('Access token cookie has expired');
        }
        throw new Error('No access token is stored');
    });
}

function setAccessTokenCookie(session, cookieURL, accessToken, expiresIn) {
    const expireDate = new Date().getTime() + parseInt(expiresIn * 1000);
    debug('set access token cookie %s, expires on %s', accessToken, new Date(expireDate));
    return setCookie(session, cookieURL, 'access_token', accessToken, expireDate);
}

module.exports = {
    getAccessTokenCookie,
    setAccessTokenCookie,
}