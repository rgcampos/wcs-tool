app.controller("historico", ['$scope', '$timeout', '$http', '$filter', '$compile', function ($scope, $timeout, $http, $filter, $compile) {

    $scope.dadosHistorico = [];
    $scope.mostraLoader = false;
    var elmtDt = angular.element(document.querySelector('#tabelaHistorico'));
    var toneColors = {
        "emotion_tone": {
            "anger": "#81F781",
            "fear": "#BE81F7",
            "joy": "#F3F781",
            "sadness": "#F78181",
            "disgust": "#81DAF5"
        },
        "language_tone": {
            "analytical": "#81F781",
            "tentative": "#81DAF5",
            "confident": "#BE81F7"
        },
        "social_tone": {
            "openness_big5": "#81F781",
            "conscientiousness_big5": "#81DAF5",
            "extraversion_big5": "#BE81F7",
            "agreeableness_big5": "#F3F781",
            "emotional_range_big5": "#F78181"
        }
    };
    var backgroundColor = '';


    function setInputDate() {
        var hoy = new Date(),
            d = hoy.getDate(),
            m = hoy.getMonth(),
            y = hoy.getFullYear();
        $scope.date_start = new Date(y, m, d);
        $scope.date_end = new Date(y, m, d);
    };

    function loadDataTable(start, end) {

        if ($.fn.DataTable.fnIsDataTable(elmtDt)) {
            elmtDt.DataTable().destroy();
            $scope.dadosHistorico = [];
        }

        $http({
            method: 'POST',
            url: '/historico/list',
            headers: { 'Content-Type': 'application/json' },
            data: { busca: { '>=': start, '<=': end } }
        })
            .then(function (success) {
                $scope.mostraLoader = false;
                $scope.dadosHistorico = success.data;
            }, function (err) {
                alert(JSON.stringify(err));
                console.log(err);
                $scope.sessionExpired(err);
            })
            .then(function () {
                setTimeout(function () {
                    elmtDt.DataTable({
                        responsive: true,
                        lengthMenu: [
                            [15, 30, 50, -1],
                            [15, 30, 50, "All"]
                        ],
                        pageLength: 15,
                        destroy: true,
                        dom: 'Bfrtip',
                        buttons: [
                            'copy', 'csv', 'pdf', 'print'
                        ]
                    });
                }, 150);
            });
    }

    $scope.load = function () {
        $scope.mostraLoader = true;
        setInputDate();
        var start = new Date($scope.date_start);
        start.setUTCHours(0, 0, 0, 0);
        var end = new Date($scope.date_end);
        end.setUTCHours(23, 59, 59, 0);

        loadDataTable(start, end);
    }

    $scope.find = function () {
        $scope.mostraLoader = true;
        var start = new Date($scope.date_start);
        start.setUTCHours(0, 0, 0, 0);
        var end = new Date($scope.date_end);
        end.setUTCHours(23, 59, 59, 0);

        loadDataTable(start, end);
    }

    $scope.abrirModalTone = function (workspaceId, conversationId) {
        var req = {
            method: 'GET',
            cache: false,
            url: '/historico/toneanalyzer?conversationId=' + conversationId + '&workspaceId=' + workspaceId,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        $http(req)
            .then(function (success) {
                var dados = success.data;
                $scope.mworkspace = workspaceId;
                $scope.mconversation = conversationId;

                if (dados.status == 'ok') {
                    var template = '<tr class="CLASSLINE"><td class="text-left modalHistoricoAgente">USER</td><td>TEXT TONE</td></tr>';
                    var htmlDialogo = '';

                    for (var i = (dados.body.length - 1); i >= 0; i--) {
                        var value = dados.body[i];
                        var tables = '<span class="tone">';
                        for (var j = 0; j < value.analysis.document_tone.tone_categories.length; j++) {
                            var valueCat = value.analysis.document_tone.tone_categories[j];
                            var catName = valueCat.category_name;
                            tables += '<table class="table" style="float: left; width: 28%; margin-right: 7px;"><thead> <tr> <th>' + catName + '</th> </tr> </thead> <tbody>';
                            for (var k = 0; k < valueCat.tones.length; k++) {
                                var valueTone = valueCat.tones[k];
                                var cor = toneColors[valueCat.category_id][valueTone.tone_id];
                                var confidencia = (valueTone.score * 100).toFixed(2);
                                tables += '<tr> <td><div style="width: 100%; background: -moz-linear-gradient(left, ' + cor + ' 0%, ' + cor + ' ' + confidencia + '%, #FFFFFF ' + confidencia + '%, #FFFFFF 100%); background: -webkit-gradient(left top, right top, color-stop(0%, ' + cor + '), color-stop(' + confidencia + '%, ' + cor + '), color-stop(' + confidencia + '%, #FFFFFF), color-stop(100%, #FFFFFF)); background: -webkit-linear-gradient(left, ' + cor + ' 0%, ' + cor + ' ' + confidencia + '%, #FFFFFF ' + confidencia + '%, #FFFFFF 100%); background: -o-linear-gradient(left, ' + cor + ' 0%, ' + cor + ' ' + confidencia + '%, #FFFFFF ' + confidencia + '%, #FFFFFF 100%); background: -ms-linear-gradient(left, ' + cor + ' 0%, ' + cor + ' ' + confidencia + '%, #FFFFFF ' + confidencia + '%, #FFFFFF 100%); background: linear-gradient(to right, ' + cor + ' 0%, ' + cor + ' ' + confidencia + '%, #FFFFFF ' + confidencia + '%, #FFFFFF 100%);">' + valueTone.tone_name + ': ' + confidencia + '%</div></td> </tr>';
                            }
                            tables += '</tbody> </table>';
                        }
                        tables += '</span>';

                        htmlDialogo += template
                            .replace('USER', value.username)
                            .replace('TEXT', value.text)
                            .replace('CLASSLINE', 'modalHistoricoLinhaAtendente')
                            .replace('TONE', tables);
                    }
                    angular.element(document.querySelector('#conteudoDialogoModalTone')).html(htmlDialogo);

                } else {
                    angular.element(document.querySelector('#conteudoDialogoModalTone')).html('<br><br>Tone Analyzer não configurado!');
                }
            }, function (err) {
                alert(JSON.stringify(err));
                console.log(err);
                angular.element(document.querySelector('#conteudoDialogoModalTone')).html('');
                $scope.sessionExpired(err);
            })
            .then(function () {
                $timeout(function () {
                    var elmt = angular.element(document.querySelector('#conteudoModalTone'));
                    elmt.mCustomScrollbar({
                        setHeight: 400,
                        theme: "inset-2-dark"
                    });
                }, 150);
            });

    }


    $scope.abrirModalHistorico = function (workspaceId, conversationId) {
        var req = {
            method: 'GET',
            cache: false,
            url: '/historico/find?conversationId=' + conversationId + '&workspaceId=' + workspaceId,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        $http(req)
            .then(function (success) {
                var dados = success.data;
                if (dados.status == 'ok') {
                    $scope.mworkspace = workspaceId;
                    $scope.mconversation = conversationId;

                    var template = '<tr class="CLASSLINE"><td class="text-left modalHistoricoAgente">USER</td><td>TEXT INTENCAO</td></tr>';
                    var htmlDialogo = '';
                    var intencoes = '';
                    var countForm = 0;

                    for (var i = 0; i < dados.body.length; i++) {
                        countForm++;
                        intencoes = '';
                        var item = dados.body[i];

                        if (item.typeAgent == 1) {
                            angular.forEach(item.intents, function (v, c) {
                                if (c <= 2) {
                                    var confidencia = (v.confidence * 100).toFixed(2);
                                    intencoes += '&nbsp;#' + v.intent + ':&nbsp;' + confidencia + '%&nbsp;';
                                }
                            });
                            intencoes = intencoes.trim() == '' ? '' : '<span class="intent"><img src="/images/intention.png" height="10" alt="Intenções">&nbsp;' + intencoes.trim() + '</span>';

                            htmlDialogo += template
                                .replace('USER', 'Watson')
                                .replace('TEXT', item.text.trim())
                                .replace('CLASSLINE', 'modalHistoricoLinhaAtendente')
                                .replace('INTENCAO', intencoes);
                        } else {
                            // if ((i + 1) < dados.body.length) {
                            //     var nextItem = dados.body[i + 1];
                            //     intencoes = comboGenerate(nextItem.intents, countForm, item.text.trim());
                            //     intencoes = intencoes.trim() == '' ? '' : '<span class="addIntent">' + intencoes + '</span>';
                            // }
                            htmlDialogo += template
                                .replace('USER', item.username)
                                .replace('TEXT', item.text.trim())
                                .replace('CLASSLINE', 'modalHistoricoLinhaUsuario')
                                .replace('INTENCAO', intencoes);
                        }
                    }
                    angular.element(document.querySelector('#conteudoDialogoModalHistorico')).html(htmlDialogo);
                    // $compile($('#conteudoDialogoModalHistorico'))($scope);

                }
            }, function (err) {
                alert(JSON.stringify(err));
                console.log(err);
                angular.element(document.querySelector('#conteudoDialogoModalHistorico')).html('');
                $scope.sessionExpired(err);
            })
            .then(function () {
                $timeout(function () {
                    var elmt = angular.element(document.querySelector('#conteudoModalHistorico'));
                    elmt.mCustomScrollbar({
                        setHeight: 550,
                        theme: "inset-2-dark"
                    });
                    elmt.mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
                        scrollInertia: 10,
                        timeout: 0
                    });
                }, 150);
            });
    }

}]);