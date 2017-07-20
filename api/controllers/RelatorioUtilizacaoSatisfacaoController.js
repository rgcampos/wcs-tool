/**
 * RelatorioUtilizacaoSatisfacaoController
 *
 * @description :: Server-side logic for managing Relatorioutilizacaosatisfacaos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var _ = require('lodash');
var moment = require('moment');


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
                if (feedbackResult != null) {
                    var groupFeedback = _.groupBy(feedbackResult, (item) => {
                        return moment(item.createdAt).format('DD/MM/YYYY');
                    });
                    var keysGroupFeedback = _.keys(groupFeedback);
                    var feedback = [];

                    for (var i = 0; i < keysGroupFeedback.length; i++) {
                        var date = keysGroupFeedback[i];
                        var itens = groupFeedback[date];

                        feedback.push({
                            data: date,
                            total: itens.length,
                            positivo: _.filter(itens, { success: true }).length,
                            negativo: _.filter(itens, { success: false }).length
                        });
                    }

                    Historico.find(objSearch)
                        .then(historicoResult => {
                            var groupHistory = _.groupBy(historicoResult, (item) => {
                                return moment(item.createdAt).format('DD/MM/YYYY');
                            });
                            var keysGroupHistory = _.keys(groupHistory);

                            var historico = [];

                            for (var i = 0; i < keysGroupHistory.length; i++) {
                                var date = keysGroupHistory[i];
                                var itens = groupHistory[date];

                                var mapping = _.map(itens, (item) => {
                                    var obj = {
                                        conversation_id: item.conversation_id,
                                        createdAt: item.createdAt
                                    };
                                    return obj;
                                });
                                var groupMapping = _.groupBy(mapping, (item) => {
                                    return item.conversation_id;
                                });

                                var objFinal = {
                                    tempo: 0,
                                    maior: 0,
                                    menor: 999999999,
                                    itens: []
                                };
                                _.each(groupMapping, (itens) => {
                                    var objConversa = _.first(itens);
                                    var ini = _.min(itens, (maxItem) => {
                                        return maxItem.createdAt
                                    });
                                    var fim = _.max(itens, (maxItem) => {
                                        return maxItem.createdAt
                                    });
                                    var o = {
                                        conversation_id: objConversa.conversation_id,
                                        inicio: ini.createdAt,
                                        fim: fim.createdAt
                                    };

                                    o.tempoEmHoraMinutoSegundo = UtilityService.millisecondsToHoursMinutesSeconds(moment(o.fim).diff(moment(o.inicio)));
                                    o.tempoEmMilesegundo = moment(o.fim).diff(moment(o.inicio));
                                    if (o.tempoEmHoraMinutoSegundo != '00:00:00') {
                                        if (o.tempoEmMilesegundo > objFinal.maior) {
                                            objFinal.maior = o.tempoEmMilesegundo;
                                        }
                                        if (o.tempoEmMilesegundo < objFinal.menor) {
                                            objFinal.menor = o.tempoEmMilesegundo;
                                        }
                                        objFinal.itens.push(o);
                                        objFinal.tempo += o.tempoEmMilesegundo;
                                    }
                                });

                                if (objFinal.tempo != 0) {
                                    historico.push({
                                        data: date,
                                        total: objFinal.itens.length,
                                        tempoMedio: UtilityService.millisecondsToHoursMinutesSeconds(Math.floor(objFinal.tempo / objFinal.itens.length)),
                                        tempoMedioMilesegundo: Math.floor(objFinal.tempo / objFinal.itens.length),
                                        tempoMenor: UtilityService.millisecondsToHoursMinutesSeconds(objFinal.menor),
                                        tempoMenorMilesegundo: objFinal.menor,
                                        tempoMaior: UtilityService.millisecondsToHoursMinutesSeconds(objFinal.maior),
                                        tempoMaiorMilesegundo: objFinal.maior
                                    });
                                }
                            }

                            objReturn.status = 'ok';
                            objReturn.message = 'Relatorio de utilizacao & satisfacao retornado com sucesso.';
                            objReturn.report = {
                                feedback,
                                historico
                            };
                            return res.json(200, objReturn);
                        })
                        .catch(err => {
                            console.log('Erro ao retornar historico.', err);
                            objReturn.status = 'error';
                            objReturn.message = err.error ? err.error : err.message;
                            return res.json(500, objReturn);
                        });
                }
            })
            .catch(err => {
                console.log('Erro ao retornar feedback.', err);
                objReturn.status = 'error';
                objReturn.message = err.error ? err.error : err.message;
                return res.json(500, objReturn);
            });


    }
};