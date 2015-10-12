/* global angular, _, moment */
'use strict';

/**
 * @ngdoc service
 * @name angularGanttDemoApp.Sample
 * @description
 * # Sample
 * Service in the angularGanttDemoApp.
 */
angular.module( 'angularGanttDemoApp' )
    .service( 'DevicesData', ['$rootScope', 'ganttUtils', function Sample( $rootScope, util ) {

        var id, classId, counters = 0,
            data, records, storage;

        storage = JSON.parse( localStorage.getItem( 'ManageDevices' ) || '{}' );

        records = storage.records || [];
        data = [];

        function save() {

            storage.records = records;
            localStorage.setItem( 'ManageDevices', JSON.stringify( storage ) );
        }

        return {
            getDevicesData: function() {

                var devices, counters, counter;

                if ( records.length ) {

                    devices = _.groupBy( records, 'device' );
                    counters = _.groupBy( records, 'counter' );

                    // デバイス
                    _.keys( devices ).forEach(function( v ) {

                        id = util.randomUuid();
                        classId = 'id_' + id;

                        data.push({
                            name: v,
                            id: id,
                            classes: [classId, 'row-device'],
                            content: v,
                            color: '#45607D'
                        });
                    });

                    // 店舗
                    _.keys( counters ).forEach(function( v ) {

                        id = util.randomUuid();
                        classId = 'id_' + id;
                        counter = {
                            name: v,
                            id: id,
                            parent: counters[v][0].device,
                            classes: [classId, 'row-counter'],
                            content: v,
                            tasks: []
                        };

                        counters[v].forEach(function( c ) {

                            counter.tasks.push({
                                name: c.name,
                                from: moment( c.from + '00', 'YYYYMMDDHH' ).toDate(),
                                to: moment( c.to + '23', 'YYYYMMDDHH' ).toDate(),
                                color: '#F1C232'
                            });
                        });

                        data.push( counter );
                    });

                } else {

                    // データがない場合は初期デバイスを追加
                    id = util.randomUuid();
                    classId = 'id_' + id;
                    data.push({
                        name: 'devices01',
                        id: id,
                        classes: [classId, 'row-device'],
                        content: 'デバイス01',
                        color: '#45607D'
                    });

                }

                /*id = util.randomUuid();
                classId = 'id_' + id;

                data.push({
                    name: 'devices02',
                    id: id,
                    classes: [classId, 'row-device'],
                    content: 'デバイス02',
                    color: '#45607D'
                });*/

                return data;
            },

            addNew: function( task ) {

                var record;

                record = {
                    counter: task.row.model.name,
                    device: task.row.model.parent,
                    from: task.model.from.format( 'YYYYMMDD' ),
                    to: task.model.to.format( 'YYYYMMDD' ),
                    name: task.model.name
                };

                records.push( record );

                save();
            },

            getNewCounter: function() {

                var id, classId;

                id = util.randomUuid();
                classId = 'id_' + id;

                counters = counters + 1;

                return {
                    name: 'Counter_' + ( '00' + counters ).slice( -3 ),
                    content: '店舗' + ( '00' + counters ).slice( -3 ),
                    classes: [classId, 'row-counter']
                };
            }
        };
    }]);
