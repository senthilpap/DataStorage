(function () {
 'use strict';
    angular.module('app', [
        'ngAnimate',
        'angular-growl',
        'ngRoute',
        'ui.grid',
        'ui.grid.exporter',
        'app.core',
        'app.dao',
        'app.generateDB',
        'app.generateTable',
        'app.reports',
        'app.crud',
        'app.about'
    ]);
})();