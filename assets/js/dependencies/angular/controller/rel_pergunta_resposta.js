app.controller("relPerguntaResposta", ['$scope', '$timeout', '$http', function ($scope, $timeout, $http) {

    $scope.dadosPerguntaResposta = [];
    $scope.mostraLoader = false;
    var elmtDt = $('#tablePerguntaResposta');

    function setInputDate() {
        var hoy = new Date(),
            d = hoy.getDate(),
            m = hoy.getMonth(),
            y = hoy.getFullYear();
        $scope.date_start = new Date(y, m, d);
        $scope.date_end = new Date(y, m, d);
    };

    $scope.load = function () {
        setInputDate();
        var start = new Date($scope.date_start);
        start.setUTCHours(0, 0, 0, 0);
        var end = new Date($scope.date_end);
        end.setUTCHours(23, 59, 59, 0);

        var req = {
            method: 'POST',
            url: '/relatorioperguntaresposta/load',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                busca: {
                    '>=': start,
                    '<=': end
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
                        $scope.dadosPerguntaResposta = [];
                    }
                    $scope.dadosPerguntaResposta = res;
                    $scope.mostraLoader = false;
                }
            }, function (err) {
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
                            { "width": "15%", "targets": 0 },
                            { "width": "10%", "targets": 1 },
                            { "width": "65%", "targets": 2 }
                        ],
                        dom: 'Bfrtip',
                        buttons: [
                            'copy', 'csv', 'pdf', 'print'
                        ]
                    });
                }, 250);
            });
    }

    $scope.find = function () {
        var start = new Date($scope.date_start);
        start.setUTCHours(0, 0, 0, 0);
        var end = new Date($scope.date_end);
        end.setUTCHours(23, 59, 59, 0);


        var req = {
            method: 'POST',
            url: '/relatorioperguntaresposta/load',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                busca: {
                    '>=': start,
                    '<=': end
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
                        $scope.dadosPerguntaResposta = [];
                    }
                    $scope.dadosPerguntaResposta = res;
                    $scope.mostraLoader = false;
                }
            }, function (err) {
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
                            { "width": "15%", "targets": 0 },
                            { "width": "10%", "targets": 1 },
                            { "width": "65%", "targets": 2 }
                        ],
                        dom: 'Bfrtip',
                        buttons: [
                            'copy', 'csv', 'pdf', 'print'
                        ]
                    });
                }, 250);
            });

    }

}]);