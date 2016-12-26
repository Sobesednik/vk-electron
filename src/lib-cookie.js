const debug = require('debug')('app:lib-cookie');

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

function removeCookie(session, cookieURL, name) {
    debug('remove cookie %s from %s', name, cookieURL);
    return new Promise((resolve, reject) => {
        session.cookies.remove(cookieURL, name, (err) => {
            if (err) {
                return reject(err);
            }
            return resolve();
        });
    });
}

module.exports = {
    get: getCookie,
    set: setCookie,
    remove: removeCookie,
}
