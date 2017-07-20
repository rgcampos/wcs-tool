app.controller("logUser", ['$scope', '$timeout', '$http', function ($scope, $timeout, $http) {

    $scope.dadosLog = [];
    $scope.mostraLoader = true;
    $scope.operacaoSucesso = false;
    $scope.operacaoFalha = false;

    $scope.load = function () {
        $scope.dadosLog = [];
        var req = {
            method: 'GET',
            cache: false,
            url: '/log/list',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        $http(req)
            .then(function (success) {
                var obj = success.data;
                console.log(success);
                $scope.mostraLoader = false;
                if (obj.status == 'ok') {
                    $scope.dadosLog = obj.body;
                }
            }, function (err) {
                alert(JSON.stringify(err));
                console.log(err);
                $scope.sessionExpired(err);
            })
            .then(function () {
                setTimeout(function () {
                    var elmt = angular.element(document.querySelector('#tableLog'));
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
                            'csv', 'pdf'
                        ]
                    });
                }, 150);
            });
    };


}]);