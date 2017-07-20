app.controller("feedback", ['$scope', '$timeout', '$http', '$filter', '$compile', function ($scope, $timeout, $http, $filter, $compile) {

    $scope.dadosFeedback = [];
    $scope.mostraLoader = false;
    $scope.formData = {};

    var idReviewed = '';
    var elmtDt = $('#tableFeedback');

    function comboGenerate(arr, idForm, exemplo) {
        var combo = '';
        var length = 0;
        if (arr.length <= 0) return combo;
        if (arr[0].confidence > 0.85) return combo;
        length = arr.length;
        if (length >= 3) length = 3;

        combo += '<form name="form_' + idForm + '" id="form_' + idForm + '" method="POST" class="formClick" ng-submit="formExemploSubmit($event, ' + idForm + ')">';
        combo += '<div class="col-xs-3 col-sm-4 col-md-4">';
        combo += '<input type="hidden" name="example_' + idForm + '" id="example_' + idForm + '" value="' + exemplo + '">';
        combo += '<select class="form-control" id="intent_' + idForm + '" name="intent_' + idForm + '">';
        for (var i = 0; i < length; i++) {
            combo += '<option value="' + arr[i].intent + '">#' + arr[i].intent + '</option>';
        }
        combo += '</select>';
        combo += '</div>';
        combo += '<div class="col-xs-3 col-sm-4 col-md-4">';
        combo += '<button class="btn btn-primary btn-block" type="submit" id="btnAddExemplo_' + idForm + '" name="btnAddExemplo_' + idForm + '">Adicionar Exemplo</button>';
        combo += '</div>';
        combo += '</form>';
        return combo;
    }

    $scope.formExemploSubmit = function (obj, idForm) {
        var obj = {
            intent: $('#intent_' + idForm).val(),
            nameInputIntent: 'intent_' + idForm,
            example: $('#example_' + idForm).val(),
            nameInputExample: 'example_' + idForm
        }

        if (obj.intent.trim() != '' && obj.example.trim() != '') {
            var btn = $('#btnAddExemplo_' + idForm);
            btn.addClass('disabled');
            btn.off('click');
            $http({
                method: 'POST',
                url: '/intent/saveExample',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: obj
            })
                .then(function (success) {
                }, function (err) {
                    $scope.sessionExpired(err);
                });
        }
    }

    function setInputDate() {
        var hoy = new Date(),
            d = hoy.getDate(),
            m = hoy.getMonth(),
            y = hoy.getFullYear();
        $scope.startDate = new Date(y, m, d);
        $scope.endDate = new Date(y, m, d);
    };

    function atualizaRevisao(idFeedback) {
        var req = {
            method: 'POST',
            url: '/feedback/updateReview',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                id: idFeedback
            }
        };
        return $http(req);
    }

    $scope.load = function () {
        $scope.mostraLoader = true;
        setInputDate();
        $scope.mostraLoader = false;
    }

    $scope.formSubmit = function () {
        $scope.mostraLoader = true;
        var objBusca = {};

        if (typeof $scope.formData.conversation_id != 'undefined' && $scope.formData.conversation_id) {
            objBusca.conversation_id = $scope.formData.conversation_id;
        }

        if (typeof $scope.formData.username != 'undefined' && $scope.formData.username) {
            objBusca.username = $scope.formData.username;
        }

        if (typeof $scope.formData.success != 'undefined' && $scope.formData.success) {
            objBusca.success = $scope.formData.success == "0" ? false : true;
        }

        if (typeof $scope.formData.reviewed != 'undefined' && $scope.formData.reviewed) {
            objBusca.reviewed = $scope.formData.reviewed == "0" ? false : true;
        }

        if (typeof $scope.formData.startDate != 'undefined' && typeof $scope.formData.endDate != 'undefined') {
            if ($scope.formData.startDate && $scope.formData.endDate) {
                var d1 = new Date($scope.formData.startDate);
                d1.setUTCHours(0, 0, 0, 0);
                var d2 = new Date($scope.formData.endDate);
                d2.setUTCHours(23, 59, 59, 0);

                objBusca.createdAt = {
                    '>=': d1,
                    '<=': d2
                }
            } else if ($scope.formData.startDate) {
                var d1 = new Date($scope.formData.startDate);
                d1.setUTCHours(0, 0, 0, 0);

                objBusca.createdAt = {
                    '>=': d1
                }
            } else if ($scope.formData.endDate) {
                var d2 = new Date($scope.formData.endDate);
                d2.setUTCHours(23, 59, 59, 0);

                objBusca.createdAt = {
                    '<=': d2
                }
            }
        }

        if ($.fn.DataTable.fnIsDataTable(elmtDt)) {
            elmtDt.DataTable().destroy();
            $scope.dadosFeedback = [];
        }

        var req = {
            method: 'POST',
            url: '/feedback/search',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                busca: objBusca
            }
        };

        $http(req)
            .then(function (success) {
                var dados = success.data;
                $scope.dadosFeedback = dados.object;
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
                            [15, 30, 50, -1],
                            [15, 30, 50, "All"]
                        ],
                        pageLength: 15,
                        destroy: true,
                        dom: 'Bfrtip',
                        buttons: [
                            'copy', 'csv', 'pdf', 'print'
                        ]
                    });
                }, 250);
            });


    }


    $scope.flagReviewed = function () {
        atualizaRevisao(idReviewed)
            .then(function (success) {
                $('#' + idReviewed).html('Sim');
            }, function (err) {
                $('#' + idReviewed).html('Não');
                $scope.sessionExpired(err);
            })
            .then(function () {
                idReviewed = '';
            });
    }


    $scope.abrirModalFeedback = function (workspaceId, conversationId, id, event) {
        idReviewed = id;
        var req = {
            method: 'GET',
            cache: false,
            url: '/historico/find?conversationId=' + conversationId + '&workspaceId=' + workspaceId,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        $http(req)
            .then(function (success) {
                var dados = success.data;
                if (dados.status == 'ok') {
                    $scope.mworkspace = workspaceId;
                    $scope.mconversation = conversationId;

                    var template = '<tr class="CLASSLINE"><td class="text-left modalHistoricoAgente">USER</td><td>TEXT INTENCAO</td></tr>';
                    var htmlDialogo = '';
                    var intencoes = '';
                    var countForm = 0;

                    for (var i = 0; i < dados.body.length; i++) {
                        countForm++;
                        intencoes = '';
                        var item = dados.body[i];

                        if (item.typeAgent == 1) {
                            angular.forEach(item.intents, function (v, c) {
                                if (c <= 2) {
                                    var confidencia = (v.confidence * 100).toFixed(2);
                                    intencoes += '&nbsp;#' + v.intent + ':&nbsp;' + confidencia + '%&nbsp;';
                                }
                            });
                            intencoes = intencoes.trim() == '' ? '' : '<span class="intent"><img src="/images/intention.png" height="10" alt="Intenções">&nbsp;' + intencoes.trim() + '</span>';

                            htmlDialogo += template
                                .replace('USER', 'Watson')
                                .replace('TEXT', item.text.trim())
                                .replace('CLASSLINE', 'modalHistoricoLinhaAtendente')
                                .replace('INTENCAO', intencoes);
                        } else {
                            if ((i + 1) < dados.body.length) {
                                var nextItem = dados.body[i + 1];
                                intencoes = comboGenerate(nextItem.intents, countForm, item.text.trim());
                                intencoes = intencoes.trim() == '' ? '' : '<span class="addIntent">' + intencoes + '</span>';
                            }
                            htmlDialogo += template
                                .replace('USER', item.username)
                                .replace('TEXT', item.text.trim())
                                .replace('CLASSLINE', 'modalHistoricoLinhaUsuario')
                                .replace('INTENCAO', intencoes);
                        }
                    }

                    angular.element(document.querySelector('#conteudoDialogoModal')).html(htmlDialogo);
                    $compile($('#modalFeedback'))($scope);


                }
            }, function (err) {
                alert(JSON.stringify(err));
                console.log(err);
                angular.element(document.querySelector('#conteudoDialogoModal')).html('');
                $scope.sessionExpired(err);
            })
            .then(function () {
                $timeout(function () {
                    var elmt = angular.element(document.querySelector('#conteudoModalConversa'));
                    elmt.mCustomScrollbar({
                        setHeight: 550,
                        theme: "inset-2-dark"
                    });
                    elmt.mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
                        scrollInertia: 10,
                        timeout: 0
                    });
                }, 250);
            });

    }

}]);