/**
 * BackupController
 *
 * @description :: Server-side logic for managing Backups
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Conversation = require('watson-developer-cloud/conversation/v1');
var logger = require('tracer').colorConsole();

module.exports = {
    index: (req, res) => {
        res.view('backup');
    },


    execute: (req, res) => {
        if (req.method !== 'GET')
            return res.forbidden();

        var objReturn = {};


        ConversationService
            .getConfig({})
            .then((obj) => {
                var config = obj[0];
                var cs = new Conversation({
                    username: config.user,
                    password: config.token,
                    version_date: config.version_date
                });

                var options = {
                    export: true,
                    workspace_id: config.workspace_id
                };

                cs.getWorkspace(options, function (err, result) {
                    if (err) {
                        logger.error(err);
                        objReturn.status = 'error';
                        objReturn.message = err.error ? err.error : err.message;
                        return res.json(500, objReturn);
                    }

                    Backup.create({ workspace: result })
                        .then((data) => {
                            LogService.logDb(req.session.user.email, 'Criou um novo backup', data);
                            objReturn.status = 'ok';
                            objReturn.idObject = data.id;
                            objReturn.message = 'Backup criado com sucesso!';
                            return res.json(200, objReturn);
                        })
                        .catch((err) => {
                            logger.error(err);
                            objReturn.status = 'error';
                            objReturn.message = err.error ? err.error : err.message;
                            return res.json(500, objReturn);
                        });
                });
            })
            .catch((err) => {
                logger.error(err);
                objReturn.status = 'error';
                objReturn.message = err.error ? err.error : err.message;
                return res.json(500, objReturn);
            });
    },

    list: (req, res) => {
        if (req.method !== 'GET')
            return res.forbidden();

        var objSearch = {
            sort: 'createdAt DESC'
        };

        var objResult = {};

        Backup.find(objSearch)
            .then((result) => {
                LogService.logDb(req.session.user.email, 'Listou todos os backups');
                objResult.status = 'ok';
                objResult.message = 'Backup retornado com sucesso.'
                objResult.result = result;

                return res.json(200, objResult);
            })
            .catch((err) => {
                logger.error(err);
                objReturn.status = 'error';
                objReturn.message = err.error ? err.error : err.message;
                return res.json(500, objReturn);
            });
    },

    download: (req, res) => {
        if (req.method !== 'GET')
            return res.forbidden();

        var idBackup = '';

        if (typeof req.query !== 'undefined' && req.query.idBackup) {
            idBackup = req.query.idBackup;
        }
    },

    upload: (req, res) => {
        if (req.method !== 'GET')
            return res.forbidden();
    }


};