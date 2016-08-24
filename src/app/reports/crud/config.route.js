(function() {
    'use strict';

    angular
        .module('app.crud')
        .config(config);
        
    function config($routeProvider) {
        $routeProvider
            .when('/addNew/:tableName', {
                templateUrl: 'src/app/reports/crud/crud.html',
                controller: 'crud',
                controllerAs: 'vm',
                parent: 'reports',
                activetab: 'reports'
            })
            .when('/edit/:name', {
                templateUrl: 'src/app/reports/crud/crud.html',
                controller: 'crud',
                controllerAs: 'vm',
                parent: 'reports',
                activetab: 'activetab'
            })
    }
})();