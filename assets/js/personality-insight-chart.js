/// <reference path="../../node_modules/chart.js/src/chart.js" />

PersonalityInsightChart = (function() 
{ 
    function PersonalityInsightChart() { }

    //Função irá desenhar os gráficos no canvas informado e gravando os dados
    //fornecidos pelo Watson
    //Parâmetros:
    //          canvas - Elemento html onde será inserido o gráfico
    //          data - Dado tratado pela função getInformation
    PersonalityInsightChart.prototype.drawChart = function(canvas, data)
    {
        var mychar = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: '%',
                    data: data.datasets,
                    backgroundColor: data.backgroundColor,
                    borderColor: data.borderColor,
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

    //Função realizará o tratamento dos dados fornecidos pelo Watson
    //Parâmetros:
    //          data - Dados fornecidos pela API do Watson
    PersonalityInsightChart.prototype.getInformation = function(data)
    {
        var finalObj = {
            labels: new Array(),
            datasets: new Array(),
            backgroundColor: new Array(),
            borderColor: new Array()
        };

        //Loop para obter o nome de todas as características
        //retornadas pelo Watson e que deve compor o gráfico
        for (var i = 0; i < data.length; i++)
        {
            var valor = data.find(function (element) { return element.name == data[i].name; }).percentile * 100

            finalObj.labels.push(data[i].name);
            finalObj.datasets.push(valor);
            finalObj.backgroundColor.push("rgba(54, 162, 235, 0.5)");
            finalObj.borderColor.push("rgba(54, 162, 235, 1)");
        }

        return finalObj;
    };

    PersonalityInsightChart.prototype.drawOpenness = function (arrayElement, data)
    {
        var canvas = arrayElement.find(function(element)
        {
            return (element.type == "big5_openness");
        }).canvas;

        if (canvas == null || canvas == undefined)
        {
            return;
        }

        var dataOpenness = this.getInformation(data.children);
        this.drawChart(canvas, dataOpenness);
    };

    PersonalityInsightChart.prototype.drawConscientiousness = function (arrayElement, data)
    {
        var canvas = arrayElement.find(function(element)
        {
            return (element.type == "big5_conscientiousness");
        }).canvas;

        if (canvas == null || canvas == undefined)
        {
            return;
        }

        var dataConscientiousness = this.getInformation(data.children);
        this.drawChart(canvas, dataConscientiousness);
    };

    PersonalityInsightChart.prototype.drawExtraversion = function (arrayElement, data)
    {
        var canvas = arrayElement.find(function(element)
        {
            return (element.type == "big5_extraversion");
        }).canvas;

        if (canvas == null || canvas == undefined)
        {
            return;
        }

        var dataExtraversion = this.getInformation(data.children);
        this.drawChart(canvas, dataExtraversion);
    };

    PersonalityInsightChart.prototype.drawAgreeableness = function (arrayElement, data)
    {
        var canvas = arrayElement.find(function(element)
        {
            return (element.type == "big5_agreeableness");
        }).canvas;

        if (canvas == null || canvas == undefined)
        {
            return;
        }

        var dataAgreeableness = this.getInformation(data.children);
        this.drawChart(canvas, dataAgreeableness);
    };

    PersonalityInsightChart.prototype.drawNeuroticism = function (arrayElement, data)
    {
        var canvas = arrayElement.find(function(element)
        {
            return (element.type == "big5_neuroticism");
        }).canvas;

        if (canvas == null || canvas == undefined)
        {
            return;
        }

        var dataNeuroticism = this.getInformation(data.children);
        this.drawChart(canvas, dataNeuroticism);
    };

    //Função responsável por desejar o gráfico com informações sobre a personalidade do usuário
    //Parâmetros:
    //          arrayElement - Array de componentes canvas no HTML que receberão os gráficos
    //          data - Conteúdo a ser inserido no gráfico final
    PersonalityInsightChart.prototype.drawPersonalityChart = function (arrayElement, data) 
    {
        var canvasPersonality = arrayElement.find(function(element)
        {
            return (element.type == "Personality");
        }).canvas;

        if (canvasPersonality == null || canvasPersonality == undefined)
        {
            return;
        }

        var dataPersonality = this.getInformation(data.personality);
        this.drawChart(canvasPersonality, dataPersonality);
        
        //Loop para montar os gráficos dos filhos da característica de personalidade
        for (var i = 0; i < data.personality.length; i++) 
        {
            if (data.personality[i].trait_id == "big5_openness")
            {
                this.drawOpenness(arrayElement, data.personality[i]);
            }
            else if (data.personality[i].trait_id == "big5_conscientiousness")
            {
                this.drawConscientiousness(arrayElement, data.personality[i]);
            }
            else if (data.personality[i].trait_id == "big5_extraversion")
            {
                this.drawExtraversion(arrayElement, data.personality[i]);
            }
            else if (data.personality[i].trait_id == "big5_agreeableness")
            {
                this.drawAgreeableness(arrayElement, data.personality[i]);
            }
            else if (data.personality[i].trait_id == "big5_neuroticism")
            {
                this.drawNeuroticism(arrayElement, data.personality[i]);
            }
        }
    };

    //Função responsável por desejar o gráfico de necessidades de consumo do usuário
    //Parâmetros:
    //          canvas - Componente canvas no HTML que receberá o gráfico
    //          data - Conteúdo a ser inserido no gráfico final
    PersonalityInsightChart.prototype.drawConsumerNeedsChart = function (canvas, data) 
    {
        var dataNeeds = this.getInformation(data.needs);
        this.drawChart(canvas, dataNeeds);
    };

    //Função responsável por desejar o gráfico de valores do usuário
    //Parâmetros:
    //          canvas - Componente canvas no HTML que receberá o gráfico
    //          data - Conteúdo a ser inserido no gráfico final
    PersonalityInsightChart.prototype.drawValuesChart = function (canvas, data) 
    {
        var dataValues = this.getInformation(data.values);
        this.drawChart(canvas, dataValues);
    };

    return PersonalityInsightChart;
})();