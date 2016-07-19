const request = require('request');
const debug = require('debug')('vkLib');

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
            throw new Error(result.error.error_msg);
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

module.exports = {
    getPermissions,
    getUser,
}
