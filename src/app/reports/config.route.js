(function() {
    'use strict';

    angular
        .module('app.reports')
        .config(config);
        
    function config($routeProvider) {
        $routeProvider
            .when('/reports', {
                templateUrl: 'src/app/reports/reports.html',
                controller: 'reports',
                controllerAs: 'vm',
                reloadOnSearch: false,
                activetab: 'reports'
            })
            .otherwise({
                redirectTo: '/generateDB',
                activetab: 'generateDB'
            });   
    }
})();