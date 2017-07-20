/**
 * ChatController
 *
 * @description :: Server-side logic for managing Chats
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Conversation = require('watson-developer-cloud/conversation/v1');
var logger = require('tracer').colorConsole();

module.exports = {

    index: (req, res) => {
        res.view('conversacao/chat');
    },

    sendMessage: (req, res) => {
        if (req.method !== 'POST')
            return res.forbidden();

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
                    var version = req.body.version_date || '2017-04-21';

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
                                logger.error(err);
                                objReturn.status = 'error';
                                objReturn.message = 'Falha ao realizar chamada no serviço';
                                objReturn.err = err;
                                return res.json(500, objReturn);
                            } else {
                                var date = new Date();
                                var minutes = 10;
                                date.setTime(date.getTime() + (minutes * 60 * 1000));
                                req.cookies.auth.maxAge = date;
                                req.cookies.auth.expires = date;

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
            .catch((err) => {
                logger.error(err);
                objReturn.status = 'error';
                objReturn.message = 'Access denied';
                objReturn.err = err;
                return res.json(403, objReturn);
            });
    }
};

