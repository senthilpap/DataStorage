(function () {
    'use strict'
   
    angular
        .module('app')
        .controller('navigate', navigate);

    navigate.$inject = ['$scope', '$location'];

    function navigate($scope, $location) {
        $scope.isActive = function (viewLocation) {
            return viewLocation === $location.path();
        };
    }
})();