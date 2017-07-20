/**
 * AcuraciaExperimentoController
 *
 * @description :: Server-side logic for managing Acuraciaexperimentoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Conversation = require('watson-developer-cloud/conversation/v1');
var moment = require('moment');
var experimento = require('../utils/experimento.js');
var _ = require('lodash');

module.exports = {

    delete: (req, res) => {
        if (req.method !== 'GET')
            return res.forbidden();

        AcuraciaExperimento.destroy({})
            .then(result => {
                return res.json(200);
            })
            .catch(err => {
                return res.json(500, err.error ? err.error : err.message);
            });
    },

    list: (req, res) => {
        if (req.method !== 'GET')
            return res.forbidden();

        var objReturn = {};

        AcuraciaExperimento.find({ sort: 'createdAt DESC' })
            .then(function (result) {
                objReturn.body = result;
                if (typeof result === 'object') {
                    if (result == null) {
                        objReturn.status = 'error';
                        objReturn.message = 'Result is null.';
                        return res.json(500, objReturn);
                    } else {
                        objReturn.status = 'ok';
                        objReturn.message = 'Configuração retornada com sucesso!';
                        objReturn.body.forEach((i) => {
                            delete i.resultado.intentsList;
                        });
                        return res.json(200, objReturn);
                    }
                } else {
                    objReturn.status = 'error';
                    objReturn.message = 'Result is not object.';
                    return res.json(500, objReturn);
                }
            })
            .catch(function (err) {
                console.log('Erro geral!', err);
                objReturn.status = 'error';
                objReturn.message = err.error ? err.error : err.message;
                return res.json(500, objReturn);
            });
    },

    execute: (req, res) => {
        if (req.method !== 'GET')
            return res.forbidden();

        console.log('Teste iniciado');

        var objReturn = {};

        ConversationService
            .getConfig({})
            .then(obj => {
                if (_.isEmpty(obj)) {
                    objReturn.status = 'error';
                    objReturn.message = 'Erro ao executar teste. Objeto de configuração vazio.';
                    return res.json(500, objReturn);
                } else {
                    var config = obj[0];
                    experimento.init(config.user, config.token, config.workspace_id, config.version_date, 0.65);

                    experimento.runTest((err, result) => {
                        if (err) {
                            console.error('Erro ao rodar experimento', err);
                            objReturn.status = 'error';
                            objReturn.message = err.error ? err.error : err.message;
                            return res.json(500, objReturn);
                        } else {
                            AcuraciaExperimento.create({ resultado: result })
                                .then(data => {
                                    objReturn.status = 'ok';
                                    objReturn.message = 'Teste executado e inserido com sucesso';
                                    return res.json(200, objReturn);
                                })
                                .catch(err => {
                                    console.log('Erro ao executar teste', err);
                                    objReturn.status = 'error';
                                    objReturn.message = 'Erro ao executar teste';
                                    return res.json(500, objReturn);
                                });
                        }
                    });
                }
            })
            .catch(err => {
                console.log('Erro ao rodar experimento', err);
                objReturn.status = 'error';
                objReturn.message = err.error ? err.error : err.message;
                return res.json(500, objReturn);
            });

    },

    find: (req, res) => {
        if (req.method !== 'GET')
            return res.forbidden();

        var objReturn = {};

        if (typeof req.query !== 'undefined' && req.query) {
            var createdAt = req.query.createdAt;

            var objSearch = {
                createdAt: createdAt
            };

            AcuraciaExperimento.find(objSearch)
                .then(function (result) {
                    objReturn.status = 'ok';
                    objReturn.message = 'Teste retornado com sucesso!';
                    objReturn.body = result;
                    /*
                    objReturn.body.forEach((e) => {
                        e.resultado.intentsList.forEach((i) => {
                            delete i.examples;                            
                        });
                    });
                    */

                    return res.json(200, objReturn);
                })
                .catch(function (err) {
                    console.log('Erro ao retornar Teste!');
                    objReturn.status = 'error';
                    objReturn.message = err.error ? err.error : err.message;
                    return res.json(500, objReturn);
                });
        } else {
            objReturn.status = 'error';
            objReturn.message = 'Erro ao retornar Teste!';
            return res.json(200, objReturn);
        }
    }
};