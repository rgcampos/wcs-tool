/**
 * LoginController
 *
 * @description :: Server-side logic for managing Logins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    index: (req, res) => {
        var lvl = req.session.level;
        var authCookie = req.cookies.auth;
        if (typeof lvl !== 'undefined' && typeof authCookie !== 'undefined') {
            return res.redirect('/chat');
        } else {
            res.clearCookie('auth');
            return res.view('login', { layout: null });
        }
    }
};