/// <reference path="../../personality-insight-chart.js" />

app.controller("configGestaoUsuario", ['$scope', '$timeout', '$http', function ($scope, $timeout, $http) {

    $scope.formData = {}
    $scope.operacaoSucesso = false;
    $scope.operacaoFalha = false;
    $scope.ConteudoGridUsuarios = [];
    var elmtDt = $('#listaUsuario');
    var password = document.getElementById("formData.senha_usuario")
    var confirm_password = document.getElementById("formData.confirma_senha_usuario");

    function validatePassword() {
        if (password.value != confirm_password.value) {
            confirm_password.setCustomValidity("Passwords Don't Match");
        } else {
            confirm_password.setCustomValidity('');
        }
    }
    password.onchange = validatePassword;
    confirm_password.onkeyup = validatePassword;




    $("#divPersonality span").click(function () {
        var divName = $(this).data("chart");

        if ($("#" + divName).css("display") == "none") {
            $("#" + divName).css("display", "block");
        }
        else {
            $("#" + divName).css("display", "none");
        }
    });


    function resetForm() {
        $scope.formData.nome_usuario = '';
        $scope.formData.email_usuario = '';
        $scope.formData.nivel_usuario = 0;
        $scope.formData.status_usuario = 0;
    }

    function loadUser() {
        if ($.fn.DataTable.fnIsDataTable(elmtDt)) {
            elmtDt.DataTable().destroy();
            $scope.ConteudoGridUsuarios = [];
        }
        //Realiza a pesquisa de todos os usuarios cadastrados para mostrar na grid
        var req = {
            method: 'GET',
            cache: false,
            url: '/configgestaousuario/load',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        $http(req).then(function success(res) {
            var arrayUsuarios = new Array();

            var data = res.data.body;
            angular.forEach(data, function (value, key) {
                var ativo = (value.active == true ? "Sim" : "Não");
                var nivelPermissao = "";

                switch (value.level) {
                    case 0: nivelPermissao = "Usuário"; break;
                    case 1: nivelPermissao = "Treinador"; break;
                    case 2: nivelPermissao = "Administrador"; break;
                    default: nivelPermissao = "Usuário"; break;
                }

                arrayUsuarios.push({
                    ID: value.id,
                    NomeUsuario: value.name,
                    Usuario: value.email,
                    NivelPermissao: nivelPermissao,
                    Ativo: ativo
                });
            });
            //Insere no escopo as linhas a serem adicionadas no grid
            $scope.ConteudoGridUsuarios = arrayUsuarios;
        }, function fail(err) {
            alert(JSON.stringify(err));
            console.log(err);
        }).then(function () {
            setTimeout(function () {
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
                        'csv', 'pdf'
                    ]
                });
            }, 150);
        });
    }


    $scope.load = function () {
        resetForm();
        loadUser();
    }

    $scope.formSubmit = function () {
        $http({
            method: 'POST',
            url: '/configgestaousuario/save',
            data: $scope.formData,
            headers: { 'Content-Type': 'application/json' }
        }).then(function (success) {
            $scope.operacaoSucesso = true;
        }, function (err) {
            alert(JSON.stringify(err));
            console.log(err);
            $scope.operacaoFalha = true;
        }).then(function () {
            $timeout(function () {
                loadUser();
            }, 150);
        });
    }

    $scope.apagarUsuario = function (id) {
        var req = {
            method: 'GET',
            cache: false,
            url: '/configgestaousuario/delete?userId=' + id,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        $http(req).then(function success(res) {
            $timeout(function () {
                loadUser();
            }, 150);
        }, function fail(err) {
            alert(JSON.stringify(err));
            console.log(err);
        });
    };

    $scope.carregarUsuario = function () {
        loadUser();
    };

    $scope.exibirInsight = function (username) {

        //Esconde todas as divs da modal de gráficos
        $("#divGraph").css("display", "none");
        $("#divMessageNotFound").css("display", "none");
        $("#divLoading").css("display", "block");

        var myChartPersonality = document.getElementById("myChartPersonality").getContext('2d');
        var myChartAgreeableness = document.getElementById("myChartAgreeableness").getContext('2d');
        var myChartConscientiousness = document.getElementById("myChartConscientiousness").getContext('2d');
        var myChartOpenness = document.getElementById("myChartOpenness").getContext('2d');
        var myChartIntroversionExtraversion = document.getElementById("myChartIntroversionExtraversion").getContext('2d');
        var myChartEmotional = document.getElementById("myChartEmotional").getContext('2d');
        var myChartConsumerNeeds = document.getElementById("myChartConsumerNeeds").getContext('2d');
        var myChartValues = document.getElementById("myChartValues").getContext('2d');

        //Limpa todos os canvas, para que informações anteriores de outros registros não sejam
        //exibidos desnecessariamente
        myChartPersonality.clearRect(0, 0, 0, 0);
        myChartAgreeableness.clearRect(0, 0, 0, 0);
        myChartConscientiousness.clearRect(0, 0, 0, 0);
        myChartOpenness.clearRect(0, 0, 0, 0);
        myChartIntroversionExtraversion.clearRect(0, 0, 0, 0);
        myChartEmotional.clearRect(0, 0, 0, 0);
        myChartConsumerNeeds.clearRect(0, 0, 0, 0);
        myChartValues.clearRect(0, 0, 0, 0);

        var req = {
            method: 'POST',
            url: '/configPersonalityInsights/getInsight',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                username: username
            }
        };

        //Realiza a chamada a API para analisar a personalidade do usuário
        var personalityInsight = $http(req);
        personalityInsight.then(function (response) {
            if (response.data.body == undefined || response.data.body == null) {
                return;
            }

            if (response.data.body.status != undefined && response.data.body.status != null) {
                alert(response.data.body.message);
                return;
            }

            var contextPersonality = new Array();
            contextPersonality.push({ canvas: myChartPersonality, type: "Personality" });
            contextPersonality.push({ canvas: myChartAgreeableness, type: "big5_agreeableness" });
            contextPersonality.push({ canvas: myChartConscientiousness, type: "big5_conscientiousness" });
            contextPersonality.push({ canvas: myChartOpenness, type: "big5_openness" });
            contextPersonality.push({ canvas: myChartIntroversionExtraversion, type: "big5_extraversion" });
            contextPersonality.push({ canvas: myChartEmotional, type: "big5_neuroticism" });

            //Chama a função que realizará o desenho dos gráficos
            var personalityChart = new PersonalityInsightChart();
            personalityChart.drawPersonalityChart(contextPersonality, response.data.body);
            personalityChart.drawConsumerNeedsChart(myChartConsumerNeeds, response.data.body);
            personalityChart.drawValuesChart(myChartValues, response.data.body);

            //Mostra a div que contém os gráficos
            $("#divGraph").css("display", "block");
            $("#divLoading").css("display", "none");
        }, function (err) {
            //Exibe a grid contendo a informação que não existe dados
            $("#divMessageNotFound").css("display", "block");
            $("#divLoading").css("display", "none");

            if (err.data.status != "not found") {
                alert(err.data.message);
            }

            console.log(err);
        });
    };

}]);    