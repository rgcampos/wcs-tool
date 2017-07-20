app.controller("auth", ['$scope', '$timeout', '$http', '$location', '$window', function ($scope, $timeout, $http, $location, $window) {

    $scope.formData = {};
    $scope.operacaoSucesso = false;
    $scope.operacaoFalha = false;
    $('#loading').hide();

    $scope.processForm = function () {

        $scope.operacaoSucesso = false;
        $scope.operacaoFalha = false;
        $('#loading').show();
        $('#btnEntrar').addClass('disabled');
        // $('#btnEntrar').hide();
        $http({
            method: 'POST',
            url: '/authenticate/login',
            data: $scope.formData,
            headers: { 'Content-Type': 'application/json' }
        }).then(function (success) {
            var port = $location.port() == '' || $location.port() == '80' ? '' : ':' + $location.port();
            var host = $location.protocol() + '://' + $location.host() + port;
            $window.location.href = host + '/chat';
        }, function (err) {
            console.log(err);
            $scope.operacaoFalha = true;
            $scope.sessionExpired(err);
        }).then(function () {
            $('#loading').hide();
            $('#btnEntrar').removeClass('disabled');
            // $('#btnEntrar').show();
        });
    }

}]);
