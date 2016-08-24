(function() {
    'use strict';

    angular
        .module('app.generateTable')
        .controller('generateTable', generateTable);

    generateTable.$inject = ['$scope', 'generateDAO', 'growl', '$q'];

    function generateTable($scope, generateDAO, growl, $q) {
        var vm = this,
            version = "1.0",
            desc = "browser database",
            size = 20 * 1024 * 1024, //20MB
            test, onSuccessCallbackForTable;

        $scope.noOfColumns = [];
        $scope.dataTypes = [
            {name:'text', value:'text'},
            {name:'int', value:'integer'},
            {name:'float', value:'numeric'},
            {name:'date', value:'real'}
            // {name:'boolean', value:'boolean'}
        ];
        $scope.table = {
            database: localStorage.getItem('dbName')
        };
        $scope.field = {};
        $scope.listShown = false;
        
        $scope.$on('$viewContentLoaded', function() {
            var db, defer;
            
            db = generateDAO.createorOpenDB( $scope.table.database, version, desc, size);
            defer = $q.defer();

            defer.promise
                .then(function () {
                    listDB();
                })
                .then(function () {
                    listTables(db, $scope.tableName);
                });

            defer.resolve();
        });


        $scope.listTables = function (value) {
            var db,
                database = $scope.table.database.dbName;

            db = generateDAO.createorOpenDB(database, version, desc, size);
            
            localStorage.setItem('dbName', database);
            listTables(db);
        }

        onSuccessCallbackForTable = function (tx, sqlResultSet) {
            var len = sqlResultSet.rows.length,
                names = [], index, temp = [],
                tableIndex = parseInt(localStorage.getItem('tableName.value'));

            for (var i=0; i < len; i = i + 1) {
                names.push(sqlResultSet.rows.item(i).name);
            }

            index = names.indexOf('__WebKitDatabaseInfoTable__')
            names.splice( index, 1 );
            index = names.indexOf('sqlite_sequence')
            names.splice( index, 1 );

            for (var j= 0; j< names.length; j = j +1) {
                temp.push({id: j+1, name: names[j]});
            }

            if (temp.length === 0) {
                temp.push({id: 0, name: 'No Tables found'});   
            }

            $scope.$apply(function() {
                $scope.myData = temp;
            });
        };


        function listTables (db) {
            var tableListQuery = "SELECT name FROM sqlite_master WHERE type='table'";

            generateDAO.executeQuery(db, tableListQuery, onSuccessCallbackForTable);   
        }

        function listDB () {
            var masterDBResult, query, dbObj;

            dbObj = generateDAO.createorOpenDB('reportMasterForBrowser', version, desc, size);
            query = 'select * from dbInfo order by id desc';
            generateDAO.executeQuery(dbObj, query, listDBRecords);
        }

        function listDBRecords (tx, sqlResultSet) {
            var i = 0, list = [],
                len = sqlResultSet.rows.length;

            for (i; i < len;  i++) {
                list.push(sqlResultSet.rows.item(i));
            }

            $scope.$apply(function(record) {
                $scope.databases = list;
                $scope.table.database = $scope.databases[0];
            });
        }
 
        $scope.getNumber = function(num) {
            var range = [];

            if (typeof(num) !== "undefined") {
                for(var i=0; i<num; i++) {
                  range.push(i);
                }
            }
            
            return range;
        }

        $scope.go = function (table) {
            var saveBtn;
        
            saveBtn = document.querySelector('input[name="save"]');
            saveBtn.style.display = 'block';
            localStorage.setItem('dbName', table.database.dbName);
            $scope.noOfColumns = $scope.getNumber(table.noOfColumnsGen);
        }

        $scope.save = function () {
            var db,
                fieldNames = $scope.field.name,
                fieldTypes = $scope.field.type,
                temp = {},
                len = $scope.noOfColumns.length,
                i = 0, result,
                database = $scope.table.database.dbName,
                query;

            query = 'CREATE TABLE IF NOT EXISTS ';
            query += $scope.table.name;
            query += ' (id INTEGER PRIMARY KEY AUTOINCREMENT';
            
            for (i = 0; i < len; i = i+1) {
                query +=  ', '+fieldNames[i] + ' '+fieldTypes[i].value;
            }
            
            query += ')';

            console.log(query);
            db = generateDAO.createorOpenDB(database, version, desc, size);
            result = generateDAO.executeQuery(db, query, onSuccessCallback, onErrorCallBack);
            console.log(result);           
        }

        function onSuccessCallback (tx, r) {
            var saveBtn = document.querySelector('input[name="save"]'),
                db, database = $scope.table.database.dbName;

            growl.success('Table created successfully.', {ttl: 1000});
            localStorage.setItem('tableName.name', $scope.table.name);
            localStorage.setItem('tableName.value', 0);
            saveBtn.style.display = 'none';

            $scope.noOfColumns = [];
            $scope.table.name = '';
            $scope.table.noOfColumnsGen  = 0;

            db = generateDAO.createorOpenDB(database, version, desc, size);
            listTables(db);
        }

        function onErrorCallBack(tx, e) {
            growl.error(e.message, {ttl: 1000});
        }
    }
})();