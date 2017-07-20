/**
 * ColetaController
 *
 * @description :: Server-side logic for managing Coletas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    index: (req, res) => {
        res.view('conversacao/coleta');
    }
};

