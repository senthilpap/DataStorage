(function() {
    'use strict';

    angular
        .module('app.reports')
        .controller('reports', reports);

    reports.$inject = ['$scope', 'generateDAO', 'growl', '$q', 'shareData', '$location'];

    function reports ($scope, generateDAO, growl, $q, shareData, $location) {
    
          var vm = this,
            version = "1.0",
            desc = "browser database",
            size = 20 * 1024 * 1024, //20MB
            onSuccessCallbackForListData,
            onSuccessCallbackForTable, onRegisterApi;

        onSuccessCallbackForTable = function (tx, sqlResultSet) {
            var len = sqlResultSet.rows.length,
                names = [], index, temp = [],
                tableIndex, tableName;

            for (var i=0; i < len; i = i + 1) {
                names.push(sqlResultSet.rows.item(i).name);
            }

            index = names.indexOf('__WebKitDatabaseInfoTable__')
            names.splice( index, 1 );
            index = names.indexOf('sqlite_sequence')
            names.splice( index, 1 );

            for (var j= 0; j< names.length; j = j +1) {
                temp.push({name: names[j], value: j});
            }

            tableName = localStorage.getItem('tableName.name');
            tableIndex = findIndex(temp, tableName, 'name');

            if (temp.length === 0 || $scope.tableName === '') {
                localStorage.setItem('tableName.name', temp[0].name);
            }

            $scope.$apply(function() {
                $scope.tableNames = temp;
                $scope.tableName = $scope.tableNames[tableIndex];
                console.log($scope.tableName);
            });
        };

        $scope.updateTableName = function (value) {
            var db;

            localStorage.setItem('tableName.name', $scope.tableName.name);
            localStorage.setItem('tableName.value', $scope.tableName.value);
            location.reload();
        }

        onSuccessCallbackForListData = function(tx, sqlResultSet) {
            var list = [], i,
                len = sqlResultSet.rows.length,
                i = 0, columnDefs=[], temp,
                tableName = $scope.tableName;

            for (i; i < len;  i++) {
                list.push(sqlResultSet.rows.item(i));
            }

            if (list.length === 0) {
                list.push({name: 'No Records Found'});
                columnDefs = [];
            }
            else {
                columnDefs.push({
                    field: 'edit',
                    cellTemplate: '<input type="button" class="link-button" value="Edit" ng-click="$event.stopPropagation(); getExternalScopes().editList(row.entity)" href="/#/addNew/{{row.entity.id}}" />'
                });
            }

            temp = list[0];
            for (var key in temp) {
                columnDefs.push({field: key});
            }    
            
            $scope.dataForExport = angular.copy(list);

            $scope.$apply(function(record) {
                $scope.gridOptions = {
                    data: list,
                    columnDefs: columnDefs
                };
            });
        }

        $scope.myViewModel = {
            setRecord: shareData.setSelectedRecord,
            editList : function(record){
                var path = '/edit/'+$scope.tableName.name;

                this.setRecord(record);
                $location.path(path);

            }
        };

        $scope.recordID = 0;
        $scope.tableNames = [];
        $scope.dbName = localStorage.getItem('dbName');
        $scope.tableName = localStorage.getItem('tableName.name');
        $scope.gridOptions = {};
        $scope.showFileImport = true;
        shareData.setSelectedRecord(null);

        $scope.export = function () {
            var blob, gridData, csvContent, 
                dataString, encodedUri, temp1,
                temp2 = [];

            gridData = $scope.dataForExport;
            
            csvContent = "data:application/csv;charset=utf-8,";
            temp1 = gridData[0];

            for (var p in temp1) {
                if (temp1.hasOwnProperty(p)) {
                    temp2.push(p);
                }
            }

            dataString = temp2.join(",");
            csvContent += dataString+ "\n";

            gridData.forEach(function (data, index) {
                var temp = [];
                
                for (var p in data) {
                    if (data.hasOwnProperty(p)) {
                        temp.push(data[p]);
                    }
                }

                dataString = temp.join(",");
                csvContent += index < gridData.length ? dataString+ "\n" : dataString;
            });

            encodedUri = encodeURI(csvContent);
            window.open(encodedUri, "_self");
        }

        $scope.import = function () {
            $scope.showFileImport = false;
            $scope.hideBackgroung = 'reports-hide-partially';
        }

        $scope.hideDialog = function () {
            $scope.showFileImport = true;
            $scope.hideBackgroung = '';
        }

        $scope.importDataFromFile = function () {debugger;
            var fileUploader = document.querySelector('input[name="importFileLoader"]'),
                reader;

            reader = new FileReader();

            if (fileUploader.files.length === 0) {
                notification ('Please select CSV file', 'warning');
                return;
            }
            reader.readAsText(fileUploader.files[0], "UTF-8");

            reader.onload = function (evt) {
                var resultJson = evt.target.result,
                    tableName = $scope.tableName,
                    resultObj, query, dbObj;

                query = 'INSERT INTO '+ tableName.name + ' (';

                resultObj = convertCSVToObj(resultJson);

                resultObj.cols.forEach(function (value) {
                    query += value +','
                })

                query = query.substring(0, query.length - 1);
                query += ') VALUES'

                resultObj.data.forEach(function (value) {
                    query += '(';

                    for (var p in value) {
                        if (value.hasOwnProperty(p)) {
                            query += "'" + value[p] + "',";
                        }
                    }

                    query = query.substring(0, query.length - 1);
                    query += '),';
                })

                query = query.substring(0, query.length - 1);

                dbObj = generateDAO.createorOpenDB($scope.dbName.dbName, version, desc, size);
                generateDAO.executeQuery(dbObj, query, function onSuccess (tx, r) {
                    notification ('Data imported successfully', 'success');
                    location.reload();
                },
                function onFailure (tx, e) {
                    notification ('Column definition does not match with  given json', 'error');
                });
            }

            console.log('test');
        }

        function convertCSVToObj (resultJson) {
            var lines=resultJson.split("\n"),
                result = [], len,
                resultSet = {},
                headers, currentline;
             
            headers=lines[0].split(",");
            len = lines.length -1; 

            for(var i=1; i<len; i++){
                var obj = {};
                currentline=lines[i].split(",");
             
                for(var j=0;j<headers.length;j++){
                    obj[headers[j]] = currentline[j];
                }
             
                result.push(obj);
            }

            return resultSet = {
                cols: headers,
                data: result
            };
        }

        function notification (msg, type) {
            growl[type](msg, {ttl: 10000});
        }

        $scope.$on('$viewContentLoaded', function() {
            var db = null,
                tableList, defer;
            
            if ($scope.dbName) {
                db = generateDAO.createorOpenDB($scope.dbName, version, desc, size);
            }

            defer = $q.defer();

            defer.promise
                .then(function () {                    
                    listDB();
                })
                .then(function () {
                    listTablesList(db);
                })
                .then(function () {
                    listTableData(db, $scope.tableName);
                });

            defer.resolve();
        });

        function listTablesList (db) {
            var tableListQuery = "SELECT name FROM sqlite_master WHERE type='table'";

            if (db === null) {
                return;
            }

            generateDAO.executeQuery(db, tableListQuery, onSuccessCallbackForTable);
        }

        $scope.listTables = function (value) {
            var db,
                database = $scope.dbName.dbName;

            db = generateDAO.createorOpenDB(database, version, desc, size);
            
            localStorage.setItem('dbName', database);
            localStorage.setItem('tableName.name', "");
            localStorage.setItem('tableName.value', 0);
            listTablesList(db);
            location.reload();
        }

        function listTableData(db, tableName) {
            var listDataQuery = "SELECT * FROM " + tableName + ' order by id desc',
                list =[{name: 'No Records Found'}];

            if (tableName === '' || tableName === null) {
                $scope.gridOptions = {
                    data: list
                };

                return;
            }

            generateDAO.executeQuery(db, listDataQuery, onSuccessCallbackForListData);
        }

        function listDB () {
            var masterDBResult, query, dbObj;

            dbObj = generateDAO.createorOpenDB('reportMasterForBrowser', version, desc, size);
            query = 'select * from dbInfo order by id desc';
            generateDAO.executeQuery(dbObj, query, listDBRecords);
        }

        function listDBRecords (tx, sqlResultSet) {
            var i = 0, list = [], index = 0,
                len = sqlResultSet.rows.length;

            for (i; i < len;  i++) {
                list.push(sqlResultSet.rows.item(i));
            }


            index = findIndex(list, $scope.dbName, 'dbName');

            $scope.$apply(function(record) {
                $scope.databases = list;
                $scope.dbName = $scope.databases[index];
            });
        }

        function findIndex (list, itemToFind, field) {
            var i = 0,
                len = list.length;

            for (i; i<len; i = i+1) {
                if (itemToFind === list[i][field]) {
                    return i;
                }
            }
            
            return 0;
        }
    }
})();