const request = require('request');
const debug = require('debug')('vkLib');
const VKError = require('./vkError');

const flags = {
    PHOTOS: 4,
    MESSAGES: 4096,
}

function req(options) {
    return new Promise((resolve, reject) => {
        function callback(error, response, body) {
            if (error) {
                return reject(error);
            }
            return resolve(body);
        }
        request(options, callback);
    });
}

function vkApiRequest(method, options) {
    const opts = {
        url: `https://api.vk.com/method/${method}`,
        qs: options,
    };
    debug('vk api request: %o', opts);
    return req(opts).then((res) => {
        const result = JSON.parse(res);
        debug('vk api result: %o', result);
        if ('error' in result) {
            throw new VKError(result.error);
        }
        if ('response' in result) {
            return result.response;
        }
    });
}

function getPermissions(access_token) {
    return vkApiRequest('account.getAppPermissions', {
        access_token,
    });
}

function getUser(access_token) {
    return vkApiRequest('users.get', {
        access_token,
    }).then((res) => {
        if (res.length) {
            return res[0];
        }
        throw new Error('Could not get information about user');
    })
}

function getAlbums() {

}

/**
 * Check if token has got required permissions.
 * @param {string} token - the token to check permissions against
 * @param {int} flag - the required permission flag
 */
function checkTokenPermissions(token, flag) {
    return getPermissions(token).then((res) => {
        debug('Permissions: %s', res);
        if (!(res & flag)) {
            throw new Error(`No access for +${flag}`);
        }
        return token;
    });
}

class VK {
    constructor(token) {
        this.accessToken = token;
    }
    getAppPermissions() {
        return getPermissions(this.accessToken);
    }
    getUser() {
        return getUser(this.accessToken);
    }
    checkTokenPermissions(flag) {
        return checkTokenPermissions(this.accessToken, flag);
    }
    getAlbums() {
        return vkApiRequest('photos.getAlbums', {
            need_system: 1,
            need_covers: 1,
            photo_sizes: 1,
            access_token: this.accessToken,
        });
    }
}

module.exports = {
    flags,
    VK,
}
