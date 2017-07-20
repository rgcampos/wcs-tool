/**
 * AuthenticateController
 *
 * @description :: Server-side logic for managing Authenticates
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// DEV: https://VWCommunicationAPI-DEV.mybluemix.net/VWCommunication/api/v1/user/authenticate
// BETA: https://VWCommunicationAPI-BETA.mybluemix.net/VWCommunication/api/v1/user/authenticate
// HOMOLOG: https://VWCommunicationAPI-HOMOLOG.mybluemix.net/VWCommunication/api/v1/user/authenticate 

var logger = require('tracer').colorConsole();
var _ = require('lodash');
var userExample = {
    name: {
        first: 'Watson',
        last: 'IBM'
    },
    email: '',
    login: '',
    dob: null,
    phone: '',
    cell: ''
};

module.exports = {

    getUser: (req, res) => {
        if (req.method !== 'GET')
            return res.forbidden();

        var objReturn = {};
        objReturn.status = 'ok';
        objReturn.message = 'Sucesso ao realizar autenticao';
        objReturn.user = req.session.user;
        return res.json(200, objReturn);
    },

    logout: (req, res) => {
        req.session.destroy();
        req.session = null;
        res.clearCookie('auth');
        return res.redirect("/");
    },

    login: (req, res) => {

        if (req.method !== 'POST')
            return res.forbidden();

        var objReturn = {};


        if (typeof req.body !== 'undefined' && req.body) {
            var chapa = req.body.chapa;
            var passwd = req.body.senha;

            var date = new Date();
            var minutes = 45;
            date.setTime(date.getTime() + (minutes * 60 * 1000));

            if (chapa && passwd) {

                User
                    .findOne({ email: chapa, password: passwd, active: true })
                    .then(function (result) {

                        if (_.isObject(result)) {

                            var name = result.name.split(' ');
                            var usuarioBD = userExample;
                            usuarioBD.login = chapa;
                            if (name.length > 1) {
                                usuarioBD.name.first = name[0];
                                usuarioBD.name.last = name[1];
                            } else {
                                usuarioBD.name.first = name[0];
                            }
                            usuarioBD.email = result.email;
                            req.session.level = result.level;
                            switch (result.level) {
                                case 0:
                                    res.cookie('auth', '9645c521631d2a66007e01d7a85cf029', { expires: date, httpOnly: true });
                                    break;
                                case 1:
                                    res.cookie('auth', '68a24878cc568766b735c62be5f306ed', { expires: date, httpOnly: true });
                                    break;
                                case 2:
                                    res.cookie('auth', 'c8f72cf322c3b14417919cb1b107dfcd', { expires: date, httpOnly: true });
                                    break;
                                default:
                                    res.cookie('auth', '9645c521631d2a66007e01d7a85cf029', { expires: date, httpOnly: true });
                                    break;
                            }
                            objReturn.status = 'ok';
                            objReturn.message = 'Sucesso ao realizar autenticacoa';
                            objReturn.user = usuarioBD;
                            req.session.user = usuarioBD;
                            return res.json(200, objReturn);

                        } else {
                            if (chapa == 'employer' && passwd == 'employer@1234') {

                                res.cookie('auth', '9645c521631d2a66007e01d7a85cf029', { expires: date, httpOnly: true });
                                var usuario = userExample;
                                usuario.login = chapa;
                                usuario.name.first = 'Employer';
                                usuario.name.last = 'IBM';
                                usuario.email = 'employer@br.ibm.com';
                                req.session.level = 0;
                                objReturn.status = 'ok';
                                objReturn.message = 'Sucesso ao realizar autenticacoa';
                                objReturn.user = usuario;
                                req.session.user = usuario;
                                return res.json(200, objReturn);

                            } else if (chapa == 'user' && passwd == 'user@1234') {

                                res.cookie('auth', '68a24878cc568766b735c62be5f306ed', { expires: date, httpOnly: true });
                                var usuarioIBMTeste = userExample;
                                usuarioIBMTeste.login = chapa;
                                usuarioIBMTeste.name.first = 'User';
                                usuarioIBMTeste.name.last = 'IBM';
                                usuarioIBMTeste.email = 'user@br.ibm.com';
                                req.session.level = 1;
                                objReturn.status = 'ok';
                                objReturn.message = 'Sucesso ao realizar autenticacoa';
                                objReturn.user = usuarioIBMTeste;
                                req.session.user = usuarioIBMTeste;
                                return res.json(200, objReturn);

                            } else if (chapa == 'admin' && passwd == 'admin@watson') {
                                // res.cookie('auth', authHash, { maxAge: date, expires: date, httpOnly: true });
                                res.cookie('auth', 'c8f72cf322c3b14417919cb1b107dfcd', { expires: date, httpOnly: true });
                                var usuarioIBM = userExample;
                                usuarioIBM.login = chapa;
                                usuarioIBM.name.first = 'Admin';
                                usuarioIBM.name.last = 'IBM';
                                usuarioIBM.email = 'admin@br.ibm.com';
                                req.session.level = 2;
                                objReturn.status = 'ok';
                                objReturn.message = 'Sucesso ao realizar autenticacoa';
                                objReturn.user = usuarioIBM;
                                req.session.user = usuarioIBM;
                                return res.json(200, objReturn);

                            } else {

                                objReturn.status = 'error';
                                objReturn.message = 'Access denied';
                                return res.json(403, objReturn);

                            }
                        }

                    })
                    .catch(function (err) {
                        logger.error(err);
                        objReturn.status = 'error';
                        objReturn.message = err.error ? err.error : err.message;
                        return res.json(500, objReturn);
                    });



            } else {
                objReturn.status = 'error';
                objReturn.message = 'Access denied';
                return res.json(403, objReturn);
            }
        }
    }
};

