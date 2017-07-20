app.controller("corpus_intencao", ['$scope', '$timeout', '$http', function ($scope, $timeout, $http) {

    $scope.dadosIntencao = [];
    $scope.formData = {};
    $scope.dadosIntencaoExemplo = [];
    $scope.formDataExemplo = {};
    $scope.mostraLoaderIntencao = true;
    $scope.mostraLoaderExemplo = true;
    $scope.operacaoSucesso = false;
    $scope.operacaoFalha = false;
    $scope.intent = '';
    var elmtDt = $('#tabelaIntencao');
    var elmtDtFilho = $('#tabelaIntencaoExemplo');
    $('#loading').hide();


    function init() {
        $scope.mostraLoaderIntencao = true;
        $scope.formData.intent = '';

        if ($.fn.DataTable.fnIsDataTable(elmtDt)) {
            elmtDt.DataTable().destroy();
            $scope.dadosIntencao = [];
        }

        var req = {
            method: 'GET',
            cache: false,
            url: '/intent/listIntent',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        $http(req)
            .then(function (success) {
                var obj = success.data;
                if (obj.status == 'ok') {
                    $scope.dadosIntencao = obj.body;
                }
            }, function (err) {
                alert(JSON.stringify(err));
                console.log(err);
                $scope.sessionExpired(err);
            }).then(function () {
                $scope.mostraLoaderIntencao = false;
                $timeout(function () {
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
                        ],
                        columnDefs: [
                            {
                                "width": "10%", "targets": 0
                            }
                        ]
                    });
                }, 250);
            });
    }

    function initModal(intent) {
        $scope.mostraLoaderExemplo = true;
        $scope.formDataExemplo.example = '';
        $scope.formDataExemplo.oldExample = '';
        $scope.formDataExemplo.intent = intent;

        if ($.fn.DataTable.fnIsDataTable(elmtDtFilho)) {
            elmtDtFilho.DataTable().destroy();
            $scope.dadosIntencaoExemplo = [];
        }

        var req = {
            method: 'GET',
            cache: false,
            url: '/intent/listExample?intent=' + intent,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        $http(req)
            .then(function (success) {
                var obj = success.data;
                if (obj.status == 'ok') {
                    $scope.dadosIntencaoExemplo = obj.body;
                }
            }, function (err) {
                alert(JSON.stringify(err));
                console.log(err);
                $scope.sessionExpired(err);
            }).then(function () {
                $scope.mostraLoaderExemplo = false;

                $timeout(function () {
                    elmtDtFilho.DataTable({
                        responsive: true,
                        lengthChange: false,
                        pageLength: 5,
                        searching: false,
                        destroy: true,
                        columnDefs: [
                            { "width": "10%", "targets": 0 },
                            { "width": "70%", "targets": 1 },
                            { "width": "20%", "targets": 2 }
                        ]
                    });
                }, 250);
            });
    }




    $scope.load = init();


    $scope.abrirModalIntencao = function (intent) {
        $scope.intent = intent;
        initModal(intent);
    };


    $scope.processForm = function () {
        var ok = false;
        var req = {
            method: 'POST',
            url: '/intent/saveIntent',
            headers: {
                'Content-Type': 'application/json'
            },
            data: $scope.formData
        };
        $http(req)
            .then(function (success) {
                var obj = success.data;
                if (obj.status == 'ok') {
                    ok = true;
                }
            }, function (err) {
                alert(JSON.stringify(err));
                console.log(err);
                $scope.sessionExpired(err);
            }).then(function () {
                if (ok) {
                    init();
                }
            });
    };


    $scope.processFormExample = function () {
        $('#loading').show();
        $('#btnCriarExemplo').addClass('disabled');
        var ok = false;
        var req = {
            method: 'POST',
            url: '/intent/saveExample',
            headers: {
                'Content-Type': 'application/json'
            },
            data: $scope.formDataExemplo
        };
        $http(req)
            .then(function (success) {
                var obj = success.data;
                if (obj.status == 'ok') {
                    ok = true;
                }
            }, function (err) {
                alert(JSON.stringify(err));
                console.log(err);
                $scope.sessionExpired(err);
            }).then(function () {
                $('#loading').hide();
                $('#btnCriarExemplo').removeClass('disabled');
                if (ok) {
                    initModal($scope.formDataExemplo.intent);
                }
            });
    };

    $scope.excluirIntencao = function (intent) {
        var ok = false;
        var req = {
            method: 'POST',
            url: '/intent/deleteIntent',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                intent
            }
        };
        $http(req)
            .then(function (success) {
                var obj = success.data;
                if (obj.status == 'ok') {
                    ok = true;
                }
            }, function (err) {
                alert(JSON.stringify(err));
                console.log(err);
                $scope.sessionExpired(err);
            }).then(function () {
                if (ok) {
                    init();
                }
            });
    };

    $scope.editarExemplo = function (intent, example) {
        $scope.formDataExemplo.example = example;
        $scope.formDataExemplo.oldExample = example;
        $scope.formDataExemplo.intent = intent;
    }

    $scope.excluirExemplo = function (intent, example) {
        var ok = false;
        var req = {
            method: 'POST',
            url: '/intent/deleteExample',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                intent,
                example
            }
        };
        $http(req)
            .then(function (success) {
                var obj = success.data;
                if (obj.status == 'ok') {
                    ok = true;
                }
            }, function (err) {
                alert(JSON.stringify(err));
                console.log(err);
                $scope.sessionExpired(err);
            }).then(function () {
                if (ok) {
                    initModal(intent);
                }
            });
    };

}]);