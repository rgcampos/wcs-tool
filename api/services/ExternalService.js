module.exports = {
    getToken: () => {
        var objReturn = {};

        return new Promise(function (res, rej) {
            ConfigConversation.find({})
                .then(function (result) {
                    if (typeof result === 'object') {
                        if (result == null) {
                            rej(result);
                        } else {
                            res(result);
                        }
                    } else {
                        rej(result);
                    }
                })
                .catch(function (err) {
                    rej(err);
                });
        });
    },

    validaToken: (header, token) => {
        if (header !== null && header['x-external-token']) {
            var tokenHeader = header['x-external-token'];
            if (tokenHeader == token) {
                return true;
            }
        }
        return false;
    }
}