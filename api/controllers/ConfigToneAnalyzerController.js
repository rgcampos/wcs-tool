/**
 * ConfigToneAnalyzerController
 *
 * @description :: Server-side logic for managing Configtoneanalyzers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    load: (req, res) => {
        // if (req.method !== 'GET')
        //     return res.forbidden();

        var objReturn = {};

        ConfigToneAnalyzer.find({})
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

    delete: (req, res) => {
        if (req.method !== 'GET')
            return res.forbidden();

        ConfigToneAnalyzer.destroy({})
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
                ConfigToneAnalyzer.findOne({ id: record_id })
                    .then(function (result) {
                        if (typeof result === 'object' && result) {
                            ConfigToneAnalyzer.update({ id: result.id }, objCreateOrUpdate)
                                .then((data) => {
                                    LogService.logDb(req.session.user.email, 'Configuração do Tone Analyzer alterada', data);
                                    objReturn.status = 'ok';
                                    objReturn.idObject = record_id;
                                    objReturn.message = 'Configuração do tony analizer alterada com sucesso!';
                                    return res.json(200, objReturn);
                                })
                                .catch((err) => {
                                    console.log('Erro ao alterar configuração do tony analizer!', err);
                                    objReturn.status = 'error';
                                    objReturn.idObject = record_id;
                                    objReturn.message = 'Erro ao alterar configuração do tony analizer!';
                                    return res.json(500, objReturn);
                                });
                        } else {
                            objReturn.status = 'error';
                            objReturn.idObject = record_id;
                            objReturn.message = 'Erro geral!';
                            return res.json(500, objReturn);
                        }
                    })
                    .catch((err) => {
                        console.log('Erro geral com id!', err);
                        objReturn.status = 'error';
                        objReturn.idObject = record_id;
                        objReturn.message = err.error ? err.error : err.message;
                        return res.json(500, objReturn);
                    });
            } else {
                ConfigToneAnalyzer.create(objCreateOrUpdate)
                    .then((data) => {
                        LogService.logDb(req.session.user.email, 'Criou uma configuração do Tone Analyzer', data);
                        objReturn.status = 'ok';
                        objReturn.idObject = data.id;
                        objReturn.message = 'Configuração do tony analizer inserida com sucesso!';
                        return res.json(200, objReturn);
                    })
                    .catch((err) => {
                        console.log('Erro ao inserir configuração do tony analizer!', err);
                        objReturn.status = 'error';
                        objReturn.message = 'Erro ao inserir configuração do tony analizer!';
                        return res.json(500, objReturn);
                    });
            }
        }
    }
};

