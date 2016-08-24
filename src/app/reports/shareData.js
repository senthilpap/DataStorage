(function() {
    'use strict';

    angular
        .module('app.reports')
        .factory('shareData', shareData);

    function shareData () {
        var selectedRecord;
        
        return {
            getSelectedRecord: getSelectedRecord,
            setSelectedRecord: setSelectedRecord
        }


        function setSelectedRecord (record) {
            selectedRecord = record;
        }

        function getSelectedRecord () {
            return selectedRecord;
        }
    }
})();
