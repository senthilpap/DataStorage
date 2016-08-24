(function () {
    'use strict'
   
    angular
        .module('app.dao')
        .factory('generateDAO', generateDAO);

    generateDAO.$inject = ['growl'];

    function generateDAO (growl) {
        return {
            createorOpenDB: createorOpenDB,
            executeQuery: executeQuery
        }

        function createorOpenDB(name, version, desc, size) {
            var db = openDatabase(name, version, desc, size);

            return db;
        }

        function executeQuery (db, query, onSuccessCallback, onErrorCallback) {
            var result,
                success = onSuccessCallback || onSuccess,
                error = onErrorCallback || onError

            db.transaction(function (tx) {
                tx.executeSql(query, [], success, error);
            });
        }

        function onError (tx, e) {
            console.log(e.message, 'error');
        }

        function onSuccess (tx, r) {
            console.log(r.rows.length, 'success');
        }
    }
})();