/// <reference path="../../node_modules/chart.js/src/chart.js" />

function RelUtilizacaoSatisfacao() { }

RelUtilizacaoSatisfacao.prototype.drawFeedbackChart = function (element, values) {
    // var data = {
    //     labels: [
    //         "Red",
    //         "Blue"
    //     ],
    //     datasets: [
    //         {
    //             data: [300, 50, 100],
    //             backgroundColor: [
    //                 "#FF6384",
    //                 "#36A2EB"
    //             ],
    //             hoverBackgroundColor: [
    //                 "#FF6384",
    //                 "#36A2EB"
    //             ]
    //         }]
    // };
    var data = {
        labels: [
            "Negativo",
            "Positivo"
        ],
        datasets: [
            {
                data: [values.feedback.negativo, values.feedback.positivo],
                backgroundColor: [
                    "#FF6384",
                    "#36A2EB"
                ],
                hoverBackgroundColor: [
                    "#FF6384",
                    "#36A2EB"
                ]
            }]
    };
    var myPieChart = new Chart(element, {
        type: 'pie',
        data: data,
        height: 300,
        options: {
            responsive: true
        }
    });
};


RelUtilizacaoSatisfacao.prototype.drawHistoryChart = function (element, values) {
    var myChart = new Chart(element, {
        type: 'bar',
        data: {
            labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
            datasets: [{
                label: '# of Votes',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
};