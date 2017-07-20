app.controller("chat", ['$scope', '$timeout', '$http', function ($scope, $timeout, $http) {

	// var feedbackHtml = '<div id="bot" class="row"> <figure class="userWatson"> <img src="images/user_watson.png" alt="Watson"> </figure> <div class="userWatsonContent"><p style="text-align:justify;margin: 5px;">XXPPTTOO</p></div> <div class="clearfix"></div> <div class="feedback"> <button type="button" id="like" class="btn btn-sm btn-success eventFeedback"><i class="fa fa-thumbs-o-up" aria-hidden="true"></i>&nbsp;Positivo</button> <button type="button" id="unlike" class="btn btn-sm btn-warning eventFeedback"><i class="fa fa-thumbs-o-down" aria-hidden="true"></i>&nbsp;Negativo</button> <a type="button" id="opinion" class="btn btn-sm btn-info" href="https://docs.google.com/a/whirlpool.com/forms/d/e/1FAIpQLSdFlNSaCizmMqM81li4coXXQywXp4tJ7b9b-Whh1H-b3GmEHg/viewform?entry.1992724082=CONVERSATIONID" value="whirlpool" target="_blank"><i class="fa fa-pencil-square-o" aria-hidden="true"></i>&nbsp;Dê sua opinião!</a> </div> </div>';
	var feedbackHtml = '<div id="bot" class="row"> <figure class="userWatson"> <img src="images/user_watson.png" alt="Watson"> </figure> <div class="userWatsonContent"><p style="text-align:justify;margin: 5px;">XXPPTTOO</p></div> <div class="clearfix"></div> <div class="perguntaFeedback"> <button type="button" id="like" class="btn btn-sm btn-success eventFeedback"><i class="fa fa-thumbs-o-up" aria-hidden="true"></i>&nbsp;Positivo</button> <button type="button" id="unlike" class="btn btn-sm btn-warning eventFeedback"><i class="fa fa-thumbs-o-down" aria-hidden="true"></i>&nbsp;Negativo</button> </div> </div>';
	var writing = '<div id="bot" class="row"> <figure class="userWatson"> <img src="images/user_watson.png" alt="Watson"> </figure> <div class="userWatsonTyping"> <img src="images/typing.gif" alt="Digitando"> </div> </div>';
	var mensagemHtml = '<p style="text-align:justify;margin: 5px;">MSG</p>';

	$scope.objectConversation = {};
	$scope.waitFeedback = false;
	$scope.placeholder = 'Digite seu texto...';


	function adicionaBalao(msg, feedbackHtml, tipo) {
		var element = angular.element(document.querySelector('#contentChat'));
		var elementHTML = element.html();
		var timeoutValue = 500;
		if (tipo == 1) {
			var content = '';
			if (msg != null) {
				content = '<div id="bot" class="row"> <figure class="userWatson"> <img src="images/user_watson.png" alt="Watson"> </figure> <div class="userWatsonContent">' + mensagemHtml.replace('MSG', msg) + '</div><div class="clearfix"></div> <div class="timeChat" style="margin-left: 65px; text-align: left;"><i class="fa fa-clock-o" aria-hidden="true"></i>&nbsp;' + setDate() + '</div></div>';
			} else {
				content = feedbackHtml.replace('XXPPTTOO', $scope.evaluationMessage).replace('CONVERSATIONID', $scope.conversation_id);
			}
			$timeout(function () {
				elementHTML += writing;
				element.html(elementHTML);
				scrollChat();
			}, timeoutValue);

			$timeout(function () {
				elementHTML = elementHTML.replace(writing, content);
				element.html(elementHTML);
				scrollChat();
			}, (timeoutValue += 1500 + (content.length * 2.75))).then(function () {
				$('.eventFeedback').on('click', eventoFeedback);
			});

		} else {
			elementHTML += '<div id="person" class="row"> <figure class="user"> <img src="images/icone_usuario.png" alt="User"> </figure> <div class="userContent">' + mensagemHtml.replace('MSG', msg) + '</div><div class="clearfix"></div> <div class="timeChat" style="margin-right: 65px; text-align: right;">' + setDate() + '&nbsp;<i class="fa fa-clock-o" aria-hidden="true"></i></div></div>';
			element.html(elementHTML);
			scrollChat();
		}
		return timeoutValue;
	}

	function resetVariaveis() {
		$scope.waitFeedback = false;
		$scope.placeholder = 'Digite seu texto...';
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
								htmlAux += '<div id="bot" class="row"> <figure class="userWatson"> <img src="images/user_watson.png" alt="Watson"> </figure> <div class="userWatsonContent">' + mensagemHtml.replace('MSG', data.output.text[0].trim()) + '</div><div class="clearfix"></div> <div class="timeChat" style="margin-left: 65px; text-align: left;"><i class="fa fa-clock-o" aria-hidden="true"></i>&nbsp;' + setDate() + '</div></div>';
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


	function endAtendimento(msgChamado) {
		var iniciaBot = enviaMsg('primeira chamada', {});
		$timeout(function () {
			var element = angular.element(document.querySelector('#contentChat'));
			var htmlAux = element.html();

			iniciaBot.then(function success(res) {
				if (res.data.status == 'ok') {
					var data = res.data.object;
					$scope.conversation_id = data.context.conversation_id;
					$scope.objectConversation = data;
					if (msgChamado == '') {
						htmlAux += '<div id="bot" class="row"> <figure class="userWatson"> <img src="images/user_watson.png" alt="Watson"> </figure> <div class="userWatsonContent">' + mensagemHtml.replace('MSG', $scope.endConversationMessage) + '</div><div class="clearfix"></div> <div class="timeChat" style="margin-left: 65px; text-align: left;"><i class="fa fa-clock-o" aria-hidden="true"></i>&nbsp;' + setDate() + '</div></div>';
					} else {
						htmlAux += '<div id="bot" class="row"> <figure class="userWatson"> <img src="images/user_watson.png" alt="Watson"> </figure> <div class="userWatsonContent">' + mensagemHtml.replace('MSG', msgChamado) + '</div><div class="clearfix"></div> <div class="timeChat" style="margin-left: 65px; text-align: left;"><i class="fa fa-clock-o" aria-hidden="true"></i>&nbsp;' + setDate() + '</div></div>';
					}
					element.html(htmlAux);
					$scope.waitFeedback = false;
					$scope.placeholder = 'Digite seu texto...';
					$('#txtMessage').focus();
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
				endAtendimento('');
			}, function (err) {
				alert(JSON.stringify(err));
				console.log(err);
				$scope.sessionExpired(err);
			});
	}


	function salvaHistorico(texto, tipo) {
		if ($scope.history && texto.trim() != '') {
			$http({
				method: 'POST',
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
					intents: tipo == 1 ? $scope.objectConversation.intents : [],
					entities: tipo == 1 ? $scope.objectConversation.entities : [],
					info: {
						browser: navigator.browserSpecs
					}
				}
			});
		}
	}


	function enviaMsg(mensagem, contexto) {
		if (mensagem == null || mensagem.trim() != '') {
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
				url: '/chat/sendMessage',
				headers: {
					'Content-Type': 'application/json',
					'x-external-token': $scope.externalToken
				},
				data: objPost
			});
		}
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



	$scope.formSubmit = function () {

		var element = angular.element(document.querySelector('#contentChat'));
		var elementHTML = element.html();
		var inputFeedBack = angular.element(document.querySelector('#filterFeedback'));
		var message = $scope.txtMessage;
		$scope.txtMessage = '';

		if (isEmpty(message)) return;

		salvaHistorico(message, 2);
		adicionaBalao(mensagemHtml.replace('MSG', message), null, 2);

		if (message.trim() == '?') return;

		enviaMsg(message, $scope.objectConversation.context)
			.then(function success(res) {
				if (res.data.status == 'ok') {
					var promise = $timeout();
					var data = res.data.object;
					var msg = '';
					var watsonSay = '';
					var auxFeedbackHtml = '';
					$scope.conversation_id = data.context.conversation_id;
					$scope.objectConversation = data;


					angular.forEach(data.output.text, function (value, key) {
						if (value.trim() != '') {
							promise = promise.then(function () {
								msg += mensagemHtml.replace('MSG', value);
								var timeoutValue = adicionaBalao(mensagemHtml.replace('MSG', value), null, 1);
								return $timeout(timeoutValue + 750);
							});
						}
					});

					promise.then(function () {
						if (msg == '' && watsonSay == '') {
							adicionaBalao('<p>ERRO! Desculpe, não entendi. Poderia perguntar de outro jeito?</p>', null, 1);
						} else {
							if ($scope.feedback && data.context.endConversation && data.context.endConversation == 'yes') {
								auxFeedbackHtml = feedbackHtml;
								delete $scope.objectConversation.context.endConversation;
								adicionaBalao(null, auxFeedbackHtml, 1);
								$scope.waitFeedback = true;
								$scope.placeholder = 'Por favor, forneça o feedback!';
							}
						}
						return $timeout(1);
					}).then(function () {
						salvaHistorico(msg, 1);
					});
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
	}
}]);