/*
 * A custom error class representing VK API errors.
 * @see https://new.vk.com/dev/errors
 */

class VKError extends Error {
    constructor(error) {
        super(error.error_msg);
        this.code = error.error_code;
        this.requestParams = error.request_params;
    }

    static get AUTH_FAILED() {
        return 5;
    }
}

module.exports = VKError;
