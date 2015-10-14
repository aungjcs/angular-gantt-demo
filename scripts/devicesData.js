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
            data, records, storage, DATE_FORMAT;

        DATE_FORMAT = 'YYYYMMDD';

        storage = JSON.parse( localStorage.getItem( 'ManageDevices' ) || '{}' );

        records = storage.records || [];
        data = [];

        function saveRecords() {

            storage.records = records;
            localStorage.setItem( 'ManageDevices', JSON.stringify( storage ) );
        }

        function findRecord( task ) {

            return _.find( records, function( v ) {

                return v.id === task.model.id;
            });
        }

        return {
            getDevicesData: function() {

                var devices, counters, counter;

                data = [];

                if ( records.length ) {

                    devices = _.groupBy( records, 'device' );
                    counters = _.groupBy( records, 'counter' );

                    // デバイス
                    _.keys( devices ).forEach(function( v ) {

                        id = util.randomUuid();
                        classId = 'id_' + id;

                        data.push({
                            type: 'device',
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
                            type: 'counter',
                            name: v,
                            id: id,
                            parent: counters[v][0].device,
                            classes: [classId, 'row-counter'],
                            content: v,
                            tasks: []
                        };

                        counters[v].forEach(function( c ) {

                            counter.tasks.push({
                                id: c.id,
                                name: c.name,
                                from: moment( c.from, 'YYYYMMDD' ).toDate(),
                                to: moment( c.to, 'YYYYMMDD' ).toDate()
                                // from: moment( c.from + '00', 'YYYYMMDDHH' ).toDate(),
                                // to: moment( c.to + '23', 'YYYYMMDDHH' ).toDate()

                                // color: '#F1C232'
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

                return data;
            },

            addNew: function( task ) {

                var record;

                record = {
                    id: task.model.id,
                    counter: task.row.model.name,
                    device: task.row.model.parent,
                    from: task.model.from.format( DATE_FORMAT ),
                    to: task.model.to.format( DATE_FORMAT ),
                    name: task.model.name
                };

                records.push( record );

                saveRecords();
            },

            save: function( task ) {

                var found;

                found = findRecord( task );

                if ( found ) {

                    found.counter = task.row.model.name;
                    found.device = task.row.model.parent;
                    found.from = task.model.from.format( DATE_FORMAT );
                    found.to = task.model.to.format( DATE_FORMAT );
                } else {

                    this.addNew( task );
                }

                saveRecords();
            },

            remove: function( task ) {

                records = _.reject( records, function( v ) {

                    return task.model.id === v.id;
                });

                saveRecords();
            },

            removeAll: function() {

                records = [];

                saveRecords();
            },

            revert: function( task ) {

                var found;

                found = findRecord( task );

                if ( found ) {

                    task.model.from = moment( found.from, DATE_FORMAT );
                    task.model.to = moment( found.to, DATE_FORMAT );

                    // console.log('revert to', found);

                    return task;
                }

                return null;
            },

            getNewCounter: function() {

                var id, classId;

                id = util.randomUuid();
                classId = 'id_' + id;

                counters = counters + 1;

                return {
                    type: 'counter',
                    name: 'Counter_' + ( '00' + counters ).slice( -3 ),
                    content: '店舗' + ( '00' + counters ).slice( -3 ),
                    classes: [classId, 'row-counter']
                };
            },

            getNationalHoliday: function() {

                var holidays = {
                    dates: null,
                    dateMap: {}
                };

                 holidays.dates = [
                    { date: '20140101', name: '元日' },
                    { date: '20140113', name: '成人の日' },
                    { date: '20140211', name: '建国記念の日' },
                    { date: '20140321', name: '春分の日' },
                    { date: '20140429', name: '昭和の日' },
                    { date: '20140503', name: '憲法記念日' },
                    { date: '20140504', name: 'みどりの日' },
                    { date: '20140505', name: 'こどもの日' },
                    { date: '20140506', name: 'みどりの日 振替休日' },
                    { date: '20140721', name: '海の日' },
                    { date: '20140915', name: '敬老の日' },
                    { date: '20140923', name: '秋分の日' },
                    { date: '20141013', name: '体育の日' },
                    { date: '20141103', name: '文化の日' },
                    { date: '20141123', name: '勤労感謝の日' },
                    { date: '20141124', name: '勤労感謝の日 振替休日' },
                    { date: '20141223', name: '天皇誕生日' },
                    { date: '20150101', name: '元日' },
                    { date: '20150112', name: '成人の日' },
                    { date: '20150211', name: '建国記念の日' },
                    { date: '20150321', name: '春分の日' },
                    { date: '20150429', name: '昭和の日' },
                    { date: '20150503', name: '憲法記念日' },
                    { date: '20150504', name: 'みどりの日' },
                    { date: '20150505', name: 'こどもの日' },
                    { date: '20150506', name: '憲法記念日 振替休日' },
                    { date: '20150720', name: '海の日' },
                    { date: '20150921', name: '敬老の日' },
                    { date: '20150922', name: '国民の休日' },
                    { date: '20150923', name: '秋分の日' },
                    { date: '20151012', name: '体育の日' },
                    { date: '20151103', name: '文化の日' },
                    { date: '20151123', name: '勤労感謝の日' },
                    { date: '20151223', name: '天皇誕生日' },
                    { date: '20160101', name: '元日' },
                    { date: '20160111', name: '成人の日' },
                    { date: '20160211', name: '建国記念の日' },
                    { date: '20160320', name: '春分の日' },
                    { date: '20160321', name: '春分の日 振替休日' },
                    { date: '20160429', name: '昭和の日' },
                    { date: '20160503', name: '憲法記念日' },
                    { date: '20160504', name: 'みどりの日' },
                    { date: '20160505', name: 'こどもの日' },
                    { date: '20160718', name: '海の日' },
                    { date: '20160811', name: '山の日' },
                    { date: '20160919', name: '敬老の日' },
                    { date: '20160922', name: '秋分の日' },
                    { date: '20161010', name: '体育の日' },
                    { date: '20161103', name: '文化の日' },
                    { date: '20161123', name: '勤労感謝の日' },
                    { date: '20161223', name: '天皇誕生日' },
                    { date: '20170101', name: '元日' }
                ];

                holidays.dateMap[ '20140101' ] = '元日' ;
                holidays.dateMap[ '20140113' ] = '成人の日' ;
                holidays.dateMap[ '20140211' ] = '建国記念の日' ;
                holidays.dateMap[ '20140321' ] = '春分の日' ;
                holidays.dateMap[ '20140429' ] = '昭和の日' ;
                holidays.dateMap[ '20140503' ] = '憲法記念日' ;
                holidays.dateMap[ '20140504' ] = 'みどりの日' ;
                holidays.dateMap[ '20140505' ] = 'こどもの日' ;
                holidays.dateMap[ '20140506' ] = 'みどりの日 振替休日' ;
                holidays.dateMap[ '20140721' ] = '海の日' ;
                holidays.dateMap[ '20140915' ] = '敬老の日' ;
                holidays.dateMap[ '20140923' ] = '秋分の日' ;
                holidays.dateMap[ '20141013' ] = '体育の日' ;
                holidays.dateMap[ '20141103' ] = '文化の日' ;
                holidays.dateMap[ '20141123' ] = '勤労感謝の日' ;
                holidays.dateMap[ '20141124' ] = '勤労感謝の日 振替休日' ;
                holidays.dateMap[ '20141223' ] = '天皇誕生日' ;
                holidays.dateMap[ '20150101' ] = '元日' ;
                holidays.dateMap[ '20150112' ] = '成人の日' ;
                holidays.dateMap[ '20150211' ] = '建国記念の日' ;
                holidays.dateMap[ '20150321' ] = '春分の日' ;
                holidays.dateMap[ '20150429' ] = '昭和の日' ;
                holidays.dateMap[ '20150503' ] = '憲法記念日' ;
                holidays.dateMap[ '20150504' ] = 'みどりの日' ;
                holidays.dateMap[ '20150505' ] = 'こどもの日' ;
                holidays.dateMap[ '20150506' ] = '憲法記念日 振替休日' ;
                holidays.dateMap[ '20150720' ] = '海の日' ;
                holidays.dateMap[ '20150921' ] = '敬老の日' ;
                holidays.dateMap[ '20150922' ] = '国民の休日' ;
                holidays.dateMap[ '20150923' ] = '秋分の日' ;
                holidays.dateMap[ '20151012' ] = '体育の日' ;
                holidays.dateMap[ '20151103' ] = '文化の日' ;
                holidays.dateMap[ '20151123' ] = '勤労感謝の日' ;
                holidays.dateMap[ '20151223' ] = '天皇誕生日' ;
                holidays.dateMap[ '20160101' ] = '元日' ;
                holidays.dateMap[ '20160111' ] = '成人の日' ;
                holidays.dateMap[ '20160211' ] = '建国記念の日' ;
                holidays.dateMap[ '20160320' ] = '春分の日' ;
                holidays.dateMap[ '20160321' ] = '春分の日 振替休日' ;
                holidays.dateMap[ '20160429' ] = '昭和の日' ;
                holidays.dateMap[ '20160503' ] = '憲法記念日' ;
                holidays.dateMap[ '20160504' ] = 'みどりの日' ;
                holidays.dateMap[ '20160505' ] = 'こどもの日' ;
                holidays.dateMap[ '20160718' ] = '海の日' ;
                holidays.dateMap[ '20160811' ] = '山の日' ;
                holidays.dateMap[ '20160919' ] = '敬老の日' ;
                holidays.dateMap[ '20160922' ] = '秋分の日' ;
                holidays.dateMap[ '20161010' ] = '体育の日' ;
                holidays.dateMap[ '20161103' ] = '文化の日' ;
                holidays.dateMap[ '20161123' ] = '勤労感謝の日' ;
                holidays.dateMap[ '20161223' ] = '天皇誕生日' ;
                holidays.dateMap[ '20170101' ] = '元日' ;

                return holidays;
            }
        };
    }]);
