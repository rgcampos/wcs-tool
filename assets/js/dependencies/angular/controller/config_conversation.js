app.controller("configConversation", ['$scope', '$timeout', '$http', function ($scope, $timeout, $http) {

    $scope.operacaoSucesso = false;
    $scope.operacaoFalha = false;
    $scope.formData = {};


    $scope.load = function () {
        $scope.formData.save_history = "0";
        $scope.formData.show_feedback = "0";
        $scope.formData.show_emoji = "0";
        $scope.formData.conversation_start = "0";

        let req = {
            method: 'GET',
            cache: false,
            url: '/configconversation/load',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        $http(req)
            .then(function success(res) {
                let data = res.data.body;
                angular.forEach(data, function (value, key) {
                    if (value.emoji) {
                        $scope.formData.show_emoji = "1";
                    }
                    if (value.history) {
                        $scope.formData.save_history = "1";
                    }
                    if (value.feedback) {
                        $scope.formData.show_feedback = "1";
                    }
                    if (value.conversation_start) {
                        $scope.formData.conversation_start = "1";
                    }
                    $scope.formData.url_api = value.url_api;
                    $scope.formData.user_bluemix = value.user;
                    $scope.formData.token_bluemix = value.token;
                    $scope.formData.record_id = value.id;
                    $scope.formData.workspace_id = value.workspace_id;
                    $scope.formData.evaluation_message = value.evaluation_message;
                    $scope.formData.end_conversation_message = value.end_conversation_message;
                    $scope.formData.version_date = value.version_date;
                    $scope.formData.external_token = value.external_token;
                });
            }, function fail(err) {
                alert(JSON.stringify(err));
                console.log(err);
                $scope.sessionExpired(err);
            });
    }

    $scope.formSubmit = function () {
        let dataParams = {
            recordId: $scope.formData.record_id,
            urlApi: $scope.formData.url_api,
            workspaceId: $scope.formData.workspace_id,
            userBluemix: $scope.formData.user_bluemix,
            tokenBluemix: $scope.formData.token_bluemix,
            saveHistory: $scope.formData.save_history,
            showFeedback: $scope.formData.show_feedback,
            showEmoji: $scope.formData.show_emoji,
            versionDate: $scope.formData.version_date,
            evaluationMessage: $scope.formData.evaluation_message,
            endConversationMessage: $scope.formData.end_conversation_message,
            conversationStart: $scope.formData.conversation_start,
            externalToken: $scope.formData.external_token
        };
        let req = {
            method: 'POST',
            url: '/configconversation/save',
            headers: {
                'Content-Type': 'application/json'
            },
            data: dataParams
        };

        $http(req).then(function success(res) {
            $scope.formData.record_id = res.data.idObject;
            $scope.operacaoSucesso = true;
        }, function fail(err) {
            alert(JSON.stringify(err));
            console.log(err);
            $scope.operacaoFalha = true;
            $scope.sessionExpired(err);
        });


    }


    $scope.generateToken = function () {
        let req = {
            method: 'GET',
            cache: false,
            url: '/external/hash',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        $http(req).then(function success(res) {
            if (res.data.status == 'ok') {
                $scope.formData.external_token = res.data.hash;
            }
        }, function fail(res) {
            alert(JSON.stringify(err));
            console.log(err);
            $scope.formData.external_token = '';
            $scope.sessionExpired(err);
        });
    }

}]);