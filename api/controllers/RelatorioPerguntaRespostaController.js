/**
 * RelatorioPerguntaRespostaController
 *
 * @description :: Server-side logic for managing Relatorioperguntarespostas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var _ = require('lodash');

module.exports = {
    load: (req, res) => {
        if (req.method !== 'POST')
            return res.forbidden();

        var objSearch = {
            sort: 'createdAt DESC'
        };

        if (typeof req.body !== 'undefined' && req.body) {
            var busca = req.body.busca;
            objSearch.createdAt = busca;
        }


        var objReturn = {};

        Feedback.find(objSearch)
            .then(feedbackResult => {
                objReturn.result = [];

                var promises = feedbackResult.map(function (item) {
                    return new Promise(function (resolve, reject) {
                        var objSearchHistorico = {
                            conversation_id: item.conversation_id,
                            createdAt: objSearch.createdAt
                        };

                        Historico.find(objSearchHistorico)
                            .then(hfResult => {
                                var obj = {};
                                obj.conversation_id = item.conversation_id;
                                obj.success = item.success;
                                obj.historico = [];

                                var promiseHist = hfResult.map(function (mhItem) {
                                    return new Promise(function (resolveHist, rejectHist) {
                                        var objAux = {};
                                        objAux.text = mhItem.text;
                                        objAux.typeAgent = mhItem.typeAgent;
                                        objAux.intents = mhItem.intents;
                                        objAux.username = mhItem.username;
                                        resolveHist(objAux);
                                    });
                                });

                                Promise.all(promiseHist)
                                    .then(objPromise => {
                                        obj.historico = objPromise;
                                    })
                                    .catch(err => {
                                        console.log('Erro promise!', err);
                                        objReturn.status = 'error';
                                        objReturn.message = err.error ? err.error : err.message;
                                        return res.json(500, objReturn);
                                    });


                                resolve(obj);
                            })
                            .catch(err => {
                                reject(err);
                            });
                    });
                });


                Promise.all(promises)
                    .then(objPromise => {
                        objReturn.status = 'ok';
                        objReturn.message = 'Dados retornados com sucesso.';
                        objReturn.result = objPromise;
                        return res.json(200, objReturn);
                    })
                    .catch(err => {
                        console.log('Erro promise!', err);
                        objReturn.status = 'error';
                        objReturn.message = err.error ? err.error : err.message;
                        return res.json(500, objReturn);
                    });
            })
            .catch(err => {
                console.log('Erro ao retornar feedback.', err);
                objReturn.status = 'error';
                objReturn.message = err.error ? err.error : err.message;
                return res.json(500, objReturn);
            });


    }
};