app.controller("acuraciaExperimento", ['$scope', 'ConsTest', '$timeout', '$http', function ($scope, ConsTest, $timeout, $http) {

    $scope.listaTestes = [];
    $('#alertNovoTeste').hide();
    var elmtDt = $('#listaExperimento');
    var elmtDtMatriz = $('#tabelaMatrizConfusao');
    var elmtDtVetor = $('#tabelaVetorConfusao');

    $scope.mostraLoader = true;
    $scope.mostraLoaderMatriz = true;
    $scope.mostraLoaderVetor = true;
    $scope.tstMatriz = [];
    $scope.tstVetor = [];
    $scope.dataTeste = Date.now();

    function refreshResultado() {
        $scope.mostraLoader = true;
        if ($.fn.DataTable.fnIsDataTable(elmtDt)) {
            elmtDt.DataTable().destroy();
            $scope.listaTestes = [];
        }

        var req = {
            method: 'GET',
            cache: false,
            url: '/acuraciaexperimento/list',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        $http(req)
            .then(function (success) {
                var objLista = [];

                if (success.data.status == 'ok') {
                    $scope.listaTestes = success.data.body;
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
                        lengthMenu: [
                            [10, 30, 50, -1],
                            [10, 30, 50, "All"]
                        ],
                        pageLength: 10,
                        destroy: true,
                        dom: 'Bfrtip',
                        buttons: [
                            'csv', 'pdf'
                        ]
                    });
                }, 250);
            });
    }

    $scope.load = refreshResultado();

    $scope.criarTeste = function () {
        $('#novoTeste').addClass('disabled');
        $('#alertNovoTeste').show();
        var req = {
            method: 'GET',
            cache: false,
            url: '/acuraciaexperimento/execute',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        $http(req)
            .then(function (success) {
                refreshResultado();
            }, function (err) {
                alert(JSON.stringify(err));
                console.log(err);
                $scope.sessionExpired(err);
            })
            .then(function () {
                $('#novoTeste').removeClass('disabled');
                $('#alertNovoTeste').hide();
            });
    }

    $scope.abrirModalMatriz = function (createdAt) {
        $scope.dataTeste = createdAt;
        $scope.mostraLoaderMatriz = true;
        var req = {
            method: 'GET',
            cache: false,
            url: '/acuraciaexperimento/find?createdAt=' + createdAt,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        $http(req)
            .then(function (success) {
                $scope.tstMatriz = success.data.body[0].resultado.intentsList;
            }, function (err) {
                alert(JSON.stringify(err));
                console.log(err);
                $scope.sessionExpired(err);
            }).then(function () {
                $scope.mostraLoaderMatriz = false;
                var elmt = $('#conteudoModalMatriz');
                elmt.mCustomScrollbar({
                    axis: "yx",
                    advanced: {
                        autoExpandHorizontalScroll: true
                    },
                    setHeight: 550,
                    theme: "inset-2-dark"
                });
            });

    }

    $scope.abrirModalVetor = function (createdAt) {
        $scope.dataTeste = createdAt;
        $scope.mostraLoaderVetor = true;
        var req = {
            method: 'GET',
            cache: false,
            url: '/acuraciaexperimento/find?createdAt=' + createdAt,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        $http(req)
            .then(function (success) {
                var arrayTemp = success.data.body[0].resultado.intentsList;
                $scope.tstVetor = [];
                arrayTemp.forEach(function (intent, x) {
                    intent.confusionMatrix.forEach(function (cm, y) {
                        if (cm !== 0 && y !== x) {
                            var newExamples = [];
                            arrayTemp[x].examples.forEach(function (at) {
                                if (at.returnedIntent === arrayTemp[y].intent) {
                                    newExamples.push({
                                        example: at.example,
                                        confidence: at.confidence
                                    });
                                }
                            });
                            $scope.tstVetor.push({
                                rightIntent: arrayTemp[x].intent,
                                wrongIntent: arrayTemp[y].intent,
                                examples: newExamples,
                                value: cm,
                                hide: true
                            });
                        }
                    });
                });

                $scope.tstVetor.sort(function (a, b) {
                    if (a.value > b.value) return -1;
                    else return 1;
                });

            }, function (err) {
                alert(JSON.stringify(err));
                console.log(err);
                $scope.sessionExpired(err);
            }).then(function () {
                $scope.mostraLoaderVetor = false;
                var elmt = $('#conteudoModalVetor');
                elmt.mCustomScrollbar({
                    setWidth: 550,
                    setHeight: 550,
                    theme: "inset-2-dark"
                });
            });
    }

}]);
