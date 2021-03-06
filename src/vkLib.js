const request = require('request');
const debug = require('debug')('app:vkLib');
const VKError = require('./vkError');

const flags = {
    PHOTOS: 4,
    MESSAGES: 4096,
}

function req(options) {
    return new Promise((resolve, reject) =>
        request(options, (error, response, body) => {
            if (error) {
                return reject(error);
            }
            return resolve(body);
        })
    );
}

async function vkApiRequest(method, options) {
    const opts = {
        url: `https://api.vk.com/method/${method}`,
        qs: options,
    };
    debug('vk api request: %o', opts);
    const res = await req(opts);
    const result = JSON.parse(res);
    debug('vk api result: %o', result);
    if ('error' in result) {
        throw new VKError(result.error);
    }
    if ('response' in result) {
        return result.response;
    }
}

async function getPermissions(access_token) {
    return await vkApiRequest('account.getAppPermissions', {
        access_token,
    });
}

async function getUser(access_token) {
    const res = await vkApiRequest('users.get', {
        access_token,
        fields: 'photo',
    })
    if (res.length) {
        return res[0];
    }
    throw new Error('Could not get information about user');
}

/**
 * Check if token has got required permissions.
 * @param {string} token - the token to check permissions against
 * @param {int} flag - the required permission flag
 */
async function checkTokenPermissions(token, flag) {
    const res = await getPermissions(token);
    debug('Permissions: %s', res);
    if (!(res & flag)) {
        throw new Error(`No access for +${flag}`);
    }
    return token;
}

class VK {
    constructor(token) {
        this.accessToken = token;
    }
    logout() {
        delete this.accessToken;
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
            access_token: this.accessToken,
            need_system: 1,
            need_covers: 1,
            photo_sizes: 1,
        });
    }
    getAlbum(id) {
        return vkApiRequest('photos.getAlbums', {
            access_token: this.accessToken,
            album_ids: id,
            need_covers: 1,
            photo_sizes: 1,
        })
    }
    getPhotos(filter) {
        return vkApiRequest('photos.get', {
            access_token: this.accessToken,
            album_id: filter.aid,
            offset: filter.offset,
            count: filter.count,
            photo_sizes: 1,
            rev: 1,
        })
    }
    getComments(aid) {
        return vkApiRequest('photos.getAllComments', {
            access_token: this.accessToken,
            album_id: aid,
            need_likes: 1,
        })
    }
    getUserPhoto(ids, photoSize) {
        const size = photoSize in ['50', '100', '200_orig', '400_orig', 'max', 'max_orig'] ? size : '50'
        const sizeString = `photo_${size}`
        return vkApiRequest('users.get', {
            user_ids: Array.isArray(ids) ? ids : [ ids ],
            fields: [ sizeString ]
        })
    }
    getAlbumsCount() {
        return vkApiRequest('photos.getAlbumsCount', {
            access_token: this.accessToken,
        })
    }
}

module.exports = {
    flags,
    VK,
}
