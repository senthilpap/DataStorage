(function() {
    'use strict';

    angular
        .module('app.generateDB')
        .controller('generateDB', generateDB);

    generateDB.$inject = ['$scope', 'generateDAO', 'growl', '$q'];

    function generateDB($scope, generateDAO, growl, $q) {
        var vm = this,
            version = "1.0",
            desc = "browser database",
            size = 20 * 1024 * 1024, //20MB
            test;

        $scope.db = {};
        $scope.msg = '';
        $scope.create = function (db) {
            var result, defer;

            if (db.name.length > 0) {
                defer = $q.defer();

                defer.promise
                    .then(function () {
                        createMaster(db.name);
                    })
                    .then(function () {
                        updateMaster(db.name);
                    })
                    .then(function () {
                        result = generateDAO.createorOpenDB(db.name, version, desc, size);

                        if (typeof(result) === 'undefined') {
                            growl.error('DB is not created.', {ttl: 1000});
                        }
                        else {
                            growl.success('DB created successfully.', {ttl: 1000});
                        }        

                        localStorage.setItem('dbName', db.name);      
                        $scope.db.name = '';
                    })
                    .then(function () {
                        listDB();
                    })

                defer.resolve();                
            }
            else {
                return;
            }
        }

        function updateMaster (dbName) {
            var masterDBResult, query, dbObj;

            dbObj = generateDAO.createorOpenDB('reportMasterForBrowser', version, desc, size);

            query = 'INSERT INTO dbInfo (dbName) select "'+dbName;
            query += '" where not exists (select dbName from dbInfo where dbName = "'+dbName+'")';
            generateDAO.executeQuery(dbObj, query, onSuccess);
        }

        function createMaster () {
            var masterDBResult, query, dbObj;

            dbObj = generateDAO.createorOpenDB('reportMasterForBrowser', version, desc, size);

            query = 'CREATE TABLE IF NOT EXISTS dbInfo';
            query += ' (id INTEGER PRIMARY KEY AUTOINCREMENT, dbName text)';
            generateDAO.executeQuery(dbObj, query, onSuccess);
        }

        function onSuccess (tx, r) {
            console.log('master db updated');
        }

        $scope.$on('$viewContentLoaded', function() {
            listDBOnLoad();            
        });

        function listDB () {
            var masterDBResult, query, dbObj, defer;

            dbObj = generateDAO.createorOpenDB('reportMasterForBrowser', version, desc, size);
            query = 'select * from dbInfo order by id desc';
            generateDAO.executeQuery(dbObj, query, listDBRecords);
        }

        function listDBOnLoad () {
            var masterDBResult, query, dbObj, defer;

            defer = $q.defer();

            defer.promise
                .then(function () {
                    createMaster();
                })
                .then(function () {
                    dbObj = generateDAO.createorOpenDB('reportMasterForBrowser', version, desc, size);
                    query = 'select * from dbInfo order by id desc';
                    generateDAO.executeQuery(dbObj, query, listDBRecords);
                })
            defer.resolve();   
        }

        function listDBRecords (tx, sqlResultSet) {
            var i = 0, list = [],
                len = sqlResultSet.rows.length;

            for (i; i < len;  i++) {
                list.push(sqlResultSet.rows.item(i));
            }

            if (list.length === 0) {
                list.push({ id: 0, dbName: 'No records found'});
            }

            $scope.$apply(function(record) {
                $scope.myData = list;
            });
        }
        

    }
})();