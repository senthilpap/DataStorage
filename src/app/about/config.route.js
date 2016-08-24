(function() {
    'use strict';

    angular
        .module('app.about')
        .config(config);
        
    function config($routeProvider) {
        $routeProvider
            .when('/about', {
                templateUrl: 'src/app/about/about.html',
                activetab: 'about'
            })
    }
     
})();