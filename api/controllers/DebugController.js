/**
 * DebugController
 *
 * @description :: Server-side logic for managing Debugs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    index: (req, res) => {
        res.view('conversacao/debug');
    }
};

