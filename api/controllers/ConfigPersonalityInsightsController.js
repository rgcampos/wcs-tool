/**
 * ConfigPersonalityInsightsController
 *
 * @description :: Server-side logic for managing Configpersonalityinsights
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var HistoricoController = require("./HistoricoController");
var watson = require("watson-developer-cloud");

module.exports = {
    load: (req, res) => {
        if (req.method !== 'GET')
            return res.forbidden();

        var objReturn = {};

        ConfigPersonalityInsights.find({})
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


    getInsight: (req, res) => {
        if (req.method !== 'POST')
            return res.forbidden();

        var objReturn = {};

        //Realiza a busca das permissões de acesso ao Personality Insight
        ConfigPersonalityInsights.find({}).then(function (result) {
            if (typeof result === 'object') {
                if (result == null) {
                    objReturn.status = 'error';
                    objReturn.message = 'Erro ao encontrar as informações de configuração do Personality Insight';

                    return res.json(500, objReturn);
                }
                else {
                    var objSearch = {
                        username: req.body.username,
                        sort: "createdAt DESC"
                    };

                    //Busca todo o histórico do usuário
                    Historico.find(objSearch).then(function (resultHist) {
                        if (resultHist == undefined || resultHist == null || resultHist.length == 0) {
                            objReturn.status = 'not found';
                            objReturn.message = 'Não foi encontrado nenhum histórico do usuário selecionado.';

                            return res.json(500, objReturn);
                        }

                        var contentMessage = "";

                        //Loop para obter todas as mensagens enviadas pelo usuário
                        for (var i = 0; i < resultHist.length; i++) {
                            contentMessage += resultHist[i].text + "\n";
                        }

                        //Realiza a chamada ao serviço do Personality Insight para retornar
                        //um gráfico baseado na análise textual enviadas
                        var personalityInsight = new watson.PersonalityInsightsV3({
                            username: result[0].user,
                            password: result[0].token,
                            version_date: result[0].version_date
                        });

                        var params = {
                            text: contentMessage,
                            consumption_preferences: true,
                            raw_scores: true,
                            headers: {
                                'accept-language': 'pt-BR'
                            }
                        };

                        personalityInsight.profile(params, function (error, response) {
                            if (error) {
                                console.log('Erro ao analisar as informações utilizando o Personality Insight', error);
                                objReturn.status = 'error';
                                objReturn.message = 'Erro ao analisar as informações utilizando o Personality Insight';

                                return res.json(500, objReturn);
                            }

                            objReturn.status = 'ok';
                            objReturn.message = 'Análise do Personality Insight realizada com sucesso';
                            objReturn.body = response;

                            return res.json(200, objReturn);
                        });
                    })
                        .catch(function (error) {
                            console.log('Erro ao realizar a consulta de Histórico para o Personality Insight');
                            console.log(JSON.stringify(error));

                            objReturn.status = 'error';
                            objReturn.message = 'Erro ao realizar a consulta de Histórico para o Personality Insight';

                            return res.json(500, objReturn);
                        });
                }
            }
            else {
                objReturn.status = 'error';
                objReturn.message = 'Erro ao encontrar as informações de configuração do Personality Insight';

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
            var record_id = req.body.record_id;
            var url_api = req.body.url_api;
            var user_bluemix = req.body.user_bluemix;
            var token_bluemix = req.body.token_bluemix;
            var version = req.body.version_date;

            var objCreateOrUpdate = {
                url_api: url_api,
                user: user_bluemix,
                token: token_bluemix,
                version_date: version
            }

            if (typeof record_id !== 'undefined') {
                ConfigPersonalityInsights.findOne({ id: record_id })
                    .then(function (result) {
                        if (typeof result === 'object' && result) {
                            ConfigPersonalityInsights.update({ id: result.id }, objCreateOrUpdate)
                                .then((data) => {
                                    LogService.logDb(req.session.user.email, 'Configuração do Personality Insights alterada', data);
                                    objReturn.status = 'ok';
                                    objReturn.idObject = record_id;
                                    objReturn.message = 'Configuração do personality insights alterada com sucesso!';
                                    return res.json(200, objReturn);
                                })
                                .catch((err) => {
                                    console.log('Erro ao alterar configuração do personality insights!', err);
                                    objReturn.status = 'error';
                                    objReturn.idObject = record_id;
                                    objReturn.message = err.error ? err.error : err.message;
                                    return res.json(500, objReturn);
                                });
                        } else {
                            objReturn.status = 'error';
                            objReturn.idObject = record_id;
                            objReturn.message = 'Erro geral!';
                            return res.json(500, objReturn);
                        }
                    })
                    .catch(function (err) {
                        console.log('Erro geral com id!', err);
                        objReturn.status = 'error';
                        objReturn.idObject = record_id;
                        objReturn.message = err.error ? err.error : err.message;
                        return res.json(500, objReturn);
                    });
            } else {
                ConfigPersonalityInsights.create(objCreateOrUpdate)
                    .then((data) => {
                        LogService.logDb(req.session.user.email, 'Criou uma configuração do Personality Insights', data);
                        objReturn.status = 'ok';
                        objReturn.idObject = data.id;
                        objReturn.message = 'Configuração do personality insights inserida com sucesso!';
                        return res.json(200, objReturn);
                    })
                    .catch((err) => {
                        console.log('Erro ao inserir configuração do personality insights!', err);
                        objReturn.status = 'error';
                        objReturn.message = err.error ? err.error : err.message;
                        return res.json(500, objReturn);
                    });
            }
        }
    }

};

