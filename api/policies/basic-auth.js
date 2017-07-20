module.exports = function (req, res, next) {
    var lvl = req.session.level;
    var url = req.url;
    var authCookie = req.cookies.auth;
    var isAjaxRequest = req.xhr;

    if (req.url == '/') {
        return next();
    } else if (typeof lvl !== 'undefined' && typeof authCookie !== 'undefined') {
        var authCookie = req.cookies.auth;
        var authHashEmployer = '9645c521631d2a66007e01d7a85cf029';
        var authHashIBM = 'c8f72cf322c3b14417919cb1b107dfcd';
        var authHashIBMTest = '68a24878cc568766b735c62be5f306ed';

        switch (authCookie) {
            case authHashIBM:
                return next();
            case authHashIBMTest:
                if ((url.indexOf('/chat') !== -1) ||
                    (url.indexOf('/configconversation/load') !== -1) ||
                    (url.indexOf('/configuracao') !== -1) ||
                    (url.indexOf('/feedback') !== -1) ||
                    (url.indexOf('/coleta') !== -1) ||
                    (url.indexOf('/logout') !== -1) ||
                    (url.indexOf('/historico') !== -1)) {
                    return next();
                }
                return res.forbidden();
            case authHashEmployer:
                if ((url.indexOf('/chat') !== -1) ||
                    (url.indexOf('/configconversation/load') !== -1) ||
                    (url.indexOf('/configuracao') !== -1) ||
                    (url.indexOf('/feedback') !== -1) ||
                    (url.indexOf('/logout') !== -1) ||
                    (url.indexOf('/historico') !== -1)) {
                    return next();
                }
                return res.forbidden();
            default:
                return res.redirect('/');
        }
    } else if (isAjaxRequest) {
        if (typeof lvl !== 'undefined') {
            req.session.destroy();
            req.session = null;
        }
        res.clearCookie('auth');
        return res.json(401, { code: 2, status: 'error', message: 'Access denied' });
    } else {
        res.clearCookie('auth');
        return res.redirect('/');
    }
};