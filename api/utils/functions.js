'use strict';

let moment = require('moment');
let _ = require('lodash');

module.exports = {
    millisecondsToMinutesSeconds: (ms) => {
        let duration = moment.duration(ms, 'milliseconds');
        let fromMinutes = Math.floor(duration.asMinutes());
        let fromSeconds = Math.floor(duration.asSeconds() - fromMinutes * 60);

        return Math.floor(duration.asSeconds()) >= 60 ? (fromMinutes <= 9 ? '0' + fromMinutes : fromMinutes) + ':' + (fromSeconds <= 9 ? '0' + fromSeconds : fromSeconds)
            : '00:' + (fromSeconds <= 9 ? '0' + fromSeconds : fromSeconds);
    },

    millisecondsToHoursMinutesSeconds: (ms) => {
        let duration = moment.duration(ms, 'milliseconds');
        let fromHours = Math.floor(duration.asHours());
        let fromMinutes = Math.floor(duration.asMinutes());
        let fromSeconds = Math.floor(duration.asSeconds() - fromMinutes * 60);

        let hours = fromHours <= 9 ? '0' + fromHours : fromHours;
        let minutes = fromMinutes <= 9 ? '0' + fromMinutes : fromMinutes;
        let seconds = fromSeconds <= 9 ? '0' + fromSeconds : fromSeconds;

        return hours + ':' + (Math.floor(duration.asSeconds()) >= 60 ? minutes + ':' + seconds : '00:' + seconds);
    },

    tokenValidate: (header, token) => {
        if (header !== null && header['x-external-token']) {
            let tokenHeader = header['x-external-token'];
            if (tokenHeader == token) {
                return true;
            }
        }
        return false;
    },

    tokenValidateDataBase: (header) => {
        let h = '';
        if (!_.isEmpty(header) && !_.isEmpty(header['x-external-token'])) {
            h = header['x-external-token'];
        }

        return new Promise((res, rej) => {
            if (_.isElement(h)) {
                res(true);
            } else {
                ConfigConversation
                    .findOne({ external_token: h })
                    .then(result => {
                        if (typeof result === 'object' && result && result.external_token == h) {
                            res(true);
                        } else {
                            rej(false);
                        }
                    })
                    .catch(function (err) {
                        console.log('Erro ao buscar token', err);
                        rej(false);
                    });
            }
        });
    },

    executeBackup: () => {

        let objReturn = {};

        ConversationService
            .getConfig({})
            .then((obj) => {
                let config = obj[0];
                let cs = new Conversation({
                    username: config.user,
                    password: config.token,
                    version_date: config.version_date
                });

                let options = {
                    export: true,
                    workspace_id: config.workspace_id
                };

                cs.getWorkspace(options, function (err, result) {
                    if (err) {
                        logger.error(err);
                        objReturn.status = 'error';
                        objReturn.message = err.error ? err.error : err.message;
                        return objReturn;
                    }

                    Backup.create({ workspace: result })
                        .then((data) => {
                            LogService.logDb(req.session.user.email, 'Criou um novo backup', data);
                            objReturn.status = 'ok';
                            objReturn.idObject = data.id;
                            objReturn.message = 'Backup criado com sucesso!';
                            return objReturn;
                        })
                        .catch((err) => {
                            logger.error(err);
                            objReturn.status = 'error';
                            objReturn.message = err.error ? err.error : err.message;
                            return objReturn;
                        });
                });
            })
            .catch((err) => {
                logger.error(err);
                objReturn.status = 'error';
                objReturn.message = err.error ? err.error : err.message;
                return objReturn;
            });
    }
}