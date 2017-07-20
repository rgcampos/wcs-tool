/* global Chart */

'use strict';

window.chartColors = {
	black: 'rgb(0, 0, 0)',
	blue: 'rgb(54, 162, 235)',
	coral: 'rgb(255, 127, 80)',
	darkGoldenrod: 'rgb(184, 134 ,11)',
	darkSlateGray: 'rgb(47, 79, 79)',
	deepSkyBlue: 'rgb(0, 191, 255)',
	forestGreen: 'rgb(34, 139, 34)',
	gold: 'rgb(255, 215, 0)',
	green: 'rgb(75, 192, 192)',
	grey: 'rgb(201, 203, 207)',
	indigo: 'rgb(75, 0, 130)',
	khaki: 'rgb(240, 230, 140)',
	magenta: 'rgb(255, 0, 255)',
	maroon: 'rgb(128, 0, 0)',
	navy: 'rgb(0, 0, 128)',
	olive: 'rgb(128, 128, 0)',
	orange: 'rgb(255, 159, 64)',
	orangeRed: 'rgb(255, 69, 0)',
	purple: 'rgb(153, 102, 255)',
	red: 'rgb(255, 99, 132)',
	rosyBrown: 'rgb(188, 143, 143)',
	salmon: 'rgb(250, 128, 114)',
	seaGreen: 'rgb(46, 139, 87)',
	yellow: 'rgb(255, 205, 86)',
	yellowGreen: 'rgb(154, 205, 50)'
};

window.randomScalingFactor = function () {
	return (Math.random() > 0.5 ? 1.0 : -1.0) * Math.round(Math.random() * 100);
};

(function (global) {
	var Months = [
		'Janeiro',
		'Favereiro',
		'Março',
		'Abril',
		'Maio',
		'Junho',
		'Julho',
		'Agosto',
		'Setembro',
		'Outubro',
		'Novembro',
		'Dezembro'
	];

	var Samples = global.Samples || (global.Samples = {});
	Samples.utils = {
		// Adapted from http://indiegamr.com/generate-repeatable-random-numbers-in-js/
		srand: function (seed) {
			this._seed = seed;
		},

		rand: function (min, max) {
			var seed = this._seed;
			min = min === undefined ? 0 : min;
			max = max === undefined ? 1 : max;
			this._seed = (seed * 9301 + 49297) % 233280;
			return min + (this._seed / 233280) * (max - min);
		},

		numbers: function (config) {
			var cfg = config || {};
			var min = cfg.min || 0;
			var max = cfg.max || 1;
			var from = cfg.from || [];
			var count = cfg.count || 8;
			var decimals = cfg.decimals || 8;
			var continuity = cfg.continuity || 1;
			var dfactor = Math.pow(10, decimals) || 0;
			var data = [];
			var i, value;

			for (i = 0; i < count; ++i) {
				value = (from[i] || 0) + this.rand(min, max);
				if (this.rand() <= continuity) {
					data.push(Math.round(dfactor * value) / dfactor);
				} else {
					data.push(null);
				}
			}

			return data;
		},

		labels: function (config) {
			var cfg = config || {};
			var min = cfg.min || 0;
			var max = cfg.max || 100;
			var count = cfg.count || 8;
			var step = (max - min) / count;
			var decimals = cfg.decimals || 8;
			var dfactor = Math.pow(10, decimals) || 0;
			var prefix = cfg.prefix || '';
			var values = [];
			var i;

			for (i = min; i < max; i += step) {
				values.push(prefix + Math.round(dfactor * i) / dfactor);
			}

			return values;
		},

		months: function (config) {
			var cfg = config || {};
			var count = cfg.count || 12;
			var section = cfg.section;
			var values = [];
			var i, value;

			for (i = 0; i < count; ++i) {
				value = Months[Math.ceil(i) % 12];
				values.push(value.substring(0, section));
			}

			return values;
		},

		transparentize: function (color, opacity) {
			var alpha = opacity === undefined ? 0.5 : 1 - opacity;
			return Chart.helpers.color(color).alpha(alpha).rgbString();
		},

		merge: Chart.helpers.configMerge
	};

	Samples.utils.srand(Date.now());

}(this));

