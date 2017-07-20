/**
 * RelatorioController
 *
 * @description :: Server-side logic for managing relatorios
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	utilizacao_satisfacao: (req, res) => {
        res.view('relatorio/utilizacao_satisfacao')
    },
    pergunta_resposta: (req, res) => {
        res.view('relatorio/pergunta_resposta')
    },
    confidencia_baixa: (req, res) => {
        res.view('relatorio/confidencia_baixa')
    },
    metricas: (req, res) => {
        res.view('relatorio/metricas')
    }
};

