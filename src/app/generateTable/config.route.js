(function() {
    'use strict';

    angular
        .module('app.generateTable')
        .config(config);
        
    function config($routeProvider) {
        $routeProvider
            .when('/generateTable', {
                templateUrl: 'src/app/generateTable/generateTable.html',
                controller: 'generateTable',
                controllerAs: 'vm',
                activetab: 'generateTable'
            })
    }
     
})();
