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
    
    tokenValidateDataBase: (header) => {
        let h = '';
        if (!_.isEmpty(header) && !_.isEmpty(header['x-external-token'])) {
            h = header['x-external-token'];
        }

        return new Promise((res, rej) => {
            if (_.isEmpty(h)) {
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

    }
}