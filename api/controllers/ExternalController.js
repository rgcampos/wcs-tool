/**
 * ExternalController
 *
 * @description :: Server-side logic for managing Externals
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Conversation = require('watson-developer-cloud/conversation/v1');
var uuid = require('uuid');

module.exports = {

    configConversationLoad: (req, res) => {
        if (req.method !== 'GET')
            return res.forbidden();

        console.log('configConversationLoad');

        var objReturn = {};

        ConversationService
            .getConfig({})
            .then((obj) => {

                UtilityService
                    .tokenValidateDataBase(req.headers)
                    .then((result) => {
                        objReturn.status = 'ok';
                        objReturn.message = 'Configuração retornada com sucesso!';
                        objReturn.body = obj;
                        return res.json(200, objReturn);
                    })
                    .catch(function (err) {
                        objReturn.status = 'error';
                        objReturn.message = 'Access denied.';
                        return res.json(403, objReturn);
                    });
            })
            .catch(function (err) {
                objReturn.status = 'error';
                objReturn.message = err.error ? err.error : err.message;
                return res.json(500, objReturn);
            });
    },

    configToneAnalyzerLoad: (req, res) => {
        if (req.method !== 'GET')
            return res.forbidden();

        console.log('loadConfigToneAnalyzer');

        var objReturn = {};
        UtilityService
            .tokenValidateDataBase(req.headers)
            .then((resToken) => {

                ConfigToneAnalyzer.find({})
                    .then((result) => {
                        objReturn.body = result;
                        if (typeof result === 'object') {
                            if (result == null) {
                                console.log('Result is null.');
                                objReturn.status = 'error';
                                objReturn.message = 'Result is null.';
                                return res.json(500, objReturn);
                            } else {
                                console.log('Configuração retornada com sucesso!');
                                objReturn.status = 'ok';
                                objReturn.message = 'Configuração retornada com sucesso!';
                                return res.json(200, objReturn);
                            }
                        } else {
                            console.log('Result is not object.');
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
            })
            .catch(function (err) {
                objReturn.status = 'error';
                objReturn.message = 'Access denied.';
                return res.json(403, objReturn);
            });
    },

    feedbackSave: (req, res) => {
        if (req.method !== 'POST')
            return res.forbidden();

        console.log('feedbackSave');

        var objReturn = {};

        UtilityService.tokenValidateDataBase(req.headers)
            .then(result => {


                if (typeof req.body !== 'undefined' && req.body) {
                    var workspace_id = req.body.workspace_id;
                    var conversation_id = req.body.conversation_id;
                    var feedbackAtendimento = req.body.tipo;
                    var intencao = req.body.intencao || {};
                    var usuario = (req.session.user) ? req.session.user.email : 'html@chattools.com';

                    var objInsert = {
                        workspace_id: workspace_id,
                        conversation_id: conversation_id,
                        success: feedbackAtendimento,
                        intents: intencao,
                        user: usuario
                    };

                    Feedback.create(objInsert)
                        .then((data) => {
                            objReturn.status = 'ok';
                            objReturn.idObject = data.id;
                            objReturn.message = 'Feedback do conversation inserida com sucesso!';
                            return res.json(200, objReturn);
                        })
                        .catch((err) => {
                            console.log('Erro ao inserir feedback do conversation!');
                            objReturn.status = 'error';
                            objReturn.message = err.error ? err.error : err.message;
                            return res.json(500, objReturn);
                        });
                }
            })
            .catch((err) => {
                console.log('Erro promise!', err);
                objReturn.status = 'error';
                objReturn.message = 'Access denied';
                return res.json(403, objReturn);
            });
    },

    historicoSave: (req, res) => {
        if (req.method !== 'POST')
            return res.forbidden();

        console.log('historicoSave');
        var objReturn = {};

        UtilityService.tokenValidateDataBase(req.headers)
            .then(result => {

                if (typeof req.body !== 'undefined' && req.body) {
                    var workspace_id = req.body.workspace_id;
                    var conversation_id = req.body.conversation_id;
                    var texto = req.body.mensagem;
                    var tipo = req.body.tipo;
                    var user = (req.session.user) ? req.session.user.email : 'html@chattools.com';
                    var intencao = req.body.intents;

                    Historico.create({
                        workspace_id: workspace_id,
                        conversation_id: conversation_id,
                        text: texto,
                        username: user,
                        intents: intencao,
                        typeAgent: tipo
                    })
                        .then((data) => {
                            objReturn.status = 'ok';
                            objReturn.idObject = data.id;
                            objReturn.message = 'Histórico do conversation inserida com sucesso!';
                            return res.json(200, objReturn);
                        })
                        .catch((err) => {
                            console.log('Erro ao inserir Histórico do conversation!', err)
                            objReturn.status = 'error';
                            objReturn.message = err.error ? err.error : err.message;
                            return res.json(500, objReturn);
                        });
                }

            })
            .catch((err) => {
                console.log('Erro promise!', err);
                objReturn.status = 'error';
                objReturn.message = 'Access denied';
                return res.json(403, objReturn);
            });
    },

    chatSendMessage: (req, res) => {
        if (req.method !== 'POST')
            return res.forbidden();

        console.log('chatSendMessage');

        var objReturn = {};

        UtilityService.tokenValidateDataBase(req.headers)
            .then((result) => {

                if (typeof req.body !== 'undefined' && req.body) {
                    var url_api = req.body.url_api || '';
                    var user = req.body.user || '';
                    var token = req.body.token || '';
                    var workspace = req.body.workspace || '';
                    var message = req.body.message || '';
                    var context = req.body.context || {};
                    var version = req.body.version_date || '2017-02-03';

                    if (user && token) {
                        var newService = {
                            username: user,
                            password: token,
                            version_date: version
                        };
                        var cs = new Conversation(newService);

                        var objConversation = {
                            input: {
                                text: message
                            },
                            workspace_id: workspace,
                            alternate_intents: true,
                            context: context
                        };

                        // console.log('Objecto enviado do Conversation', objConversation);
                        console.log('Objecto enviado do Conversation');
                        cs.message(objConversation, function (err, resp) {
                            if (err) {
                                console.log('Falha ao realizar chamada no serviço', err);
                                objReturn.status = 'error';
                                objReturn.message = 'Falha ao realizar chamada no serviço';
                                objReturn.object = err;
                                return res.json(500, objReturn);
                            } else {
                                objReturn.status = 'ok';
                                objReturn.message = 'Sucesso ao realizar chamada no serviço';
                                objReturn.object = resp;
                                objReturn.context = resp.context;
                                return res.json(200, objReturn);
                            }
                        });
                    } else {
                        objReturn.status = 'error';
                        objReturn.message = 'Falha ao realizar chamada no serviço';
                        return res.json(200, objReturn);
                    }

                } else {
                    objReturn.status = 'error';
                    objReturn.message = 'Falha ao realizar chamada no serviço';
                    return res.json(500, objReturn);
                }
            })
            .catch(err => {
                console.log('Erro promise!', err);
                objReturn.status = 'error';
                objReturn.message = 'Access denied';
                return res.json(403, objReturn);
            });
    },

    hash: (req, res) => {
        if (req.method !== 'GET')
            return res.forbidden();

        var objReturn = {
            status: "ok",
            message: "Hash gerado com sucesso.",
            hash: uuid.v1()
        };

        console.log(objReturn);
        return res.json(200, objReturn);
    }
};