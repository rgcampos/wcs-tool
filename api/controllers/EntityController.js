/**
 * EntityController
 *
 * @description :: Server-side logic for managing Entities
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Conversation = require('watson-developer-cloud/conversation/v1');
var _ = require('lodash');
var logger = require('tracer').colorConsole();

module.exports = {
    listEntity: (req, res) => {
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

                cs.getEntities({
                    workspace_id: config.workspace_id,
                    export: false,
                    page_limit: 100,
                    sort: 'entity'
                }, (err, result) => {
                    if (err) {
                        logger.error(err);
                        objReturn.status = 'error';
                        objReturn.message = err.error ? err.error : err.message;
                        return res.json(500, objReturn);
                    } else {
                        objReturn.body = result.entities;
                        objReturn.status = 'ok';
                        objReturn.message = 'Entities retornada com sucesso!';
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
        var entity = ''

        if (typeof req.query !== 'undefined' && req.query.entity) {
            entity = req.query.entity;
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


                cs.getValues({
                    workspace_id: config.workspace_id,
                    entity: entity,
                    export: false,
                    page_limit: 100,
                    sort: 'value'
                }, (err, result) => {
                    if (err) {
                        logger.error(err);
                        objReturn.status = 'error';
                        objReturn.message = err.error ? err.error : err.message;
                        return res.json(500, objReturn);
                    } else {

                        var resultMap = result.values.map(function (item) {
                            return new Promise(function (resolve, reject) {
                                cs.getSynonyms({
                                    workspace_id: config.workspace_id,
                                    entity: entity,
                                    value: item.value
                                }, (errSynon, resultSynon) => {
                                    if (errSynon) {
                                        logger.error(errSynon);
                                        reject(errSynon);
                                    } else {
                                        var synonyms = [];
                                        resultSynon.synonyms.forEach(function (item) {
                                            synonyms.push(item.synonym);
                                        });
                                        item.synonyms = synonyms.join('; ');
                                        resolve(item);
                                    }
                                });
                            });
                        });

                        Promise.all(resultMap)
                            .then(function (resultPromise) {
                                objReturn.body = resultPromise;
                                objReturn.status = 'ok';
                                objReturn.message = 'Entity retornada com sucesso!';
                                return res.json(200, objReturn);
                            })
                            .catch(function (err) {
                                logger.error(err);
                                objReturn.status = 'error';
                                objReturn.message = err.error ? err.error : err.message;
                                return res.json(500, objReturn);
                            });
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

    saveEntity: (req, res) => {
        if (req.method !== 'POST')
            return res.forbidden();

        var objReturn = {};

        if (typeof req.body !== 'undefined' && req.body) {
            var nomeEntidade = req.body.entity;

            ConversationService
                .getConfig({})
                .then(obj => {
                    var config = obj[0];
                    var cs = new Conversation({
                        username: config.user,
                        password: config.token,
                        version_date: config.version_date
                    });

                    cs.createEntity({
                        workspace_id: config.workspace_id,
                        intent: nomeEntidade,
                        description: null,
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
            var entidade = req.body.entity;
            var valor = req.body.value;
            var exemplo = req.body.synonyms;
            var auxExemploFinal = [];
            var exemploFinal = [];

            if (!_.isEmpty(exemplo)) {
                auxExemploFinal = exemplo.split(';');
                _.forEach(auxExemploFinal, (value, key) => {
                    exemploFinal.push(value.trim());
                });
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

                    cs.getValue({
                        workspace_id: config.workspace_id,
                        entity: entidade,
                        value: valor
                    }, (err, result) => {
                        if (err) {
                            logger.error(err);
                            objReturn.status = 'error';
                            objReturn.message = err.error ? err.error : err.message;
                            return res.json(500, objReturn);
                        } else {

                            if (_.isEmpty(result)) {
                                cs.createValue({
                                    workspace_id: config.workspace_id,
                                    entity: entidade,
                                    value: valor,
                                    synonyms: exemploFinal
                                }, (errCV, resultCV) => {
                                    if (errCV) {
                                        logger.error(errCV);
                                        objReturn.status = 'error';
                                        objReturn.message = err.error ? err.error : err.message;
                                        return res.json(500, objReturn);
                                    } else {
                                        objReturn.status = 'ok';
                                        objReturn.message = 'Entidade criada/alterada com sucesso!';
                                        return res.json(200, objReturn);
                                    }
                                });

                            } else {

                                cs.getSynonyms({
                                    workspace_id: config.workspace_id,
                                    entity: entidade,
                                    value: valor
                                }, (errGS, resultGS) => {
                                    if (errGS) {
                                        logger.error(errGS);
                                        objReturn.status = 'error';
                                        objReturn.message = err.error ? err.error : err.message;
                                        return res.json(500, objReturn);
                                    } else {

                                        if (_.isEmpty(resultGS.synonyms)) {

                                            var promisesFinal = exemploFinal.map(function (item) {
                                                return new Promise(function (resolve, reject) {
                                                    cs.createSynonym({
                                                        workspace_id: config.workspace_id,
                                                        entity: entidade,
                                                        value: valor,
                                                        synonym: item.trim()
                                                    }, (errCS, resultCS) => {
                                                        if (errCS) {
                                                            reject(errCS);
                                                        } else {
                                                            resolve(resultCS);
                                                        }
                                                    });
                                                });
                                            });



                                            Promise.all(promisesFinal)
                                                .then((obj) => {
                                                    objReturn.status = 'ok';
                                                    objReturn.message = 'Entidade criada/alterada com sucesso!';
                                                    return res.json(200, objReturn);
                                                })
                                                .catch((err) => {
                                                    logger.error(err);
                                                    objReturn.status = 'error';
                                                    objReturn.message = err.error ? err.error : err.message;
                                                    return res.json(500, objReturn);
                                                });

                                        } else {

                                            var promises = resultGS.synonyms.map(function (item) {
                                                return new Promise(function (resolve, reject) {
                                                    cs.deleteSynonym({
                                                        workspace_id: config.workspace_id,
                                                        entity: entidade,
                                                        value: valor,
                                                        synonym: item.synonym.trim()
                                                    }, (errDS, resultDS) => {
                                                        if (errDS) {
                                                            reject(errDS);
                                                        } else {
                                                            resolve(resultDS);
                                                        }
                                                    });
                                                });
                                            });

                                            Promise.all(promises)
                                                .then((obj) => {
                                                    var promisesFinal = exemploFinal.map(function (item) {
                                                        return new Promise(function (resolve, reject) {
                                                            cs.createSynonym({
                                                                workspace_id: config.workspace_id,
                                                                entity: entidade,
                                                                value: valor,
                                                                synonym: item.trim()
                                                            }, (errCS, resultCS) => {
                                                                if (errCS) {
                                                                    reject(errCS);
                                                                } else {
                                                                    resolve(resultCS);
                                                                }
                                                            });
                                                        });
                                                    });

                                                    Promise.all(promisesFinal)
                                                        .then((obj) => {
                                                            objReturn.status = 'ok';
                                                            objReturn.message = 'Entidade criada/alterada com sucesso!';
                                                            return res.json(200, objReturn);
                                                        })
                                                        .catch(err => {
                                                            logger.error(err);
                                                            objReturn.status = 'error';
                                                            objReturn.message = err.error ? err.error : err.message;
                                                            return res.json(500, objReturn);
                                                        });
                                                })
                                                .catch((err) => {
                                                    logger.error(err);
                                                    objReturn.status = 'error';
                                                    objReturn.message = err.error ? err.error : err.message;
                                                    return res.json(500, objReturn);
                                                });
                                        }
                                    }
                                });
                            }
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


    deleteEntity: (req, res) => {
        if (req.method !== 'POST')
            return res.forbidden();

        var objReturn = {};

        if (typeof req.body !== 'undefined' && req.body) {
            var entidade = req.body.entity;

            ConversationService
                .getConfig({})
                .then(obj => {
                    var config = obj[0];
                    var cs = new Conversation({
                        username: config.user,
                        password: config.token,
                        version_date: config.version_date
                    });

                    cs.deleteEntity({
                        workspace_id: config.workspace_id,
                        entity: entidade
                    }, (err, result) => {
                        if (err) {
                            logger.error(err);
                            objReturn.status = 'error';
                            objReturn.message = err.error ? err.error : err.message;
                            return res.json(500, objReturn);
                        } else {
                            objReturn.status = 'ok';
                            objReturn.message = 'Entidade apagada com sucesso!';
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
            var entidade = req.body.entity;
            var valor = req.body.value;

            ConversationService
                .getConfig({})
                .then(obj => {
                    var config = obj[0];
                    var cs = new Conversation({
                        username: config.user,
                        password: config.token,
                        version_date: config.version_date
                    });

                    cs.deleteValue({
                        workspace_id: config.workspace_id,
                        entity: entidade,
                        value: valor
                    }, (err, result) => {
                        if (err) {
                            logger.error(err);
                            objReturn.status = 'error';
                            objReturn.message = err.error ? err.error : err.message;
                            return res.json(500, objReturn);
                        } else {
                            objReturn.status = 'ok';
                            objReturn.message = 'Exemplo apagado com sucesso!';
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