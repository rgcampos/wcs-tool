/**
 * HistoricoController
 *
 * @description :: Server-side logic for managing Historicoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Enumerable = require("../../node_modules/linq");
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
var logger = require('tracer').colorConsole();

module.exports = {
    index: (req, res) => {
        res.view('conversacao/historico');
    },
    find: (req, res) => {
        if (req.method !== 'GET')
            return res.forbidden();

        var objReturn = {};

        if (typeof req.query !== 'undefined' && req.query) {
            var conversationId = req.query.conversationId;
            var workspaceId = req.query.workspaceId;

            var objSearch = {
                conversation_id: conversationId,
                workspace_id: workspaceId,
                sort: 'createdAt ASC'
            };

            Historico.find(objSearch)
                .then(function (result) {
                    objReturn.status = 'ok';
                    objReturn.message = 'Historico retornado com sucesso!';
                    objReturn.body = result;
                    return res.json(200, objReturn);
                })
                .catch((err) => {
                    logger.error(err);
                    objReturn.status = 'error';
                    objReturn.message = err.error ? err.error : err.message;
                    return res.json(500, objReturn);
                });
        } else {
            objReturn.status = 'error';
            objReturn.message = 'Erro ao retornar historico!';
            return res.json(200, objReturn);
        }
    },
    toneanalyzer: (req, res) => {
        if (req.method !== 'GET')
            return res.forbidden();

        var objReturn = {
            body: []
        };

        if (typeof req.query !== 'undefined' && req.query) {
            var conversationId = req.query.conversationId;
            var workspaceId = req.query.workspaceId;

            var objSearch = {
                conversation_id: conversationId,
                workspace_id: workspaceId,
                typeAgent: 2,
                sort: 'createdAt DESC'
            };



            Historico.find(objSearch)
                .then(function (resultHist) {
                    console.log('Historico retornado com sucesso!');
                    objReturn.status = 'ok';
                    objReturn.message = 'Historico retornado com sucesso!';

                    ConfigToneAnalyzer.find({})
                        .then(function (resultTone) {
                            if (resultTone.length > 0) {
                                var objTone = {
                                    username: resultTone[0].user,
                                    password: resultTone[0].token,
                                    version_date: '2016-05-19'
                                };
                                var tone_analyzer = new ToneAnalyzerV3(objTone);

                                var promises = resultHist.map(function (item) {
                                    return new Promise(function (resolve, reject) {
                                        tone_analyzer.tone({ text: item.text },
                                            function (err, tone) {
                                                if (err) {
                                                    reject(err);
                                                }
                                                objReturn.body.push({ username: item.username, text: item.text, analysis: tone });
                                                resolve();
                                            });
                                    });
                                });


                                Promise.all(promises)
                                    .then(function () {
                                        return res.json(200, objReturn);
                                    })
                                    .catch((err) => {
                                        logger.error(err);
                                        objReturn.status = 'error';
                                        objReturn.message = err.error ? err.error : err.message;
                                        return res.json(500, objReturn);
                                    });

                            } else {
                                objReturn.status = 'error';
                                objReturn.message = 'Erro ao retornar tone analyzer!';
                                return res.json(200, objReturn);
                            }
                        })
                        .catch((err) => {
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
        } else {
            console.log('Erro ao retornar historico!');
            objReturn.status = 'error';
            objReturn.message = err.error ? err.error : err.message;
            return res.json(200, objReturn);
        }
    },
    list: (req, res) => {
        if (req.method !== 'POST')
            return res.forbidden();

        var objSearch = {
            sort: 'createdAt DESC'
        };

        if (typeof req.body !== 'undefined' && req.body) {
            var busca = req.body.busca;
            objSearch.createdAt = busca;
        }

        Historico.find(objSearch)
            .then(function (result) {
                //Cria um array com o resultado agrupado dos campos
                //conversation_id e workspace_id, pegando apenas a
                //data maxima de update
                var array = Enumerable.from(result).groupBy(function (item) {
                    var conversationId = item.conversation_id;
                    var workspaceId = item.workspace_id;

                    return {
                        conversation_id: conversationId,
                        workspace_id: workspaceId
                    };
                },
                    null,
                    function (key, grouping) {
                        return {
                            data: grouping.orderByDescending(function (item) { return item.updatedAt; }).first()
                        };
                    },
                    "$.conversation_id").toArray();

                var finalArray = new Array();
                for (var i = 0; i < array.length; i++) {
                    finalArray.push(array[i].data);
                }

                return res.json(200, finalArray);
            })
            .catch(function (err) {
                return res.json(500, err);
            });
    },
    delete: (req, res) => {
        if (req.method !== 'GET')
            return res.forbidden();

        Historico.destroy({})
            .then(result => {
                return res.json(200);
            })
            .catch(err => {
                return res.json(500, err.error ? err.error : err.message);
            });
    },
    save: (req, res) => {
        if (req.method !== 'POST')
            return res.forbidden();

        var objReturn = {};

        UtilityService.tokenValidateDataBase(req.headers)
            .then(result => {

                if (typeof req.body !== 'undefined' && req.body) {
                    var workspace_id = req.body.workspace_id;
                    var conversation_id = req.body.conversation_id;
                    var texto = req.body.mensagem;
                    var tipo = req.body.tipo;
                    var user = req.session.user.email;
                    var intencao = req.body.intents || {};
                    var entidade = req.body.entities || {};
                    var info = req.body.info;

                    Historico.create({
                        workspace_id: workspace_id,
                        conversation_id: conversation_id,
                        text: texto,
                        username: user,
                        intents: intencao,
                        entities: entidade,
                        typeAgent: tipo,
                        info
                    })
                        .then(data => {
                            objReturn.status = 'ok';
                            objReturn.idObject = data.id;
                            objReturn.message = 'Histórico do conversation inserida com sucesso!';
                            return res.json(200, objReturn);
                        })
                        .catch((err) => {
                            logger.error(err);
                            objReturn.status = 'error';
                            objReturn.message = err.error ? err.error : err.message;
                            return res.json(500, objReturn);
                        });
                }

            })
            .catch((err) => {
                logger.error(err);
                objReturn.status = 'error';
                objReturn.message = 'Access denied';
                return res.json(403, objReturn);
            });
    }
};

