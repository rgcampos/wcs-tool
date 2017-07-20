/**
 * CorpusController
 *
 * @description :: Server-side logic for managing Corpuses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    intencao: (req, res) => res.view('corpus/intencao'),
    entidade: (req, res) => res.view('corpus/entidade')

};

