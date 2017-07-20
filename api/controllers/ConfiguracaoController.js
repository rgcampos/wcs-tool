/**
 * ConfiguracaoController
 *
 * @description :: Server-side logic for managing Configuracaos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
'use strict';

module.exports = {
    conversation: (req, res) => res.view('configuracao/config_conversation'),
    toneanalyzer: (req, res) => res.view('configuracao/config_toneanalyzer'),
    personalityinsights: (req, res) => res.view('configuracao/config_personalityinsights'),
    nlc: (req, res) => res.view('configuracao/config_nlc'),
    gestaousuarios: (req, res) => res.view('configuracao/config_gestaousuarios'),
    mail: (req, res) => res.view('configuracao/config_mail'),

    loadMenu: (req, res) => {

        if (req.method !== 'GET')
            return res.forbidden();

        // res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        // res.header('Expires', '-1');
        // res.header('Pragma', 'no-cache');

        var objReturn = {
            status: 'ok'
        };

        var lvl = req.session.level;
        var itens = {
            menu: []
        };

        switch (lvl) {
            case 1:
                var infoChat = [
                    { text: 'Chat', icon: 'fa fa-weixin', address: '/chat', subitens: {} },
                    { text: 'Coleta', icon: 'fa fa-stack-exchange', address: '/coleta/index', subitens: {} },
                ];

                itens.menu.push({ text: 'Conversação', icon: 'fa fa-commenting-o', address: '', subitens: infoChat });

                break;
            case 2:
                var infoChat = [
                    { text: 'Chat', icon: 'fa fa-weixin', address: '/chat', subitens: {} },
                    { text: 'Coleta', icon: 'fa fa-stack-exchange', address: '/coleta/index', subitens: {} },
                    { text: 'Feedback', icon: 'fa fa-thumbs-up', address: '/feedback', subitens: {} },
                    { text: 'Histórico', icon: 'fa fa-history', address: '/historico/index', subitens: {} },
                    { text: 'Debug', icon: 'fa fa-eye-slash', address: '/debug/index', subitens: {} }
                ];

                var itensCorpus = [
                    { text: 'Intenções', icon: 'fa fa-random', address: '/corpus/intencao' },
                    { text: 'Entidades', icon: 'fa fa-expand', address: '/corpus/entidade' }
                ];
                var itensAcuracia = [
                    { text: 'Experimento', icon: 'fa fa-connectdevelop', address: '/acuracia/experimento' },
                    // { text: 'Bleu', icon: 'fa fa-empire', address: '/acuracia/bleu' },
                    // { text: 'Turing', icon: 'fa fa-first-order', address: '/acuracia/turing' }
                ];
                var itensConfig = [
                    { text: 'Conversation', icon: 'fa fa-comments-o', address: '/configuracao/conversation' },
                    { text: 'Tone Analyzer', icon: 'fa fa-quote-right', address: '/configuracao/toneanalyzer' },
                    { text: 'Personality Insights', icon: 'fa fa-pie-chart', address: '/configuracao/personalityinsights' },
                    { text: 'Natural Language Classifier', icon: 'fa fa-language', address: '/configuracao/nlc' },
                    { text: 'Gestão de Usuários', icon: 'fa fa-users', address: '/configuracao/gestaousuarios' },
                    { text: 'Mail', icon: 'fa fa-envelope-open', address: '/configuracao/mail' }
                ];
                var relatorios = [
                    { text: 'Utilização & Satisfação', icon: 'fa fa-hand-peace-o', address: '/relatorio/utilizacao_satisfacao' },
                    { text: 'Perguntas & Respostas', icon: 'fa fa-newspaper-o', address: '/relatorio/pergunta_resposta' },
                    { text: 'Confidência Baixa', icon: 'fa fa-battery-quarter', address: '/relatorio/confidencia_baixa' },
                    { text: 'Métricas', icon: 'fa fa-bar-chart', address: '/relatorio/metricas' }
                ];

                itens.menu.push({ text: 'Conversação', icon: 'fa fa-commenting-o', address: '', subitens: infoChat });
                itens.menu.push({ text: 'Backup', icon: 'fa fa-floppy-o', address: '/backup/index', subitens: {} });
                itens.menu.push({ text: 'Log', icon: 'fa fa-tripadvisor', address: '/log/index', subitens: {} });
                itens.menu.push({ text: 'Relatório', icon: 'fa fa-files-o', address: '', subitens: relatorios });
                itens.menu.push({ text: 'Corpus', icon: 'fa fa-cogs', address: '', subitens: itensCorpus });
                itens.menu.push({ text: 'Acurácia', icon: 'fa fa-retweet', address: '', subitens: itensAcuracia });
                itens.menu.push({ text: 'Configurações', icon: 'fa fa-cog', address: '', subitens: itensConfig });
                break;
                
            default:
                break;
        }

        objReturn.toolbar = itens;

        return res.json(200, objReturn);
    }
};