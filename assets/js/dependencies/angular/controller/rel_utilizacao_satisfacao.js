/// <reference path="../../rel_utilizacao_satisfacao.js" />

app.controller("relUtilizacaoSatisfacao", ['$scope', '$timeout', '$http', function ($scope, $timeout, $http) {

    $scope.mostraLoader = false;
    $scope.dataFeedback = [];
    $scope.dataHistorico = [];
    var elmtDtFeedback = $('#tableFeedback');
    var elmtDtHistory = $('#tableHistory');

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

        if ($.fn.DataTable.fnIsDataTable(elmtDtFeedback)) {
            elmtDtFeedback.DataTable().destroy();
            $scope.dataFeedback = [];
        }
        if ($.fn.DataTable.fnIsDataTable(elmtDtHistory)) {
            elmtDtHistory.DataTable().destroy();
            $scope.dataHistorico = [];
        }

        var req = {
            method: 'POST',
            url: '/relatorioutilizacaosatisfacao/load',
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
                $scope.dataFeedback = success.data.report.feedback;
                $scope.dataHistorico = success.data.report.historico;

                setTimeout(function () {
                    elmtDtFeedback.DataTable({
                        responsive: true,
                        lengthMenu: [[15, 30, 50, -1], [15, 30, 50, "All"]],
                        pageLength: 15,
                        destroy: true,
                        dom: 'Bfrtip',
                        buttons: [
                            'csv', 'pdf'
                        ]
                    });

                    elmtDtHistory.DataTable({
                        responsive: true,
                        lengthMenu: [[15, 30, 50, -1], [15, 30, 50, "All"]],
                        pageLength: 15,
                        destroy: true,
                        dom: 'Bfrtip',
                        buttons: [
                            'csv', 'pdf'
                        ]
                    });
                }, 150);

                $scope.mostraLoader = false;
            }, function (err) {
                alert(JSON.stringify(err));
                console.log(err);
                $scope.sessionExpired(err);
            });
    }

    $scope.find = function () {
        var start = new Date($scope.date_start);
        start.setUTCHours(0, 0, 0, 0);
        var end = new Date($scope.date_end);
        end.setUTCHours(23, 59, 59, 0);

        if ($.fn.DataTable.fnIsDataTable(elmtDtFeedback)) {
            elmtDtFeedback.DataTable().destroy();
            $scope.dataFeedback = [];
        }
        if ($.fn.DataTable.fnIsDataTable(elmtDtHistory)) {
            elmtDtHistory.DataTable().destroy();
            $scope.dataHistorico = [];
        }

        var req = {
            method: 'POST',
            url: '/relatorioutilizacaosatisfacao/load',
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
                $scope.dataFeedback = success.data.report.feedback;
                $scope.dataHistorico = success.data.report.historico;

                setTimeout(function () {
                    elmtDtFeedback.DataTable({
                        responsive: true,
                        lengthMenu: [[15, 30, 50, -1], [15, 30, 50, "All"]],
                        pageLength: 15,
                        destroy: true,
                        dom: 'Bfrtip',
                        buttons: [
                            'csv', 'pdf'
                        ]
                    });

                    elmtDtHistory.DataTable({
                        responsive: true,
                        lengthMenu: [[15, 30, 50, -1], [15, 30, 50, "All"]],
                        pageLength: 15,
                        destroy: true,
                        dom: 'Bfrtip',
                        buttons: [
                            'csv', 'pdf'
                        ]
                    });
                }, 150);

                $scope.mostraLoader = false;
            }, function (err) {
                alert(JSON.stringify(err));
                console.log(err);
                $scope.sessionExpired(err);
            });
    }

}]);