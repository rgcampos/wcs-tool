app.controller("corpus_entidade", ['$scope', '$timeout', '$http', function ($scope, $timeout, $http) {


    $scope.dadosEntidade = [];
    $scope.formData = {};
    $scope.dadosEntidadeExemplo = [];
    $scope.formDataExemplo = {};
    $scope.mostraLoaderEntidade = true;
    $scope.mostraLoaderExemplo = true;
    $scope.operacaoSucesso = false;
    $scope.operacaoFalha = false;
    $scope.intent = '';
    var elmtDt = $('#tabelaEntidade');
    var elmtDtFilho = $('#tabelaEntidadeExemplo');
    $('#loading').hide();


    function init() {
        $scope.mostraLoaderEntidade = true;
        $scope.formData.entity = '';
        $scope.formData.description = '';

        if ($.fn.DataTable.fnIsDataTable(elmtDt)) {
            elmtDt.DataTable().destroy();
            $scope.dadosEntidade = [];
        }

        var req = {
            method: 'GET',
            cache: false,
            url: '/entity/listEntity',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        $http(req)
            .then(function (success) {
                var obj = success.data;
                if (obj.status == 'ok') {
                    $scope.dadosEntidade = obj.body;
                }
            }, function (err) {
                alert(JSON.stringify(err));
                console.log(err);
                $scope.sessionExpired(err);
            }).then(function () {
                $scope.mostraLoaderEntidade = false;
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
                            { "width": "10%", "targets": 0 },
                            { "width": "20%", "targets": 1 },
                            { "width": "50%", "targets": 2 },
                            { "width": "20%", "targets": 3 }
                        ]
                    });
                }, 250);
            });
    }

    function initModal(entity) {
        $scope.mostraLoaderExemplo = true;
        $scope.formDataExemplo.entity = entity;
        $scope.formDataExemplo.value = '';
        $scope.formDataExemplo.synonyms = '';

        if ($.fn.DataTable.fnIsDataTable(elmtDtFilho)) {
            elmtDtFilho.DataTable().destroy();
            $scope.dadosEntidadeExemplo = [];
        }

        var req = {
            method: 'GET',
            cache: false,
            url: '/entity/listExample?entity=' + entity,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        $http(req)
            .then(function (success) {
                var obj = success.data;
                if (obj.status == 'ok') {
                    $scope.dadosEntidadeExemplo = obj.body;
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
                            { "width": "20%", "targets": 1 },
                            { "width": "50%", "targets": 2 },
                            { "width": "20%", "targets": 3 }
                        ]
                    });
                }, 250);
            });
    }

    $scope.load = init();

    $scope.abrirModalEntidade = function (entity) {
        $scope.entity = entity;
        initModal(entity);
    };

    $scope.editarExemplo = function (value, synonyms) {
        $scope.formDataExemplo.value = value;
        $scope.formDataExemplo.synonyms = synonyms;
    }

    $scope.processFormExample = function () {
        $('#loading').show();
        $('#btnCriarValor').addClass('disabled');
        var ok = false;
        var req = {
            method: 'POST',
            url: '/entity/saveExample',
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
                $('#btnCriarValor').removeClass('disabled');
                if (ok) {
                    initModal($scope.formDataExemplo.entity);
                }
            });
    }

    $scope.excluirEntidade = function (entity) {
        var ok = false;
        var req = {
            method: 'POST',
            url: '/entity/deleteEntity',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                entity: $scope.formDataExemplo.entity
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
                    initModal($scope.formDataExemplo.entity);
                }
            });
    }

    $scope.excluirExemplo = function (value) {
        var ok = false;
        var req = {
            method: 'POST',
            url: '/entity/deleteExample',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                entity: $scope.formDataExemplo.entity,
                value
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
                    initModal($scope.formDataExemplo.entity);
                }
            });
    }

}]);