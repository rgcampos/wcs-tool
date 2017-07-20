/**
 * HomeController
 *
 * @description :: Server-side logic for managing Homes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var _ = require('lodash');

module.exports = {
    index: (req, res) => {
        if (!_.isEmpty(req.session.user)) {
            return res.redirect('/chat');
        } else {
            return res.view('home');
        }
    }
};