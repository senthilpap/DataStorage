(function() {
    'use strict';

    angular
        .module('app.crud')
        .controller('crud', crud);

    crud.$inject = ['$scope', 'generateDAO', 'growl', '$sce', '$routeParams', 'shareData', '$location'];

    function crud($scope, generateDAO, growl, $sce, $routeParams, shareData, $location) {
        var vm = this,
            version = "1.0",
            dbName = localStorage.getItem('dbName'),
            desc = "browser database",
            size = 20 * 1024 * 1024, //20MB
            onSuccessCallbackForColumn,
            data, isRecord;

        $scope.actionButton = 'Add New';
        $scope.action = false;
        $scope.recordId = $routeParams.id;
        $scope.tableName = $routeParams.name;

        if (typeof($scope.recordId) === 'undefined') {
            $scope.actionButton = 'Update';
            $scope.action = true;
        } 

        isRecord = shareData.getSelectedRecord();

        if (isRecord) {
            $scope.actionButton = 'Update';
            $scope.action = true;
        }

        $scope.htmlString = '';
        $scope.fieldProp = {};

        $scope.deleteData = function () {
            var query, dbObj,
                idField = document.querySelector('input[dataType="id"]');

            query = 'DELETE FROM ' + $scope.tableName
            query += ' WHERE id=' + idField.value;

            dbObj = generateDAO.createorOpenDB(dbName, version, desc, size);
            generateDAO.executeQuery(dbObj, query,  function onSuccess (tx, r) {
                notification ('Record deleted successfully');
            });
            $routeParams= null;
            $location.path('/reports');
        }

        $scope.insertOrUpdate = function() {
            var dbObj, query,
                fields = document.querySelectorAll('.input-btn-report-gen'),
                i = 0, field, msg,
                insertOrUpdate = $scope.action,
                result;
debugger;
            if (insertOrUpdate) {
                query = generateUpdateQuery(fields);
                msg = 'Record updated successfully';
            }
            else {
                query = generateInsertQuery(fields);
                msg = 'Record inserted successfully';
            }
        
            dbObj = generateDAO.createorOpenDB(dbName, version, desc, size);
            generateDAO.executeQuery(dbObj, query, function onSuccess (tx, r) {
                notification (msg);
            });
            
            $routeParams= null;
            $location.path('/reports');
        }

        function generateUpdateQuery (fields) {
            var query = 'UPDATE ' +$scope.tableName + ' SET ',
                len = fields.length, i = 0, field,
                idField = document.querySelector('input[dataType="id"]'),
                fieldNameQuery = '', fieldValueQuery = '';

            for (i; i < len; i = i +1) {
                field = fields.item(i);

                if (i < len -1) {
                    query += field.name + '="' + field.value + '",';
                }
                else {
                    query += field.name + '="' + field.value + '"';
                }
            }

            query += ' WHERE id='+idField.value;

            return query;
        }

        function generateInsertQuery(fields) {
            var query = 'INSERT INTO ' +$scope.tableName + '(',
                fieldNameQuery = '', field,
                len = fields.length, i = 0,
                query, fieldValueQuery = ''; 

             for (i; i < len; i = i +1) {
                field = fields.item(i);

                if (i < len -1) {
                    fieldNameQuery += field.name + ',';
                    fieldValueQuery += '"' + field.value +'",';    
                }
                else {
                    fieldNameQuery += field.name;
                    fieldValueQuery += '"' + field.value +'"';    
                }
            }

            query += fieldNameQuery + ') values (';
            query += fieldValueQuery + ')';

            return query;
        }

        onSuccessCallbackForColumn = function (tx, sqlResultSet, record) {
            var tableDef= sqlResultSet.rows.item(0), columnsObj, fieldsHtml;

            columnsObj = parseTable(tableDef, record);
            console.log(columnsObj);
            fieldsHtml = generateFields(columnsObj);

            $scope.$apply(function() {
                $scope.htmlString = $sce.trustAsHtml(fieldsHtml);
            });
        }

        $scope.$on('$viewContentLoaded', function() { 
            var columnListQuery = "SELECT sql FROM sqlite_master WHERE tbl_name = '"+ $scope.tableName +"' AND type = 'table'",
                ColumnList, db, record;

            record = shareData.getSelectedRecord();
            
            if (typeof(dbName) === 'string') {
                db = generateDAO.createorOpenDB(dbName, version, desc, size);
                ColumnList = generateDAO.executeQuery(db, columnListQuery, function (tx, sqlResultSet) {
                    onSuccessCallbackForColumn(tx, sqlResultSet, record);
                });
            }                
        });

        function parseTable(table, record){
            var temp = table.sql.replace(')', ''),
                temp1 = temp.split(','),
                columns = [];

            temp1.splice(0, 1);
            temp1.push(" id int");
            temp1.forEach(function (value, index, array) {
                var temp2 = value.split(' '),
                    tableName = temp2[1];

                if (typeof(record) === 'undefined' || record === null) {
                    columns.push({name: tableName, type: temp2[2], value: ''});
                }
                else {
                    columns.push({name: tableName, type: temp2[2], value: record[tableName]});   
                }
            });
            
            return columns;
        }

        function generateFields (columnsObj) {
            var obj, html, fieldhtml, elem;

            html = '<div>';

            for (var key in columnsObj) {
               obj = columnsObj[key];

                html += '<div class = "report-field-group"> <label class="report-field-label">' +obj.name+ '</label>';
           
                switch(obj.type) {
                    case 'integer'://int,small int , big int
                        fieldhtml = '<input type="number" class="input-btn-report-gen" name="'+ obj.name+'" value="'+obj.value+'" dataType="integer"/>';
                        break;
                    case 'boolean': //none
                        fieldhtml = '<input type="checkbox" name="'+ obj.name+ '" dataType="boolean" value="'+obj.value+'" class="input-btn-report-gen"/>';  
                        break;
                    case 'real': //real, dobule, float
                        fieldhtml = '<input type="datetime" dataType="real" class="input-btn-report-gen"  value="'+obj.value+'" name="'+ obj.name+ '" />'
                        break;
                    case 'numeric': //datetime boolean decimal
                        fieldhtml = '<input type="text" dataType="numeric" class="input-btn-report-gen"  value="'+obj.value+'" name="'+ obj.name+ '" />'
                        break;
                    case 'int':
                        fieldhtml = '<input type="input" disabled="true" class="input-btn-disabled" dataType="id"  value="'+obj.value+'" name="'+ obj.name+ '" />'
                        break;
                    default:
                       fieldhtml = '<input type="text"  value="'+obj.value+'" dataType="text" class="input-btn-report-gen" name="'+ obj.name+ '" />';
                }

                html += fieldhtml;
                html += '</div>';
            }

            html += '</div>';

            return html;
        }

        function notification (msg) {
            growl.success(msg, {ttl: 1000});
        }
    }
})();