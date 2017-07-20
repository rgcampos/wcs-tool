/**
 * FeedbackController
 *
 * @description :: Server-side logic for managing Feedbacks
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    index: (req, res) => {
        res.view('conversacao/feedback');
    },
    updateReview: (req, res) => {
        if (req.method !== 'POST')
            return res.forbidden();

        var objReturn = {};

        if (typeof req.body !== 'undefined' && req.body) {
            var idFeedback = req.body.id;

            var objUpdate = {
                reviewed: true
            }

            Feedback.update({ id: idFeedback }, objUpdate)
                .then(data => {
                    objReturn.status = 'ok';
                    objReturn.message = 'Feedback revisado com sucesso!';
                    return res.json(200, objReturn);
                })
                .catch(err => {
                    console.log('Erro ao revisar Feedback!', err)
                    objReturn.status = 'error';
                    objReturn.message = err.error ? err.error : err.message;
                    return res.json(500, objReturn);
                });
        } else {
            objReturn.status = 'error';
            objReturn.message = 'Erro ao revisar Feedback!';
            return res.json(500, objReturn);
        }

    },
    search: (req, res) => {
        if (req.method !== 'POST')
            return res.forbidden();

        var objReturn = {};

        if (typeof req.body !== 'undefined' && req.body) {
            var obj = req.body.busca;
            obj.sort = 'createdAt DESC';

            Feedback.find(obj)
                .then(function (result) {
                    objReturn.status = 'ok';
                    objReturn.object = result;
                    objReturn.message = 'Busca de Feedback do conversation com sucesso!';
                    return res.json(200, objReturn);
                })
                .catch(function (err) {
                    console.log('Busca de Feedback do conversation com erro!', err);
                    objReturn.status = 'error';
                    objReturn.message = err.error ? err.error : err.message;
                    return res.json(500, objReturn);
                });
        } else {
            objReturn.status = 'error';
            objReturn.message = 'Busca de Feedback do conversation com erro!';
            return res.json(500, objReturn);
        }
    },
    list: (req, res) => {
        if (req.method !== 'GET')
            return res.forbidden();

        Feedback.find({ sort: 'createdAt DESC' })
            .then(function (result) {
                return res.json(200, result);
            })
            .catch(function (err) {
                return res.json(500, err);
            });
    },
    delete: (req, res) => {
        if (req.method !== 'GET')
            return res.forbidden();

        Feedback.destroy({})
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

        UtilityService.tokenValidateDataBase(req.headers)
            .then(result => {


                if (typeof req.body !== 'undefined' && req.body) {
                    var workspace_id = req.body.workspace_id;
                    var conversation_id = req.body.conversation_id;
                    var feedbackAtendimento = req.body.tipo;
                    var intencao = req.body.intencao || {};
                    var user = req.session.user.email || 'user@br.ibm.com';

                    var objInsert = {
                        workspace_id: workspace_id,
                        conversation_id: conversation_id,
                        success: feedbackAtendimento,
                        intents: intencao,
                        username: user
                    };

                    Feedback.create(objInsert)
                        .then(data => {
                            objReturn.status = 'ok';
                            objReturn.idObject = data.id;
                            objReturn.message = 'Feedback do conversation inserida com sucesso!';
                            return res.json(200, objReturn);
                        })
                        .catch(err => {
                            console.log('Erro ao inserir feedback do conversation!');
                            objReturn.status = 'error';
                            objReturn.message = err.error ? err.error : err.message;
                            return res.json(500, objReturn);
                        });
                }
            })
            .catch(err => {
                console.log('Erro promise!', err);
                objReturn.status = 'error';
                objReturn.message = 'Access denied';
                return res.json(403, objReturn);
            });
    }
};