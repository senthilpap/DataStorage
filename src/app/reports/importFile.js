(function() {
    'use strict';

    angular
        .module('app.reports')
        .directive('importFile', importFile)

    function importFile () {
        return {
            restrict: 'AC',
            templateUrl: 'src/app/reports/importFile.html',
            scope: {
              'close': '&onClose',
              'importdata': '&onImportdata'
            }
        }
    }
})();