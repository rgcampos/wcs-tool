/**
 * ConfigGestaoUsuarioController
 *
 * @description :: Server-side logic for managing Configgestaousuarios
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var logger = require('tracer').colorConsole();

module.exports = {
    load: (req, res) => {
        if (req.method !== 'GET')
            return res.forbidden();

        var objReturn = {};

        User.find({})
            .then((result) => {
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
            .catch((err) => {
                logger.error(err);
                objReturn.status = 'error';
                objReturn.message = err.error ? err.error : err.message;
                return res.json(500, objReturn);
            });
    },

    delete: (req, res) => {
        if (req.method !== 'GET')
            return res.forbidden();

        var objDelete = {};
        var objReturn = {};

        if (typeof req.query !== 'undefined' && req.query.userId) {
            var userId = req.query.userId;
            objDelete = {
                id: userId
            };
        }
        
        User.destroy(objDelete)
            .then((data) => {
                LogService.logDb(req.session.user.email, 'Deletou um(ns) usuario(s) existente(s)', data);
                objReturn.status = 'ok';
                objReturn.message = 'Dados do usuário alterado com sucesso!';
                return res.json(200, objReturn);
            })
            .catch((err) => {
                logger.error(err);
                objReturn.status = 'error';
                objReturn.message = 'Erro ao alterar dados do usuário!';
                return res.json(500, objReturn);
            });

    },

    save: (req, res) => {
        if (req.method !== 'POST')
            return res.forbidden();

        var objReturn = {};

        if (typeof req.body !== 'undefined' && req.body) {
            var record_id = req.body.record_id;
            var name = req.body.nome_usuario;
            var email = req.body.email_usuario;
            var level = req.body.nivel_usuario;
            var active = req.body.status_usuario;
            var password = req.body.senha_usuario;

            var objCreateOrUpdate = {
                name,
                email,
                level,
                active: active == 1 ? true : false,
                password
            }


            if (typeof record_id !== 'undefined') {
                User.findOne({ id: record_id })
                    .then((result) => {
                        if (typeof result === 'object' && result) {
                            User.update({ id: result.id }, objCreateOrUpdate)
                                .then((data) => {
                                    LogService.logDb(req.session.user.email, 'Alterou usuario existente', data);
                                    objReturn.status = 'ok';
                                    objReturn.idObject = record_id;
                                    objReturn.message = 'Dados do usuário alterado com sucesso!';
                                    return res.json(200, objReturn);
                                })
                                .catch((err) => {
                                    logger.error(err);
                                    objReturn.status = 'error';
                                    objReturn.message = 'Erro ao alterar dados do usuário!';
                                    return res.json(500, objReturn);
                                });
                        } else {
                            objReturn.status = 'error';
                            objReturn.message = 'Erro geral!';
                            return res.json(500, objReturn);
                        }
                    })
                    .catch((err) => {
                        logger.error(err);
                        objReturn.status = 'error';
                        objReturn.message = err.error ? err.error : err.message;
                        return res.json(500, objReturn);
                    });
            } else {
                User.create(objCreateOrUpdate)
                    .then((data) => {
                        LogService.logDb(req.session.user.email, 'Criou um novo usuario', data);
                        objReturn.status = 'ok';
                        objReturn.idObject = data.id;
                        objReturn.message = 'Dados do usuário inserida com sucesso!';
                        return res.json(200, objReturn);
                    })
                    .catch((err) => {
                        logger.error(err);
                        objReturn.status = 'error';
                        objReturn.message = 'Erro ao inserir dados do usuário!';
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