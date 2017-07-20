app.controller("acuraciaTuring", ['$scope', 'ConsTest', '$timeout', '$http', function ($scope, ConsTest, $timeout, $http) {


    $scope.inputPerguntaResposta = [];
    $scope.listaDataTable = [];
    $scope.listaExecucoes = [];
    $scope.operacaoSucesso = false;
    $scope.operacaoFalha = false;

    var elmtDt = $('#listaTuring');

    function mudaStatusExecucao(statusAtual, el) {
        el.removeClass();
        switch (statusAtual) {
            case ConsTest.StatusExecucaoTeste['1']:
                el.addClass('bolaParado');
                break;
            case ConsTest.StatusExecucaoTeste['2']:
                el.addClass('bolaAndamento');
                break;
            case ConsTest.StatusExecucaoTeste['3']:
                el.addClass('bolaSucesso');
                break;

            default:
                el.addClass('bolaParado');
                break;
        }
    }

    $scope.load = function () {
        if ($.fn.DataTable.fnIsDataTable(elmtDt)) {
            elmtDt.DataTable().destroy();
            $scope.listaDataTable = [];
        }
        var req = {
            method: 'GET',
            cache: false,
            url: '/acuraciaturing/load',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        $http(req)
            .then(function success(res) {
                if (res.data.status == 'ok') {
                    $scope.listaDataTable = res.data.body;
                }
            }, function fail(err) {
                alert(JSON.stringify(err));
                console.log(err);
                $scope.sessionExpired(err);
            }).then(function () {
                $timeout(function () {
                    elmtDt.DataTable({
                        responsive: true,
                        lengthMenu: [[15, 30, 50, -1], [15, 30, 50, "All"]],
                        pageLength: 15,
                        destroy: true,
                        columnDefs: [
                            {
                                "width": "50%", "targets": 0
                            }
                        ],
                        dom: 'Bfrtip',
                        buttons: [
                            'copy', 'csv', 'pdf', 'print'
                        ]
                    });
                }, 250);
            });
    }

    $scope.novaPerguntaResposta = function () {
        var newItemNo = $scope.inputPerguntaResposta.length + 1;
        $scope.inputPerguntaResposta.push({
            idPergunta: 'pergunta' + newItemNo,
            valorPergunta: '',
            textoPergunta: 'Pergunta ' + newItemNo,
            idResposta: 'resposta' + newItemNo,
            valorResposta: '',
            textoResposta: 'Resposta ' + newItemNo
        });
    }

    $scope.removePerguntaResposta = function () {
        var lastItem = $scope.inputPerguntaResposta.length - 1;
        $scope.inputPerguntaResposta.splice(lastItem);
    }

    $scope.salvar = function () {

        if ($scope.inputPerguntaResposta.length > 0) {
            var arrPerguntaResposta = [];
            for (var i = 0; i < $scope.inputPerguntaResposta.length; i++) {
                var newObj = {
                    pergunta: $scope.inputPerguntaResposta[i].valorPergunta,
                    resposta: $scope.inputPerguntaResposta[i].valorResposta
                };
                arrPerguntaResposta.push(newObj);

            }
            var req = {
                method: 'POST',
                url: '/acuraciaturing/save',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    nomeTeste: $scope.nomeTeste,
                    perguntaResposta: arrPerguntaResposta
                }
            };
            $http(req)
                .then(function success(res) {
                    $scope.inputPerguntaResposta = [];
                    $scope.nomeTeste = '';
                    $scope.operacaoSucesso = true;
                }, function fail(err) {
                    alert(JSON.stringify(err));
                    console.log(err);
                    $scope.operacaoFalha = true;
                    $scope.sessionExpired(err);
                }).then(function () {
                    $timeout(function () {
                        $scope.load();
                    }, 500);
                });
        } else {
            $scope.operacaoFalha = true;
        }
    }

    $scope.apagar = function (idTeste) {
        var req = {
            method: 'GET',
            cache: false,
            url: '/acuraciaturing/delete?testId=' + idTeste,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        $http(req)
            .then(function success(res) {
                $scope.operacaoSucesso = true;
            }, function fail(err) {
                alert(JSON.stringify(err));
                console.log(err);
                $scope.sessionExpired(err);
            }).then(function () {
                $timeout(function () {
                    $scope.load();
                }, 500);
            });


    }

    $scope.executar = function (idTeste, event) {
        // console.log(idTeste);
        // console.log(event);
        // console.log(el);
        var elClick = $(event.target);
        var elStatus = elClick.parent().next().children();
        mudaStatusExecucao(ConsTest.StatusExecucaoTeste['2'], elStatus);
        var req = {
            method: 'GET',
            cache: false,
            url: '/acuraciaturing/execute?testId=' + idTeste,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        $http(req)
            .then(function success(res) {
                if (res.data.status == 'ok') {
                    mudaStatusExecucao(ConsTest.StatusExecucaoTeste['3'], elStatus);
                } else {
                    mudaStatusExecucao(ConsTest.StatusExecucaoTeste['1'], elStatus);
                }
            }, function fail(err) {
                alert(JSON.stringify(err));
                console.log(err);
                mudaStatusExecucao(ConsTest.StatusExecucaoTeste['1'], elStatus);
                $scope.sessionExpired(err);
            });
    }

    $scope.verTeste = function (idTeste) {
        $scope.listaExecucoes = [];
        var req = {
            method: 'GET',
            cache: false,
            url: '/acuraciaturing/find?testId=' + idTeste,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        $http(req)
            .then(function success(res) {
                if (res.data.status == 'ok') {
                    var obj = res.data.object;
                    $scope.listaExecucoes = obj.execucoes;
                }
            }, function fail(err) {
                alert(JSON.stringify(err));
                console.log(err);
                $scope.sessionExpired(err);
            }).then(function () {
                $timeout(function () {
                    var elmt = angular.element(document.querySelector('#conteudoModalHistorico'));
                    elmt.mCustomScrollbar({
                        setHeight: 400,
                        theme: "inset-2-dark"
                    });
                }, 250);
            });
    }

    $scope.verExecucao = function (event) {
        var elClick = $(event.target);
        elClick.attr({
            src: elClick.attr('data-other-src'),
            'data-other-src': elClick.attr('src')
        });
        var elExecucao = elClick.parent().parent().next();
        while (typeof elExecucao !== 'undefined' && elExecucao && elExecucao.length) {
            elExecucao.fadeToggle("slow");
            elExecucao = elExecucao.next();
        }
    }



    // $scope.removePerguntaResposta = function (item) {
    //     var lastItem = $scope.inputPerguntaResposta.indexOf(item);
    //     $scope.inputPerguntaResposta.splice(lastItem, 1);
    // }
}]);