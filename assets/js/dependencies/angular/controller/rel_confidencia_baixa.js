app.controller("relConfidenciaBaixa", ['$scope', '$timeout', '$http', function ($scope, $timeout, $http) {

    $scope.dadosConfidenciaBaixa = [];
    $scope.mostraLoader = false;
    var elmtDt = $('#tableConfidencia');

    function setInputDate() {
        var hoy = new Date(),
            d = hoy.getDate(),
            m = hoy.getMonth(),
            y = hoy.getFullYear();
        $scope.date_start = new Date(y, m, d);
        $scope.date_end = new Date(y, m, d);
    };

    $scope.load = function () {
        $scope.mostraLoader = true;
        setInputDate();
        var start = new Date($scope.date_start);
        start.setUTCHours(0, 0, 0, 0);
        var end = new Date($scope.date_end);
        end.setUTCHours(23, 59, 59, 0);
        $scope.threshold = 0.65;
        $scope.mostraLoader = false;
    }

    $scope.formSubmit = function () {
        var start = new Date($scope.date_start);
        start.setUTCHours(0, 0, 0, 0);
        var end = new Date($scope.date_end);
        end.setUTCHours(23, 59, 59, 0);


        var req = {
            method: 'POST',
            url: '/relatorioconfidenciabaixa/find',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                busca: {
                    maiorIgual: start,
                    menorIgual: end,
                    nivelConfidencia: $scope.threshold
                }
            }
        };

        $scope.mostraLoader = true;
        $http(req)
            .then(function (success) {
                if (success.data.status == 'ok') {
                    var res = success.data.result;
                    if ($.fn.DataTable.fnIsDataTable(elmtDt)) {
                        elmtDt.DataTable().destroy();
                        $scope.dadosConfidenciaBaixa = [];
                    }
                    $scope.dadosConfidenciaBaixa = res;
                }
            }, function (err) {
                alert(JSON.stringify(err));
                console.log(err);
                $scope.sessionExpired(err);
            }).then(function () {
                $scope.mostraLoader = false;
                $timeout(function () {
                    elmtDt.DataTable({
                        responsive: true,
                        lengthMenu: [[10, 30, 50, -1], [10, 30, 50, "All"]],
                        pageLength: 10,
                        destroy: true,
                        order: [[5, "desc"]],
                        columnDefs: [
                            { "width": "5%", "targets": 0 },
                            { "width": "28%", "targets": 1 },
                            { "width": "22%", "targets": 2 },
                            { "width": "20%", "targets": 3 },
                            { "width": "10%", "targets": 4 },
                            { "width": "15%", "targets": 5 }
                        ],
                        dom: 'Bfrtip',
                        buttons: [
                            'copy', 'csv', 'pdf', 'print'
                        ]
                    });
                }, 250);
            });

    }


    $scope.abrilModal = function (workspace_id, conversation_id) {
        var req = {
            method: 'GET',
            cache: false,
            url: '/historico/find?conversationId=' + conversation_id + '&workspaceId=' + workspace_id,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        $http(req)
            .then(function (success) {
                var dados = success.data;
                if (dados.status == 'ok') {
                    $scope.mworkspace = workspace_id;
                    $scope.mconversation = conversation_id;

                    var template = '<tr class="CLASSLINE"><td class="text-left modalHistoricoAgente">USER</td><td>TEXT INTENCAO</td></tr>';
                    var htmlDialogo = '';
                    angular.forEach(dados.body, function (value, key) {
                        var intencoes = '';
                        if (value.typeAgent == 1) {
                            angular.forEach(value.intents, function (v, c) {
                                if (c <= 2) {
                                    var confidencia = (v.confidence * 100).toFixed(2);
                                    intencoes += '&nbsp;#' + v.intent + ':&nbsp;' + confidencia + '%&nbsp;';
                                }
                            });

                            intencoes = intencoes.trim() == '' ? '' : '<span class="intent"><img src="/images/intention.png" height="10" alt="Intenções">&nbsp;' + intencoes.trim() + '</span>';

                            htmlDialogo += template
                                .replace('USER', 'Watson')
                                .replace('TEXT', value.text)
                                .replace('CLASSLINE', 'modalHistoricoLinhaAtendente')
                                .replace('INTENCAO', intencoes);
                        } else {
                            htmlDialogo += template
                                .replace('USER', value.username)
                                .replace('TEXT', value.text)
                                .replace('CLASSLINE', 'modalHistoricoLinhaUsuario')
                                .replace('INTENCAO', intencoes);
                        }
                    });

                    angular.element(document.querySelector('#conteudoDialogoModal')).html(htmlDialogo);
                    $timeout(function () {
                        var elmt = angular.element(document.querySelector('#conteudoModalConversa'));
                        elmt.mCustomScrollbar({
                            setHeight: 550,
                            theme: "inset-2-dark"
                        });
                        elmt.mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
                            scrollInertia: 10,
                            timeout: 0
                        });
                    }, 250);

                }
            }, function (err) {
                alert(JSON.stringify(err));
                console.log(err);
                angular.element(document.querySelector('#conteudoDialogoModal')).html('');
                $scope.sessionExpired(err);
            });
    }

}]);