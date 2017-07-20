/**
 * ConfigConversationController
 *
 * @description :: Server-side logic for managing Configconversations
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    load: (req, res) => {
        if (req.method !== 'GET')
            return res.forbidden();

        var objReturn = {};

        ConfigConversation.find({})
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

        ConfigConversation.destroy({})
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
            var recordId = req.body.recordId;
            var workspaceId = req.body.workspaceId;
            var urlApi = req.body.urlApi;
            var userBluemix = req.body.userBluemix;
            var tokenBluemix = req.body.tokenBluemix;
            var saveHistory = req.body.saveHistory;
            var showFeedback = req.body.showFeedback;
            var showEmoji = req.body.showEmoji;
            var versionDate = req.body.versionDate;
            var evaluationMessage = req.body.evaluationMessage;
            var endConversationMessage = req.body.endConversationMessage;
            var conversationStart = req.body.conversationStart;
            var externalToken = req.body.externalToken;

            var objCreateOrUpdate = {
                url_api: urlApi,
                workspace_id: workspaceId,
                user: userBluemix,
                token: tokenBluemix,
                feedback: showFeedback == 1 ? true : false,
                emoji: showEmoji == 1 ? true : false,
                history: saveHistory == 1 ? true : false,
                version_date: versionDate,
                end_conversation_message: endConversationMessage,
                evaluation_message: evaluationMessage,
                conversation_start: conversationStart == 1 ? true : false,
                external_token: externalToken
            }



            if (typeof recordId !== 'undefined') {
                ConfigConversation.findOne({ id: recordId })
                    .then(function (result) {
                        if (typeof result === 'object' && result) {
                            ConfigConversation.update({ id: result.id }, objCreateOrUpdate)
                                .then((data) => {
                                    LogService.logDb(req.session.user.email, 'Configuração do Conversation alterada', data);
                                    objReturn.status = 'ok';
                                    objReturn.idObject = recordId;
                                    objReturn.message = 'Configuração do conversation alterada com sucesso!';
                                    return res.json(200, objReturn);
                                })
                                .catch((err) => {
                                    console.log('Erro ao alterar configuração do conversation!', err);
                                    objReturn.status = 'error';
                                    objReturn.idObject = recordId;
                                    objReturn.message = 'Erro ao alterar configuração do conversation!';
                                    return res.json(500, objReturn);
                                });
                        } else {
                            objReturn.status = 'error';
                            objReturn.idObject = recordId;
                            objReturn.message = 'Erro geral!';
                            return res.json(500, objReturn);
                        }
                    })
                    .catch((err) => {
                        console.log('Erro geral com id!', err);
                        objReturn.status = 'error';
                        objReturn.idObject = recordId;
                        objReturn.message = err.error ? err.error : err.message;
                        return res.json(500, objReturn);
                    });
            } else {
                ConfigConversation.create(objCreateOrUpdate)
                    .then((data) => {
                        LogService.logDb(req.session.user.email, 'Criou uma configuração do Conversation', data);
                        objReturn.status = 'ok';
                        objReturn.idObject = data.id;
                        objReturn.message = 'Configuração do conversation inserida com sucesso!';
                        return res.json(200, objReturn);
                    })
                    .catch((err) => {
                        console.log('Erro ao inserir configuração do conversation!');
                        objReturn.status = 'error';
                        objReturn.message = 'Erro ao inserir configuração do conversation!';
                        return res.json(500, objReturn);
                    });
            }
        } else {
            objReturn.status = 'error';
            objReturn.message = 'Falha ao realizar chamada no serviço';
            return res.json(500, objReturn);
        }
    }
};