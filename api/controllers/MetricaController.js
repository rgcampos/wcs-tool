/**
 * MetricaController
 *
 * @description :: Server-side logic for managing Metricas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
'use strict';
let _ = require('lodash');
let moment = require('moment');
let logger = require('tracer').colorConsole();

module.exports = {
    load: (req, res) => {
        if (req.method !== 'GET')
            return res.forbidden();

        let lastDays = 10;
        let objReturn = {};

        let dataFim = new Date(moment().get('year'), moment().get('month'), (moment().get('date') - 1));
        dataFim.setUTCHours(23, 59, 59, 0);

        let dataInicio = new Date(moment().get('year'), moment().get('month'), (moment().get('date') - 1 - lastDays));
        dataInicio.setUTCHours(0, 0, 0, 0);

        let promise = Promise.resolve(0);

        Historico.native(function (err, collectionHistorico) {
            if (err) {
                logger.error(err);
                objReturn.status = 'error';
                objReturn.message = err.error ? err.error : err.message;
                return res.json(500, objReturn);
            }


            Feedback.native(function (err, collectionFeedback) {
                if (err) {
                    logger.error(err);
                    objReturn.status = 'error';
                    objReturn.message = err.error ? err.error : err.message;
                    return res.json(500, objReturn);
                }

                promise
                    .then((obj) => {
                        return new Promise((resolve, reject) => {
                            //carrega historico para calculo de chamada de APIs - ultimos 7 dias
                            collectionHistorico.aggregate(
                                [
                                    { $match: { createdAt: { $gte: dataInicio, $lte: dataFim } } },
                                    { $group: { _id: { month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" }, year: { $year: "$createdAt" } }, count: { $sum: 1 } } }
                                ], function (err, result) {
                                    if (err) {
                                        resolve({ status: "error", error: err });
                                    }
                                    resolve({
                                        status: "ok",
                                        totalChamadasAPIPorDia: result
                                    });
                                });
                        });
                    })
                    .then((obj) => {
                        return new Promise((resolve, reject) => {
                            if (obj.status != "error") {
                                //carrega historico por distincao de conversa
                                collectionHistorico.distinct("conversation_id", { "createdAt": { "$lte": dataFim } }, function (err, result) {
                                    if (err) {
                                        resolve({ status: "error", error: err });
                                    }
                                    resolve({
                                        status: "ok",
                                        totalChamadasAPIPorDia: obj.totalChamadasAPIPorDia,
                                        todosConversation: result
                                    });
                                });
                            } else {
                                resolve(obj);
                            }
                        });
                    })
                    .then((obj) => {
                        return new Promise((resolve, reject) => {
                            if (obj.status != "error") {
                                //carrega historico agrupado por browser
                                collectionHistorico.aggregate(
                                    [
                                        { $match: { createdAt: { $gte: dataInicio, $lte: dataFim } } },
                                        { $group: { _id: { browserName: "$info.browser.name", browserVersion: "$info.browser.version" }, count: { $sum: 1 } } },
                                        { $sort: { count: -1 } }
                                    ], function (err, result) {
                                        if (err) {
                                            resolve({ status: "error", error: err });
                                        }
                                        let auxResult = result.map(function (item) {
                                            return {
                                                browser: item._id.browserName + "/" + item._id.browserVersion,
                                                total: item.count
                                            };
                                        });
                                        resolve({
                                            status: "ok",
                                            totalChamadasAPIPorDia: obj.totalChamadasAPIPorDia,
                                            todosConversation: obj.todosConversation,
                                            totalChamadasPorBrowser: auxResult
                                        });
                                    });
                            } else {
                                resolve(obj);
                            }
                        });
                    })
                    .then((obj) => {
                        return new Promise((resolve, reject) => {
                            if (obj.status != "error") {
                                //carrega feedback dos ultimos 7 dias e separa para cada dia entre positivo e negativo
                                // desde que o feedback esteja com uma conversa existente
                                collectionFeedback.aggregate(
                                    [
                                        { $match: { createdAt: { $gte: dataInicio, $lte: dataFim }, conversation_id: { "$in": obj.todosConversation } } },
                                        {
                                            $group: {
                                                _id: {
                                                    success: "$success",
                                                    month: { $month: "$createdAt" },
                                                    day: { $dayOfMonth: "$createdAt" },
                                                    year: { $year: "$createdAt" }
                                                },
                                                count: { $sum: 1 }
                                            }
                                        }
                                    ], function (err, result) {
                                        if (err) {
                                            resolve({ status: "error", error: err });
                                        }
                                        resolve({
                                            status: "ok",
                                            totalChamadasAPIPorDia: obj.totalChamadasAPIPorDia,
                                            todosConversation: obj.todosConversation,
                                            totalChamadasPorBrowser: obj.totalChamadasPorBrowser,
                                            totalFeedbackPorDia: result
                                        });
                                    });
                            } else {
                                resolve(obj);
                            }
                        });
                    })
                    .then((obj) => {
                        return new Promise((resolve, reject) => {
                            if (obj.status != "error") {
                                //carrega feedback e separa para cada dia entre positivo e negativo
                                // desde que o feedback esteja com uma conversa existente
                                collectionFeedback.find({
                                    "conversation_id": {
                                        "$in": obj.todosConversation
                                    },
                                    "createdAt": {
                                        "$lte": dataFim
                                    }
                                }).toArray(function (err, itens) {
                                    if (err) {
                                        resolve({ status: "error", error: err });
                                    }
                                    resolve({
                                        status: "ok",
                                        totalChamadasAPIPorDia: obj.totalChamadasAPIPorDia,
                                        todosConversation: obj.todosConversation,
                                        totalChamadasPorBrowser: obj.totalChamadasPorBrowser,
                                        totalFeedbackPorDia: obj.totalFeedbackPorDia,
                                        totalConversas: obj.todosConversation.length,
                                        comFeedbackConversation: itens.length,
                                        comFeedbackConversationPositivo: _.filter(itens, { success: true }).length,
                                        comFeedbackConversationNegativo: _.filter(itens, { success: false }).length,
                                        semFeedbackConversation: obj.todosConversation.length - itens.length
                                    });
                                });
                            } else {
                                resolve(obj);
                            }
                        });
                    })
                    .then((obj) => {
                        return new Promise((resolve, reject) => {
                            if (obj.status != "error") {
                                //carrega historico para calculo de chamada de APIs
                                //carrega historico para saber quais top 5 intencoes
                                //carrega historico para saber quais top 5 entidades
                                collectionHistorico
                                    .find({ typeAgent: 1, "createdAt": { "$lte": dataFim } })
                                    .toArray(function (err, itens) {
                                        if (err) {
                                            resolve({ status: "error", error: err });
                                        }

                                        let arrIntents = {};
                                        let arrEntities = {};

                                        _.forEach(itens, function (item) {
                                            if (_.has(item, 'intents')) {
                                                if (item.intents.length) {
                                                    let itemIntent = item.intents[0];
                                                    if (_.has(arrIntents, itemIntent.intent)) {
                                                        arrIntents[itemIntent.intent] += 1;
                                                    } else {
                                                        arrIntents[itemIntent.intent] = 1;
                                                    }
                                                }
                                            }

                                            if (_.has(item, 'entities')) {
                                                if (item.entities.length) {
                                                    let itemEntity = item.entities[0];
                                                    if (_.has(arrEntities, itemEntity.entity)) {
                                                        arrEntities[itemEntity.entity] += 1;
                                                    } else {
                                                        arrEntities[itemEntity.entity] = 1;
                                                    }
                                                }
                                                // let lenEntities = 0;
                                                // lenEntities = (item.entities.length ? (item.entities.length > 3 ? 3 : item.entities.length) : 0);
                                                // for (let i = 0; i < lenEntities; i++) {
                                                //     let itemEntity = item.entities[i];
                                                //     if (_.has(arrEntities, itemEntity.entity)) {
                                                //         arrEntities[itemEntity.entity] += 1;
                                                //     } else {
                                                //         arrEntities[itemEntity.entity] = 1;
                                                //     }
                                                // }
                                            }
                                        });

                                        let auxIntencoes = _.reduceRight(_.invert(_.invert(arrIntents)), function (current, val, key) {
                                            current[key] = parseInt(val);
                                            return current;
                                        }, {});

                                        let auxEntidades = _.reduceRight(_.invert(_.invert(arrEntities)), function (current, val, key) {
                                            current[key] = parseInt(val);
                                            return current;
                                        }, {});



                                        resolve({
                                            status: "ok",
                                            startDate: dataInicio,
                                            endDate: dataFim,
                                            totalChamadasAPI: itens.length,
                                            totalChamadasAPIPorDia: obj.totalChamadasAPIPorDia,
                                            totalChamadasPorBrowser: obj.totalChamadasPorBrowser,
                                            totalFeedbackPorDia: obj.totalFeedbackPorDia,
                                            totalConversas: obj.todosConversation.length,
                                            comFeedbackConversation: obj.comFeedbackConversation,
                                            comFeedbackConversationPositivo: obj.comFeedbackConversationPositivo,
                                            comFeedbackConversationNegativo: obj.comFeedbackConversationNegativo,
                                            semFeedbackConversation: obj.semFeedbackConversation,
                                            arrayItencoes: firstN(auxIntencoes, 5),
                                            arrayEntidades: firstN(auxEntidades, 5)
                                        });
                                    });
                            } else {
                                resolve(obj);
                            }
                        });
                    })
                    .then((obj) => {
                        if (obj.status != "error") {
                            objReturn.status = 'ok';
                            objReturn.message = 'Metricas retornada com sucesso!';
                            objReturn.result = obj;
                            return res.json(200, objReturn);
                        } else {
                            logger.error(obj.error);
                            objReturn.status = 'error';
                            objReturn.message = obj.error.error ? obj.error.error : obj.error.message;
                            return res.json(500, objReturn);
                        }
                    });
            });
        });
    }
};

function firstN(obj, n) {
    return _.chain(obj)
        .keys()
        .take(n)
        .reduce(function (memo, current) {
            memo[current] = obj[current];
            return memo;
        }, {})
        .value();
}