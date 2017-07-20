/**
 * IntentController
 *
 * @description :: Server-side logic for managing Entities
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Conversation = require('watson-developer-cloud/conversation/v1');
var _ = require('lodash');
var logger = require('tracer').colorConsole();

module.exports = {
    listIntent: (req, res) => {
        if (req.method !== 'GET')
            return res.forbidden();

        var objReturn = {};

        ConversationService
            .getConfig({})
            .then(obj => {
                var config = obj[0];
                var cs = new Conversation({
                    username: config.user,
                    password: config.token,
                    version_date: config.version_date
                });

                cs.getIntents({
                    workspace_id: config.workspace_id,
                    export: false,
                    page_limit: 100,
                    sort: 'intent'
                }, (err, result) => {
                    if (err) {
                        logger.error(err);
                        objReturn.status = 'error';
                        objReturn.message = err.error ? err.error : err.message;
                        return res.json(500, objReturn);
                    } else {
                        objReturn.body = result.intents;
                        objReturn.status = 'ok';
                        objReturn.message = 'Intents retornada com sucesso!';
                        return res.json(200, objReturn);
                    }
                });
            })
            .catch(function (err) {
                logger.error(err);
                objReturn.status = 'error';
                objReturn.message = err.error ? err.error : err.message;
                return res.json(500, objReturn);
            });
    },

    listExample: (req, res) => {
        if (req.method !== 'GET')
            return res.forbidden();

        var objReturn = {};
        var intent = ''

        if (typeof req.query !== 'undefined' && req.query.intent) {
            intent = req.query.intent;
        }

        ConversationService
            .getConfig({})
            .then(obj => {
                var config = obj[0];
                var cs = new Conversation({
                    username: config.user,
                    password: config.token,
                    version_date: config.version_date
                });

                cs.getExamples({
                    workspace_id: config.workspace_id,
                    intent: intent,
                    page_limit: 100,
                    sort: 'text'
                }, (err, result) => {
                    if (err) {
                        logger.error(err);
                        objReturn.status = 'error';
                        objReturn.message = err.error ? err.error : err.message;
                        return res.json(500, objReturn);
                    } else {
                        objReturn.body = result.examples;
                        objReturn.status = 'ok';
                        objReturn.message = 'Intent retornada com sucesso!';
                        return res.json(200, objReturn);
                    }
                });
            })
            .catch(function (err) {
                logger.error(err);
                objReturn.status = 'error';
                objReturn.message = err.error ? err.error : err.message;
                return res.json(500, objReturn);
            });
    },

    saveIntent: (req, res) => {
        if (req.method !== 'POST')
            return res.forbidden();

        var objReturn = {};

        if (typeof req.body !== 'undefined' && req.body) {
            var nomeIntencao = req.body.intent;
            var descricaoIntencao = req.body.description || null;

            ConversationService
                .getConfig({})
                .then(obj => {
                    var config = obj[0];
                    var cs = new Conversation({
                        username: config.user,
                        password: config.token,
                        version_date: config.version_date
                    });

                    cs.createIntent({
                        workspace_id: config.workspace_id,
                        intent: nomeIntencao,
                        description: descricaoIntencao,
                        examples: []
                    }, (err, result) => {
                        if (err) {
                            logger.error(err);
                            objReturn.status = 'error';
                            objReturn.message = err.error ? err.error : err.message;
                            return res.json(500, objReturn);
                        } else {
                            objReturn.status = 'ok';
                            objReturn.message = 'Intent criada com sucesso!';
                            return res.json(200, objReturn);
                        }
                    });
                })
                .catch((err) => {
                    logger.error(err);
                    objReturn.status = 'error';
                    objReturn.message = err.error ? err.error : err.message;
                    return res.json(500, objReturn);
                });
        } else {
            objReturn.status = 'error';
            objReturn.message = 'Falha ao realizar chamada no serviço';
            return res.json(500, objReturn);
        }
    },

    saveExample: (req, res) => {
        if (req.method !== 'POST')
            return res.forbidden();

        var objReturn = {};

        if (typeof req.body !== 'undefined' && req.body) {
            var intencao = req.body.intent;
            var exemplo = req.body.example;
            var exemploAntigo = req.body.oldExample;

            ConversationService
                .getConfig({})
                .then(obj => {
                    var config = obj[0];
                    var cs = new Conversation({
                        username: config.user,
                        password: config.token,
                        version_date: config.version_date
                    });

                    if (_.isEmpty(exemploAntigo)) {
                        cs.createExample({
                            workspace_id: config.workspace_id,
                            intent: intencao,
                            text: exemplo
                        }, (err, result) => {
                            if (err) {
                                logger.error(err);
                                objReturn.status = 'error';
                                objReturn.message = err.error ? err.error : err.message;
                                return res.json(500, objReturn);
                            } else {
                                objReturn.status = 'ok';
                                objReturn.message = 'Exemplo criado com sucesso!';
                                return res.json(200, objReturn);
                            }
                        });
                    } else {
                        cs.updateExample({
                            workspace_id: config.workspace_id,
                            intent: intencao,
                            old_text: exemploAntigo,
                            text: exemplo
                        }, (err, result) => {
                            if (err) {
                                logger.error(err);
                                objReturn.status = 'error';
                                objReturn.message = err.error ? err.error : err.message;
                                return res.json(500, objReturn);
                            } else {
                                objReturn.status = 'ok';
                                objReturn.message = 'Exemplo criado com sucesso!';
                                return res.json(200, objReturn);
                            }
                        });
                    }
                })
                .catch((err) => {
                    logger.error(err);
                    objReturn.status = 'error';
                    objReturn.message = err.error ? err.error : err.message;
                    return res.json(500, objReturn);
                });
        } else {
            objReturn.status = 'error';
            objReturn.message = 'Falha ao realizar chamada no serviço';
            return res.json(500, objReturn);
        }
    },


    deleteIntent: (req, res) => {
        if (req.method !== 'POST')
            return res.forbidden();

        var objReturn = {};

        if (typeof req.body !== 'undefined' && req.body) {
            var nomeIntencao = req.body.intent;

            ConversationService
                .getConfig({})
                .then(obj => {
                    var config = obj[0];
                    var cs = new Conversation({
                        username: config.user,
                        password: config.token,
                        version_date: config.version_date
                    });

                    cs.deleteIntent({
                        workspace_id: config.workspace_id,
                        intent: nomeIntencao
                    }, (err, result) => {
                        if (err) {
                            logger.error(err);
                            objReturn.status = 'error';
                            objReturn.message = err.error ? err.error : err.message;
                            return res.json(500, objReturn);
                        } else {
                            objReturn.status = 'ok';
                            objReturn.message = 'Intent criada com sucesso!';
                            return res.json(200, objReturn);
                        }
                    });
                })
                .catch((err) => {
                    logger.error(err);
                    objReturn.status = 'error';
                    objReturn.message = err.error ? err.error : err.message;
                    return res.json(500, objReturn);
                });
        } else {
            objReturn.status = 'error';
            objReturn.message = 'Falha ao realizar chamada no serviço';
            return res.json(500, objReturn);
        }
    },

    deleteExample: (req, res) => {
        if (req.method !== 'POST')
            return res.forbidden();

        var objReturn = {};

        if (typeof req.body !== 'undefined' && req.body) {
            var intencao = req.body.intent;
            var exemplo = req.body.example;

            ConversationService
                .getConfig({})
                .then(obj => {
                    var config = obj[0];
                    var cs = new Conversation({
                        username: config.user,
                        password: config.token,
                        version_date: config.version_date
                    });

                    cs.deleteExample({
                        workspace_id: config.workspace_id,
                        intent: intencao,
                        text: exemplo
                    }, (err, result) => {
                        if (err) {
                            logger.error(err);
                            objReturn.status = 'error';
                            objReturn.message = err.error ? err.error : err.message;
                            return res.json(500, objReturn);
                        } else {
                            objReturn.status = 'ok';
                            objReturn.message = 'Exemplo criado com sucesso!';
                            return res.json(200, objReturn);
                        }
                    });

                })
                .catch((err) => {
                    logger.error(err);
                    objReturn.status = 'error';
                    objReturn.message = err.error ? err.error : err.message;
                    return res.json(500, objReturn);
                });
        } else {
            objReturn.status = 'error';
            objReturn.message = 'Falha ao realizar chamada no serviço';
            return res.json(500, objReturn);
        }
    }
};