var app = angular.module("chatBot", []);

app.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
});

//Define o elemento da pagina que recebera a toolbar
app.directive("toolbar", function () {
    return {
        templateUrl: "/templates/toolbar.html",
        controller: "menu",
        link: function (scope, el, atrrs) {
            //Definir o nivel de acesso do usuario aqui!
            scope.level = 2;
        }
    }
});

app.directive("compareTo", function () {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function (scope, element, attributes, ngModel) {

            ngModel.$validators.compareTo = function (modelValue) {
                // console.log(modelValue);
                return (modelValue == scope.otherModelValue);
            };

            scope.$watch("otherModelValue", function () {
                ngModel.$validate();
            });
        }
    };
});

app.constant('ConsTest', {
    StatusExecucaoTeste: {
        1: 'statusExecucaoParada',
        2: 'statusExecucaoAndamento',
        3: 'statusExecucaoSucesso'
    }
});

app.filter('orderObjectBy', function () {
    return function (input, attribute) {
        if (!angular.isObject(input)) return input;

        var array = [];
        for (var objectKey in input) {
            array.push(input[objectKey]);
        }

        array.sort(function (a, b) {
            a = parseInt(a[attribute]);
            b = parseInt(b[attribute]);
            return a - b;
        });
        return array;
    }
});

app.filter('to_trusted', ['$sce', function ($sce) {
    return function (text) {
        return $sce.trustAsHtml(text);
    };
}]);

app.run(function ($rootScope, $location, $window) {
    $rootScope.sessionExpired = function (err) {
        if (err && err.status == 401 && err.data.message == 'Access denied') {
            var port = $location.port() == '' || $location.port() == '80' ? '' : ':' + $location.port();
            var host = $location.protocol() + '://' + $location.host() + port;
            $window.location.href = host;
        }
    }
});