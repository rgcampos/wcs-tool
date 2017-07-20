app.controller("configToneAnalyzer", ['$scope', '$timeout', '$http', function ($scope, $timeout, $http) {


    $scope.load = function () {
        let req = {
            method: 'GET',
            cache: false,
            url: '/configtoneanalyzer/load',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        $http(req).then(function success(res) {
            let data = res.data.body;
            angular.forEach(data, function (value, key) {
                $scope.url_api = value.url_api;
                $scope.user_bluemix = value.user;
                $scope.token_bluemix = value.token;
                $scope.record_id = value.id;
                $scope.version_date = value.version_date;
            });
        }, function fail(err) {
            alert(JSON.stringify(err));
            console.log(err);
        });
    }

    $scope.formSubmit = function () {
        let dataParams = {
            record_id: $scope.record_id,
            url_api: $scope.url_api,
            user_bluemix: $scope.user_bluemix,
            token_bluemix: $scope.token_bluemix,
            version_date: $scope.version_date
        };
        let req = {
            method: 'POST',
            url: '/configtoneanalyzer/save',
            headers: {
                'Content-Type': 'application/json'
            },
            data: dataParams
        };

        $http(req).then(function success(res) {
            $scope.record_id = res.data.idObject;
            $scope.operacaoSucesso = true;
        }, function fail(err) {
            alert(JSON.stringify(err));
            console.log(err);
            $scope.operacaoFalha = true;
        });
    }

}]);