app.controller("menu", ['$scope', '$timeout', '$http', function ($scope, $timeout, $http) {
    angular.element(document).ready(function () {
        let req = {
            method: 'GET',
            cache: false,
            url: '/configuracao/loadMenu',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        $http(req).then(function success(res) {
            if (typeof res.data !== 'undefined' && res.data) {
                let data = res.data;
                if (typeof data.status !== 'undefined' && data.status == 'ok') {
                    if (typeof data.toolbar !== 'undefined' && data.toolbar) {
                        let elmt = angular.element(document.querySelector('ul#menu_toolbar'));
                        let itens = '';

                        angular.forEach(data.toolbar.menu, function (value, key) {
                            if (value.address != '') {
                                itens += '<li><a href="' + value.address + '"><i class="' + value.icon + '" aria-hidden="true"></i>&nbsp;&nbsp;' + value.text + '</a></li>';
                            }
                            else {
                                itens += '<li class="dropdown"> <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"><i class="' + value.icon + '" aria-hidden="true"></i>&nbsp;&nbsp;' + value.text + '&nbsp;&nbsp;<span class="caret"></span></a> <ul class="dropdown-menu">';

                                angular.forEach(value.subitens, function (valueSubmenu, keySubmenu) {
                                    itens += '<li><a href="' + valueSubmenu.address + '"><i class="' + valueSubmenu.icon + '" aria-hidden="true"></i>&nbsp;&nbsp;' + valueSubmenu.text + '</a></li>';
                                });

                                itens += '</ul> </li>';
                            }
                        });

                        elmt.html(itens);


                        var divNav = angular.element(document.querySelector('div#navbar'));
                        var htmlDivNav = divNav.html();
                        htmlDivNav += '<ul class="nav navbar-nav navbar-right"> <li class="dropdown">';
                        htmlDivNav += ' <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"><i class="fa fa-user-o" aria-hidden="true"></i>&nbsp;&nbsp;<span class="caret"></span></a>';
                        htmlDivNav += '<ul class="dropdown-menu"> <li><a href="/logout">Sair</a></li></ul> </li> </ul>';

                        divNav.html(htmlDivNav);
                    }
                }
            }
        }, function fail(err) {
            alert(JSON.stringify(err));
            console.log(err);
        });
    });
}]);