app.controller("debug", ['$scope', '$timeout', '$http', function ($scope, $timeout, $http) {

    var feedbackHtml = '<div id="bot" class="row"> <figure class="userWatson"> <img src="/images/user_watson.png" alt="Watson"> </figure> <div class="userWatsonContent"><p style="text-align:justify;margin: 5px;">XXPPTTOO</p></div> <div class="clearfix"></div> <div class="perguntaFeedback"> <button type="button" id="like" class="btn btn-sm btn-success eventFeedback"><i class="fa fa-thumbs-o-up" aria-hidden="true"></i>&nbsp;Positivo</button> <button type="button" id="unlike" class="btn btn-sm btn-warning eventFeedback"><i class="fa fa-thumbs-o-down" aria-hidden="true"></i>&nbsp;Negativo</button> </div> </div>';
    var writing = '<div id="bot" class="row"> <figure class="userWatson"> <img src="/images/user_watson.png" alt="Watson"> </figure> <div class="userWatsonTyping"> <img src="/images/typing.gif" alt="Digitando"> </div> </div>';
    var mensagemHtml = '<p style="text-align:justify;margin: 5px;">MSG</p>';

    $scope.objectConversation = {};

    function resetVariaveis() {
        $scope.api_url = '';
        $scope.user = '';
        $scope.token = '';
        $scope.workspace = '';
        $scope.feedback = false;
        $scope.emoji = false;
        $scope.history = false;
        $scope.evaluationMessage = '';
        $scope.endConversationMessage = '';
        $scope.versionDate = '';
        $scope.conversationStart = '';
        $scope.externalToken = '';
        $scope.conversation_id = '';
        $scope.user_name = '';
        $scope.user_data = {};
    }

    function addDebugIntent(intents) {
        var intecoes = '';
        angular.forEach(intents, function (v, c) {
            if (c <= 2) {
                var confidencia = (v.confidence * 100).toFixed(2);
                intecoes += '#' + v.intent + ':&nbsp;' + confidencia + '%<br>';
            }

        });
        return intecoes.trim() != '' ? '<span class="intent" style="margin-left: 60px;">' + intecoes.trim() + '</span>' : '';
    }

    function scrollChat() {
        var elementRoot = angular.element(document.querySelector('#content'));
        elementRoot.mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
            scrollInertia: 10,
            timeout: 0
        });
    }


    function startAtendimento() {
        var req = {
            method: 'GET',
            cache: false,
            url: '/authenticate/getUser',
            headers: {
                'Content-Type': 'application/json',
                'x-external-token': $scope.externalToken
            }
        };

        $http(req)
            .then(function (ok) {
                if (ok.data.status == 'ok') {
                    $scope.user_data = ok.data.user;
                    $scope.user_name = ok.data.user.name.first;
                }
            }, function (err) {
                alert(JSON.stringify(err));
                console.log(err);
                $scope.sessionExpired(err);
            })
            .then(function () {
                var iniciaBot = enviaMsg(null, { userName: $scope.user_name });
                $timeout(function () {
                    var element = angular.element(document.querySelector('#contentChat'));
                    var htmlAux = element.html();

                    iniciaBot
                        .then(function success(res) {
                            if (res.data.status == 'ok') {
                                var data = res.data.object;
                                $scope.conversation_id = data.context.conversation_id;
                                $scope.objectConversation = data;
                                htmlAux += '<div id="bot" class="row"> <figure class="userWatson"> <img src="/images/user_watson.png" alt="Watson"> </figure> <div class="userWatsonContent">' + mensagemHtml.replace('MSG', data.output.text[0].trim()) + '</div><div class="clearfix"></div> <div class="timeChat" style="margin-left: 65px; text-align: left;"><i class="fa fa-clock-o" aria-hidden="true"></i>&nbsp;' + setDate() + '</div></div>';
                                element.html(htmlAux);
                                salvaHistorico(data.output.text[0].trim(), 1);
                            }
                        }, function fail(err) {
                            alert(JSON.stringify(err));
                            console.log(err);
                            $scope.sessionExpired(err);
                        });

                }, 150);
            })
            .then(function () {
                $('div#bodybox').show();
            });
    }


    function endAtendimento() {
        var iniciaBot = enviaMsg('primeira chamada', {});
        $timeout(function () {
            var element = angular.element(document.querySelector('#contentChat'));
            var htmlAux = element.html();

            iniciaBot.then(function success(res) {
                if (res.data.status == 'ok') {
                    var data = res.data.object;
                    $scope.conversation_id = data.context.conversation_id;
                    $scope.objectConversation = data;
                    htmlAux += '<div id="bot" class="row"> <figure class="userWatson"> <img src="/images/user_watson.png" alt="Watson"> </figure> <div class="userWatsonContent">' + mensagemHtml.replace('MSG', $scope.endConversationMessage) + '</div><div class="clearfix"></div> <div class="timeChat" style="margin-left: 65px; text-align: left;"><i class="fa fa-clock-o" aria-hidden="true"></i>&nbsp;' + setDate() + '</div></div>';
                    element.html(htmlAux);
                    scrollChat();
                }
            }, function fail(err) {
                alert(JSON.stringify(err));
                console.log(err);
                $scope.sessionExpired(err);
            });

        }, 250);
    }


    function eventoFeedback(obj) {
        var element = obj.currentTarget;
        var elAngular = angular.element(obj.currentTarget);
        var feedbackAtendimento = false;
        var elNegado = null;

        if (elAngular.attr('id').trim() == 'like') {
            feedbackAtendimento = true;
            elNegado = elAngular.next();
        } else if (elAngular.attr('id').trim() == 'unlike') {
            feedbackAtendimento = false;
            elNegado = elAngular.prev();
        }

        elAngular.removeClass('eventFeedback');
        elAngular.addClass('disabled');
        elAngular.off('click');
        elNegado.removeClass('eventFeedback');
        elNegado.addClass('disabled');
        elNegado.off('click');

        var req = {
            method: 'POST',
            cache: false,
            url: '/feedback/save',
            headers: {
                'Content-Type': 'application/json',
                'x-external-token': $scope.externalToken
            },
            data: {
                workspace_id: $scope.workspace,
                conversation_id: $scope.conversation_id,
                tipo: feedbackAtendimento,
                intencao: {}
            }
        };

        $http(req)
            .then(function (success) {
                $scope.objectConversation.context = {};
                $scope.objectConversation = {};
                endAtendimento();
            }, function (err) {
                alert(JSON.stringify(err));
                console.log(err);
                $scope.sessionExpired(err);
            });
    }


    function salvaHistorico(texto, tipo) {
        if ($scope.history) {
            $http({
                method: 'POST',
                cache: false,
                url: '/historico/save',
                headers: {
                    'Content-Type': 'application/json',
                    'x-external-token': $scope.externalToken
                },
                data: {
                    workspace_id: $scope.workspace,
                    conversation_id: $scope.conversation_id,
                    mensagem: texto,
                    tipo: tipo,
                    intents: $scope.objectConversation.intents,
                    info: {
                        browser: navigator.browserSpecs
                    }
                }
            });
        }
    }


    function enviaMsg(mensagem, contexto) {
        var objPost = {
            url_api: $scope.api_url,
            user: $scope.user,
            token: $scope.token,
            workspace: $scope.workspace,
            message: mensagem,
            context: contexto,
            version_date: $scope.versionDate
        };

        return $http({
            method: 'POST',
            cache: false,
            url: '/chat/sendMessage',
            headers: {
                'Content-Type': 'application/json',
                'x-external-token': $scope.externalToken
            },
            data: objPost
        });
    }


    $scope.load = function () {
        resetVariaveis();

        var elmt = angular.element(document.querySelector('#content'));
        elmt.mCustomScrollbar({
            setHeight: 400,
            theme: "inset-2-dark"
        });


        var req = {
            method: 'GET',
            cache: false,
            url: '/configconversation/load',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        $http(req)
            .then(function success(res) {
                var data = res.data.body;
                angular.forEach(data, function (value, key) {
                    $scope.api_url = value.url_api;
                    $scope.user = value.user;
                    $scope.token = value.token;
                    $scope.workspace = value.workspace_id;
                    $scope.feedback = value.feedback;
                    $scope.emoji = value.emoji;
                    $scope.history = value.history;
                    $scope.evaluationMessage = value.evaluation_message;
                    $scope.endConversationMessage = value.end_conversation_message;
                    $scope.versionDate = value.version_date;
                    $scope.conversationStart = value.conversation_start;
                    $scope.externalToken = value.external_token;
                });
            }, function fail(err) {
                alert(JSON.stringify(err));
                console.log(err);
                $scope.sessionExpired(err);
            }).then(function () {
                if (typeof $scope.conversationStart !== 'undefined' && $scope.conversationStart) {
                    startAtendimento();
                }
            });

    }






    $scope.sendMessage = function () {

        var element = angular.element(document.querySelector('#contentChat'));
        var elementHTML = element.html();
        var inputFeedBack = angular.element(document.querySelector('#filterFeedback'));
        var auxFeedbackHtml = '';
        var message = $scope.txtMessage;

        if (isEmpty(message)) return;

        salvaHistorico(message, 2);

        $scope.txtMessage = '';
        elementHTML += '<div id="person" class="row"> <div class="user"> <i class="fa fa-user-circle-o fa-3x" aria-hidden="true"></i> </div> <div class="userContent">' + mensagemHtml.replace('MSG', message) + '</div><div class="clearfix"></div> <div class="timeChat" style="margin-right: 65px; text-align: right;">' + setDate() + '&nbsp;<i class="fa fa-clock-o" aria-hidden="true"></i></div></div>';
        element.html(elementHTML);
        scrollChat();

        if (message.trim() == '?') return;

        $timeout(function () {
            elementHTML += writing;
            element.html(elementHTML);
            scrollChat();
        }, 350);




        var enviaMensagem = enviaMsg(message, $scope.objectConversation.context);
        $timeout(function () {
            var element = angular.element(document.querySelector('#contentChat'));
            var htmlAux = '';

            enviaMensagem.then(function success(res) {
                if (res.data.status == 'ok') {
                    var data = res.data.object;
                    $scope.conversation_id = data.context.conversation_id;
                    $scope.objectConversation = data;
                    var msg = '';
                    var debugIntencao = addDebugIntent(data.intents);


                    angular.forEach(data.output.text, function (value, key) {
                        msg += '<p>' + value + '<p>';
                    });
                    msg = msg.replace('%ARROBA%', '@');
                    if (msg == '') {
                        // msg = '<p>Decididamente não entendi bem… por favor, poderia refazer a pergunta, mas de outra maneira?</p>';
                        msg = '<p>ERRO! Desculpe, não entendi. Poderia perguntar de outro jeito?</p>';
                    }

                    if ($scope.feedback && data.context.endConversation && data.context.endConversation == 'yes') {
                        auxFeedbackHtml = feedbackHtml;
                        delete $scope.objectConversation.context.endConversation;
                    }

                    var watsonSay = '<div id="bot" class="row"> <figure class="userWatson"> <img src="/images/user_watson.png" alt="Watson"> </figure> <div class="userWatsonContent">' + mensagemHtml.replace('MSG', msg) + '</div><div class="clearfix"></div> <div class="timeChat" style="margin-left: 65px; text-align: left;"><i class="fa fa-clock-o" aria-hidden="true"></i>&nbsp;' + setDate() + '</div>' + debugIntencao + '</div>' + auxFeedbackHtml.replace('XXPPTTOO', $scope.evaluationMessage).replace('CONVERSATIONID', $scope.conversation_id);

                    elementHTML = elementHTML.replace(writing, watsonSay);
                    element.html(elementHTML);

                    $('.eventFeedback').on('click', eventoFeedback);


                    salvaHistorico(msg, 1);
                } else {
                    elementHTML = elementHTML.replace(writing, "");
                    element.html(elementHTML);
                }
            }, function fail(err) {
                alert(JSON.stringify(err));
                console.log(err);
                $scope.sessionExpired(err);
            }).then(function () {
                scrollChat();
            });
        }, 750);
    }
}]);