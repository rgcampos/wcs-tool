/**
 * AcuraciaController
 *
 * @description :: Server-side logic for managing Acuracias
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    bleu: (req, res) => res.view('acuracia/bleu'),
    turing: (req, res) => res.view('acuracia/turing'),
    experimento: (req, res) => res.view('acuracia/experimento'),

};

