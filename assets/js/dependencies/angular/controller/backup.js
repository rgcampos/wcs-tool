app.controller("backup", ['$scope', '$timeout', '$http', function ($scope, $timeout, $http) {

    $scope.dadosBackup = [];
    $('#alertNovoBackup').hide();
    $scope.mostraLoader = true;
    $scope.operacaoSucesso = false;
    $scope.operacaoFalha = false;

    $scope.load = function () {
        $scope.dadosBackup = [];
        var req = {
            method: 'GET',
            cache: false,
            url: '/backup/list',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        $http(req)
            .then(function (success) {
                var obj = success.data;
                $scope.mostraLoader = false;
                if (obj.status == 'ok') {
                    $scope.dadosBackup = obj.result;
                    setTimeout(function () {
                        var elmt = angular.element(document.querySelector('#tableBackup'));
                        elmt.DataTable({
                            responsive: true,
                            lengthMenu: [[15, 30, 50, -1], [15, 30, 50, "All"]],
                            pageLength: 15,
                            destroy: true,
                            columnDefs: [
                                { "width": "10%", "targets": 0 },
                                { "width": "65%", "targets": 1 },
                                { "width": "25%", "targets": 2 }
                            ],
                            dom: 'Bfrtip',
                            buttons: [
                                'copy', 'csv', 'pdf', 'print'
                            ]
                        });
                    }, 150);
                }
            }, function (err) {
                alert(JSON.stringify(err));
                console.log(err);
                $scope.sessionExpired(err);
            });
    };

    $scope.fazerBackup = function () {
        $('#btnNovoBackup').addClass('disabled');
        $('#alertNovoBackup').show();
        var req = {
            method: 'GET',
            cache: false,
            url: '/backup/execute',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        $http(req)
            .then(function (success) {
                $scope.operacaoSucesso = true;
            }, function (err) {
                alert(JSON.stringify(err));
                console.log(err);
                $scope.operacaoFalha = true;
                $scope.sessionExpired(err);
            }).then(function () {
                $('#btnNovoBackup').removeClass('disabled');
                $('#alertNovoBackup').hide();
            });
    };

    $scope.downloadBackup = function (idBackup) {
        alert(idBackup);
    };

}]);