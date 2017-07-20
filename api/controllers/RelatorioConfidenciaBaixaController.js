/**
 * RelatorioConfidenciaBaixaController
 *
 * @description :: Server-side logic for managing Relatorioconfidenciabaixas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
'use strict';
let _ = require('lodash');
let logger = require('tracer').colorConsole();

module.exports = {
    find: (req, res) => {
        if (req.method !== 'POST')
            return res.forbidden();

        let objSearch = {};

        if (typeof req.body !== 'undefined' && req.body) {
            let busca = req.body.busca;

            objSearch = {
                "typeAgent": 1,
                "createdAt": {
                    "$gte": new Date(busca.maiorIgual),
                    "$lte": new Date(busca.menorIgual)
                },
                "intents.0.confidence": {
                    "$lt": busca.nivelConfidencia
                }
            };
        }


        let objReturn = {};

        Historico.native(function (err, collection) {
            if (err) {
                logger.error(err);
                objReturn.status = 'error';
                objReturn.message = err.error ? err.error : err.message;
                return res.json(500, objReturn);
            }

            // collection.find(objSearch).sort({ 'createdAt': -1 }).toArray(function (err, items) {
            //     if (err) {
            //         logger.error(err);
            //         objReturn.status = 'error';
            //         objReturn.message = err.error ? err.error : err.message;
            //         return res.json(500, objReturn);
            //     }

            //     let promises = items.map(function (item) {
            //         return new Promise(function (resolve, reject) {
            //             let conversation_id = item.conversation_id;
            //             let workspace_id = item.workspace_id;
            //             let intents = item.intents;
            //             let createdAt = item.createdAt;

            //             resolve({ conversation_id, workspace_id, createdAt, intent: intents.length ? intents[0] : {}, username: item.username });
            //         });
            //     });

            //     Promise.all(promises)
            //         .then((objPromise) => {
            //             objReturn.status = 'ok';
            //             objReturn.message = 'Dados retornados com sucesso.';
            //             objReturn.result = objPromise;
            //             return res.json(200, objReturn);
            //         })
            //         .catch((err) => {
            //             logger.error(err);
            //             objReturn.status = 'error';
            //             objReturn.message = err.error ? err.error : err.message;
            //             return res.json(500, objReturn);
            //         });
            // });


            let dados = collection.mapReduce(
                function () {
                    emit({ conversation_id: this.conversation_id, workspace_id: this.workspace_id },
                        { createdAt: this.createdAt, intent: this.intents.length ? this.intents[0] : {}, username: this.username });
                },
                function (key, values) {
                    return values.reduce(function (a, b) {
                        return a.createdAt > b.createdAt ? a : b;
                    });
                },
                {
                    query: objSearch,
                    // out: "relBaixaConfidencia"
                    out: {
                        inline: 1
                    },
                    sort: {
                        createdAt: -1
                    }
                }, function (err, result) {
                    if (err) {
                        logger.error(err);
                        objReturn.status = 'error';
                        objReturn.message = err.error ? err.error : err.message;
                        return res.json(500, objReturn);
                    }

                    objReturn.status = 'ok';
                    objReturn.message = 'Dados retornados com sucesso.';
                    objReturn.result = result;
                    return res.json(200, objReturn);
                }
            );
        });
    }
};