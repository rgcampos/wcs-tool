/**
 * AcuraciaTuringController
 *
 * @description :: Server-side logic for managing Acuraciaturings
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Conversation = require('watson-developer-cloud/conversation/v1');

module.exports = {
    execute: (req, res) => {
        if (req.method !== 'GET')
            return res.forbidden();

        var objDelete = {};
        var objReturn = {};

        if (typeof req.query !== 'undefined' && req.query.testId) {
            var testId = req.query.testId;
            objDelete = {
                id: testId
            };
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
                var itensRespondidos = {};

                AcuraciaTuring.find(objDelete)
                    .then(function (turing) {
                        var context = {};
                        var output = '';

                        if (turing.lenght <= 0) {
                            console.log('Erro geral!');
                            objReturn.status = 'error';
                            objReturn.message = 'Nenhum teste encontrado';
                            return res.json(500, objReturn);
                        }

                        ConversationService.sendMessage(cs, null, context, config.workspace_id)
                            .then(smReturn => {
                                context = smReturn.context;
                                output = smReturn.output.text[0];
                                return smReturn;
                            }).then(ret => {

                                var execucoes = [];
                                if (!("execucoes" in turing[0])) {
                                    turing[0].execucoes = [];
                                }

                                var promises = turing[0].pergunta_resposta.map(function (item) {
                                    return new Promise(function (resolve, reject) {
                                        ConversationService.sendMessage(cs, item.pergunta, context, config.workspace_id)
                                            .then(smReturn => {
                                                var execucao = {
                                                    output: smReturn.output,
                                                    intents: smReturn.intents,
                                                    pergunta: item.pergunta,
                                                    resposta: item.resposta
                                                };
                                                if (typeof smReturn.output.text[0] !== 'undefined' && smReturn.output.text[0].trim() == item.resposta.trim()) {
                                                    execucao.sucesso = true;
                                                } else {
                                                    execucao.sucesso = false;
                                                }
                                                execucoes.push(execucao);
                                                return resolve(smReturn);
                                            })
                                            .catch(err => {
                                                return reject(err);
                                            });
                                    });
                                });


                                Promise.all(promises)
                                    .then(objPromise => {
                                        var sucesso = true;
                                        execucoes.forEach(item => {
                                            if (!item.sucesso) {
                                                sucesso = false;
                                            }
                                        });

                                        turing[0].execucoes.push({
                                            data: new Date(),
                                            sucesso,
                                            execucao: execucoes
                                        });

                                        AcuraciaTuring
                                            .update({ id: turing[0].id }, turing[0])
                                            .then((success) => {
                                                objReturn.status = 'ok';
                                                objReturn.message = 'Teste executado com sucesso';
                                                return res.json(200, objReturn);
                                            })
                                            .catch((err) => {
                                                console.log('Erro promise!', err);
                                                objReturn.status = 'error';
                                                objReturn.message = err.error ? err.error : err.message;
                                                return res.json(500, objReturn);
                                            });

                                    })
                                    .catch(err => {
                                        console.log('Erro promise!', err);
                                        objReturn.status = 'error';
                                        objReturn.message = err.error ? err.error : err.message;
                                        return res.json(500, objReturn);
                                    });

                            })
                            .catch(err => {
                                console.log('Erro geral!', err);
                                objReturn.status = 'error';
                                objReturn.message = err.error ? err.error : err.message;
                                return res.json(500, objReturn);
                            });

                    })
                    .catch(function (err) {
                        console.log('Erro geral!', err);
                        objReturn.status = 'error';
                        objReturn.message = err.error ? err.error : err.message;
                        return res.json(500, objReturn);
                    });
            })
            .catch(function (err) {
                objReturn.status = 'error';
                objReturn.message = err.error ? err.error : err.message;
                return res.json(500, objReturn);
            });


    },


    find: (req, res) => {
        if (req.method !== 'GET')
            return res.forbidden();

        var objFind = {};
        var objReturn = {};

        if (typeof req.query !== 'undefined' && req.query.testId) {
            var testId = req.query.testId;
            objFind = {
                id: testId
            };
        }

        AcuraciaTuring.findOne(objFind)
            .then(result => {
                objReturn.status = 'ok';
                objReturn.object = result;
                objReturn.message = 'Busca de teste com sucesso!';
                return res.json(200, objReturn);
            })
            .catch(err => {
                console.log('BBusca de teste com erro!', err);
                objReturn.status = 'error';
                objReturn.object = err.error ? err.error : err.message;
                objReturn.message = 'BBusca de teste com erro!';
                return res.json(500, objReturn);
            });
    },


    delete: (req, res) => {
        if (req.method !== 'GET')
            return res.forbidden();

        var objDelete = {};

        if (typeof req.query !== 'undefined' && req.query.testId) {
            var testId = req.query.testId;
            objDelete = {
                id: testId
            };
        }

        AcuraciaTuring.destroy(objDelete)
            .then(result => {
                return res.json(200);
            })
            .catch(err => {
                return res.json(500, err.error ? err.error : err.message);
            });
    },


    load: (req, res) => {
        if (req.method !== 'GET')
            return res.forbidden();

        var objReturn = {};

        AcuraciaTuring.find({ sort: 'createdAt DESC' })
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


    save: (req, res) => {
        if (req.method !== 'POST')
            return res.forbidden();


        var objReturn = {};

        if (typeof req.body !== 'undefined' && req.body) {
            var nome_teste = req.body.nomeTeste;
            var pergunta_resposta = req.body.perguntaResposta;

            var objCreate = {
                nome_teste,
                pergunta_resposta
            };

            AcuraciaTuring.create(objCreate)
                .then(data => {
                    objReturn.status = 'ok';
                    objReturn.idObject = data.id;
                    objReturn.message = 'Conjunto para teste inserido com sucesso!';
                    return res.json(200, objReturn);
                })
                .catch(err => {
                    console.log('Erro ao inserir conjunto para teste!', err.error ? err.error : err.message);
                    objReturn.status = 'error';
                    objReturn.message = err.error ? err.error : err.message;
                    return res.json(500, objReturn);
                });
        }
    }
};