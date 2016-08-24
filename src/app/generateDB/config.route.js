(function() {
    'use strict';

    angular
        .module('app.generateDB')
        .config(config);
        
    function config($routeProvider) {
        $routeProvider
            .when('/generateDB', {
                templateUrl: 'src/app/generateDB/generateDB.html',
                controller: 'generateDB',
                controllerAs: 'vm',
                activetab: 'generateDB'
            })
    }
     
})();