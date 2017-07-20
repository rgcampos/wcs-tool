app.controller("relMetricas", ['$scope', '$timeout', '$http', function ($scope, $timeout, $http) {

    var metricas = {};
    $scope.mostraLoader = true;
    $scope.totalChamadasAPI = '';

    function entidadeUsada() {
        var entidades = metricas.arrayEntidades;
        var auxEntidade = Object.keys(entidades);
        var auxValor = Object.values(entidades);


        var ctx = document.getElementById('entidadesMaisUsadas').getContext('2d');
        var feedbackPieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: auxValor,
                    backgroundColor: [
                        window.chartColors.red,
                        window.chartColors.yellow,
                        window.chartColors.blue,
                        window.chartColors.orange,
                        window.chartColors.purple
                    ],
                    label: '5 Entidades + usadas'
                }],
                labels: auxEntidade
            },
            options: {
                responsive: true,
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: '5 Entidades + usadas'
                }
            }
        });
    }

    function intencoeUsada() {
        var intencoes = metricas.arrayItencoes;
        var auxIntecao = Object.keys(intencoes);
        var auxValor = Object.values(intencoes);


        var ctx = document.getElementById('intencoesMaisUsadas').getContext('2d');
        var feedbackPieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: auxValor,
                    backgroundColor: [
                        window.chartColors.red,
                        window.chartColors.yellow,
                        window.chartColors.blue,
                        window.chartColors.orange,
                        window.chartColors.purple
                    ],
                    label: '5 Intenções + usadas'
                }],
                labels: auxIntecao
            },
            options: {
                responsive: true,
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: '5 Intenções + usadas'
                }
            }
        });
    }

    function browserUsado() {
        var arrBrowsers = metricas.totalChamadasPorBrowser;
        var auxArrBrowser = [];
        var auxArrValue = [];
        var auxArrCor = [];
        var keyCor = Object.keys(window.chartColors);
        var len = arrBrowsers.length > 5 ? 5 : arrBrowsers.length;
        for (var i = 0; i < len; i++) {
            var el = arrBrowsers[i];
            auxArrBrowser.push(el.browser);
            auxArrValue.push(el.total);
            auxArrCor.push(window.chartColors[keyCor[i]]);
        }

        var ctx = document.getElementById('browsersMaisUsadas').getContext('2d');
        var feedbackPieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: auxArrValue,
                    backgroundColor: auxArrCor,
                    label: '5 Browsers + usados'
                }],
                labels: auxArrBrowser
            },
            options: {
                responsive: true,
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: '5 Browsers + usados'
                }
            }
        });
    }

    function feedbackPie() {
        var ctx = document.getElementById('feedackPizza').getContext('2d');
        var feedbackPieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [metricas.semFeedbackConversation, metricas.comFeedbackConversationNegativo, metricas.comFeedbackConversationPositivo],
                    backgroundColor: [
                        window.chartColors.yellow,
                        window.chartColors.red,
                        window.chartColors.blue
                    ],
                    label: 'Feedback Geral'
                }],
                labels: [
                    'Feedback Nulo',
                    'Feedback Negativo',
                    'Feedback Positivo'
                ]
            },
            options: {
                responsive: true,
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Feedback Geral'
                }
            }
        });
    }

    function feedbackBar() {
        var feedbackDia = metricas.totalFeedbackPorDia;
        var aux = [];
        for (var i = 0; i < feedbackDia.length; i++) {
            var el = feedbackDia[i];
            aux.push({ data: new Date(el._id.year, el._id.month, el._id.day, 0, 0, 0, 0), total: el.count, positivo: el._id.success });
        }

        var sortedAux = orderByDate(aux, "data");
        aux = [];
        var arrDatas = [];
        sortedAux.forEach(function (el) {
            var dt = el.data.getUTCDate() + "/" + el.data.getUTCMonth() + "/" + el.data.getUTCFullYear();
            if(arrDatas.indexOf(dt) === -1)
                arrDatas.push(dt);
        });

        var arrPositivo = arrDatas.map(function(e) {return 0});
        var arrNegativo = arrDatas.map(function(e) {return 0});
        
        sortedAux.forEach(function (el) {
            var dt = el.data.getUTCDate() + "/" + el.data.getUTCMonth() + "/" + el.data.getUTCFullYear();
            var idx = arrDatas.indexOf(dt);
            if(el.positivo)
                arrPositivo[idx] = el.total
            else
                arrNegativo[idx] = el.total
        });

        var color = Chart.helpers.color;
        var ctx = document.getElementById('feedbackBarra').getContext('2d');
        var feedbackPieChart = new Chart(ctx, {
            type: 'bar',
            data: {
                datasets: [{
                    label: 'Feedback Negativo',
                    backgroundColor: color(window.chartColors.red).alpha(0.5).rgbString(),
                    borderColor: window.chartColors.red,
                    borderWidth: 1,
                    data: arrNegativo
                }, {
                    label: 'Feedback Positivo',
                    backgroundColor: color(window.chartColors.blue).alpha(0.5).rgbString(),
                    borderColor: window.chartColors.blue,
                    borderWidth: 1,
                    data: arrPositivo
                }],
                labels: arrDatas
            },
            options: {
                tooltips: {
                    mode: 'index',
                    callbacks: {
                        // Use the footer callback to display the sum of the items showing in the tooltip
                        footer: function(tooltipItems, data) {
                            var sum = 0;
                            console.log(data);
                            console.log("tooltipItems",tooltipItems);

                            tooltipItems.forEach(function(tooltipItem) {
                                sum += data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                            });
                            console.log(sum);
                            console.log(tooltipItems[1].yLabel);
                            
                            return 'Positivo: ' + (tooltipItems[1].yLabel/sum*100).toFixed(0) + '%';
                        },
                    },
                    footerFontStyle: 'normal'
                },
                responsive: true,
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Ultimos 10 dias corridos'
                }
            }
        });
    }

    function chamadaAPIBar() {
        var chamadaAPIDia = metricas.totalChamadasAPIPorDia;
        var aux = [];
        for (var i = 0; i < chamadaAPIDia.length; i++) {
            var el = chamadaAPIDia[i];
            aux.push({ data: new Date(el._id.year, el._id.month, el._id.day, 0, 0, 0, 0), total: el.count });
        }

        var sortedAux = orderByDate(aux, "data");
        aux = [];
        var arrDatas = [];
        var arrResultado = [];
        for (var i = 0; i < sortedAux.length; i++) {
            var el = sortedAux[i];
            arrResultado.push(el.total);
            arrDatas.push(el.data.getUTCDate() + "/" + el.data.getUTCMonth() + "/" + el.data.getUTCFullYear());
        }

        var color = Chart.helpers.color;
        var ctx = document.getElementById('chamadaAPIBarra').getContext('2d');
        var feedbackPieChart = new Chart(ctx, {
            type: 'bar',
            data: {
                datasets: [{
                    label: 'Chamadas',
                    backgroundColor: color(window.chartColors.red).alpha(0.5).rgbString(),
                    borderColor: window.chartColors.red,
                    borderWidth: 1,
                    data: arrResultado
                }],
                labels: arrDatas
            },
            options: {
                responsive: true,
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Ultimos 10 dias corridos'
                }
            }
        });
    }

function load() {
    $scope.mostraLoader = true;
    var ok = false;
    $http({
        method: 'GET',
        cache: false,
        url: '/metrica/load',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(function success(res) {
            var obj = res.data;
            if (obj.status == 'ok') {
                metricas = obj.result;
                ok = true;
                // console.log(metricas);
            }
        }, function fail(err) {
            alert(JSON.stringify(err));
            console.log(err);
            $scope.sessionExpired(err);
        }).then(function () {
            $scope.totalChamadasAPI = '';
            if (ok) {
                feedbackPie();
                feedbackBar();
                chamadaAPIBar();
                $scope.totalChamadasAPI = metricas.totalChamadasAPI;
                entidadeUsada();
                intencoeUsada();
                browserUsado();
            }
        }).then(function () {
            $scope.mostraLoader = false;
        });

}





$scope.load = load();


}]);