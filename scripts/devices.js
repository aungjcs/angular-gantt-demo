/*global angular: true, _: true*/
'use strict';

/**
 * @ngdoc function
 * @name angularGanttDemoApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the angularGanttDemoApp
 */
angular.module( 'angularGanttDemoApp' )
    .controller( 'MainCtrl', ['$scope', '$timeout', 'ganttUtils', 'DevicesData', 'moment', function( $scope, $timeout, utils, DevicesData, moment ) {

        var nationalHolidays = DevicesData.getNationalHoliday();
        var $ = angular.element;
        var lastData = null;

        $scope.options = {
            mode: 'custom',
            scale: 'day',

            // viewScale: 'day',
            sortMode: 'from',
            sideMode: 'Tree',
            maxHeight: true,
            width: true,
            zoom: 1,
            columns: ['model.name', 'from', 'to'],
            treeTableColumns: ['from', 'to'],
            columnsHeaders: {
                'model.name': 'Name',
                'from': 'From',
                'to': 'To'
            },
            columnsClasses: {
                'model.name': 'gantt-column-name',
                'from': 'gantt-column-from',
                'to': 'gantt-column-to'
            },
            columnsFormatters: {
                'from': function( from ) {

                    return from !== undefined ? from.format( 'lll' ) : undefined;
                },
                'to': function( to ) {

                    return to !== undefined ? to.format( 'lll' ) : undefined;
                }
            },
            treeHeaderContent: '<i class="fa fa-align-justify"></i> {{getHeader()}}',
            columnsHeaderContents: {
                'model.name': '<i class="fa fa-align-justify"></i> {{getHeader()}}',
                'from': '<i class="fa fa-calendar"></i> {{getHeader()}}',
                'to': '<i class="fa fa-calendar"></i> {{getHeader()}}'
            },
            autoExpand: 'none',
            taskOutOfRange: 'truncate',
            fromDate: new Date( 2015, 9, 1 ),
            toDate: new Date( 2015, 10, 30 ),
            rowContent: '<i class="fa fa-align-justify"></i> {{row.model.name}}',
            taskContent: '<i class="fa fa-tasks"></i> {{task.model.name}}',
            allowSideResizing: true,
            labelsEnabled: true,
            currentDate: 'column',
            currentDateValue: new Date(),
            draw: true,
            readOnly: false,
            groupDisplayMode: 'Disabled',
            filterTask: '',
            filterRow: '',
            timeFrames: {
                'day': {
                    start: moment( '0:00', 'HH:mm' ),
                    end: moment( '23:59', 'HH:mm' ),
                    color: '#ACFFA3',
                    working: true,
                    default: true
                },
                'weekend': {
                    working: false,
                    color: '#999'
                },
                'holiday': {
                    working: false,
                    color: 'red',
                    classes: ['gantt-timeframe-holiday']
                }
            },
            dateFrames: {
                'weekend': {
                    evaluator: function( date ) {

                        return date.isoWeekday() === 6 || date.isoWeekday() === 7;
                    },
                    targets: ['weekend']
                },
                'holiday': {
                    evaluator: function( date ) {

                        return !! nationalHolidays.dateMap[date.format( 'YYYYMMDD' )];

                        // return true;
                    },
                    targets: ['holiday']
                }
            },
            timeFramesWorkingMode: 'hidden',
            timeFramesNonWorkingMode: 'visible', // visible hidden

            /* 日単位でスムーズに移動変更させる為のおすすめ設定
                daily: false,
                columnMagnet: '1 day',
                timeFramesMagnet: false,
            */

            daily: false,
            columnMagnet: '1 day',

            // columnMagnet: '1 hour',
            // columnMagnet: '1 minute',
            // columnMagnet: '1 second',
            // columnMagnet: '23.5 hours',

            timeFramesMagnet: false,
            canDraw: function( event ) {

                var isLeftMouseButton = event.button === 0 || event.button === 1;

                return $( event.target ).parent( 'div' ).hasClass( 'row-counter' ) && isLeftMouseButton;
            },
            drawTaskFactory: function() {

                return {
                    id: utils.randomUuid(),
                    name: 'Task',

                    // color: '#F1C232'
                };
            },
            api: function( api ) {

                $scope.api = api;

                api.core.on.ready( $scope, function() {

                    api.core.on.rendered( $scope, function() {

                        // $( '.gantt-tree-root' ).sortable({
                        //     handle: '.gantt-tree-sort-handle',
                        //     start: function( event, ui ) {

                        //         // $( '.gantt-side-background-body' ).addClass( 'hidden' );
                        //     },
                        //     stop: function() {

                        //         // $( '.gantt-side-background-body' ).removeClass( 'hidden' );
                        //         console.log( 'sortable stopped', arguments );
                        //     }
                        // });

                        $( '.gantt-tree-root li' ).each(function() {

                            var id, classes, row;

                            classes = $( this ).children( 'div' ).attr( 'class' ).split( ' ' );

                            classes.forEach(function( v ) {

                                if ( v.indexOf( 'id_' ) === 0 ) {

                                    id = v.slice( 3 );
                                }
                            });

                            row = _.find( $scope.data, function( v ) {

                                return v.id === id;
                            });

                        });
                    });

                    // 移動
                    if ( api.tasks.on.moveBegin ) {

                        api.tasks.on.moveBegin( $scope, function( task ) {

                        });

                        api.tasks.on.moveEnd( $scope, function( task ) {

                            var duplicate;

                            duplicate = findDuplicate( task );

                            if ( ! task.$element.closest( '.row-counter' ).length || duplicate ) {

                                revert( task );

                            } else {

                                save( task );
                            }
                        });
                    }

                    // 変更
                    if ( api.tasks.on.resizeBegin ) {

                        api.tasks.on.resizeBegin( $scope, function( task ) {

                        });

                        api.tasks.on.resizeEnd( $scope, function( task ) {

                            var duplicate;

                            duplicate = findDuplicate( task );

                            if ( duplicate ) {

                                revert( task );
                                api.tree.refresh();

                            } else {

                                save( task );
                                api.tree.refresh();
                            }
                        });
                    }

                    api.tasks.on.move( $scope, function( task ) {

                        task.$element.removeClass( 'error' );

                        // 期間を最適化
                        optimizePeriod( task );

                        if ( ! task.$element.closest( '.row-counter' ).length || findDuplicate( task ) ) {

                            task.$element.addClass( 'error' );
                        }
                    });

                    api.tasks.on.resize( $scope, function( task ) {

                        task.$element.removeClass( 'error' );

                        // 期間を最適化
                        optimizePeriod( task );

                        if ( findDuplicate( task ) ) {

                            task.$element.addClass( 'error' );
                        }
                    });

                    $scope.load();

                    api.directives.on.new( $scope, function( dName, dScope, ele ) {

                        var item, addHandler;

                        // ラベルの場合
                        if ( dName === 'ganttRowLabel' ) {

                            if ( ele[0].tagName === 'SPAN' ) {

                                item = ele.closest( 'li' );
                                addHandler = $( '<a class="gantt-tree-handle-button gantt-tree-add btn btn-xs">' );
                                addHandler.append( '<i class="glyphicon glyphicon-plus-sign">' );

                                ele.closest( 'div' ).prepend( addHandler );

                                // 店舗追加
                                addHandler.click(function( evt ) {

                                    var row, counter;

                                    evt.preventDefault();

                                    row = getRowFromDom( item );
                                    counter = DevicesData.getNewCounter();

                                    row.tasks = row.tasks || [];
                                    row.children = row.children || [];

                                    // 親子関係を築く
                                    counter.parent = row.name;

                                    $scope.data.push( counter );
                                    $scope.checkpoint();

                                    $scope.mapTasks();
                                    $scope.api.rows.refresh();
                                    $scope.$applyAsync();
                                });
                            }
                        }

                        if ( dName === 'ganttTask' ) {

                            ele.on( 'contextMenuClick', function( evt, key ) {

                                evt.preventDefault();

                                if ( key === 'delete' ) {

                                    ele.off( 'contextMenuClick' );

                                    remove( dScope.task );
                                }
                            });
                        }
                    });
                });
            }
        };

        $scope.$watch( 'options.sideMode', function( newValue, oldValue ) {

            if ( newValue !== oldValue ) {

                $scope.api.side.setWidth( undefined );
                $timeout(function() {

                    $scope.api.columns.refresh();
                });
            }
        });

        function getRowFromDom( item ) {

            var classes, row, id;

            classes = $( item ).children( 'div' ).attr( 'class' ).split( ' ' );

            classes.forEach(function( v ) {

                if ( v.indexOf( 'id_' ) === 0 ) {

                    id = v.slice( 3 );
                }
            });

            row = _.find( $scope.data, function( v ) {

                return v.id === id;
            });

            return row;
        }

        function optimizePeriod( task ) {

            if ( task.model ) {

                if ( task.model.from.format( 'YYYYMMDD' ) !== task.model.to.format( 'YYYYMMDD' ) ) {

                    // task.model.to.add( -1, 'm' );
                }
            }

            return task;
        }

        function findDuplicate( task ) {

            return _.find( $scope.allTasks, function( v ) {

                var tf, tt, vf, vt;

                tf = task.model.from.format( 'YYYYMMDD' );
                tt = moment( task.model.to.toDate() ).add( -1, 'm' ).format( 'YYYYMMDD' );
                vf = v.from.format( 'YYYYMMDD' );
                vt = moment( v.to.toDate() ).add( -1, 'm' ).format( 'YYYYMMDD' );

                if ( task.model.id === v.id ) {

                    return false;
                }

                if ( tf >= vf && tf <= vt ) {

                    return true;
                }

                if ( tt >= vf && tt <= vt ) {

                    return true;
                }

                if ( tf <= vf && tt >= vt ) {

                    return true;
                }

                if ( tf >= vf && tt <= vt ) {

                    return true;
                }

                return false;
            });
        }

        function getFlatModel( task ) {

            var model;

            if ( task.model ) {

                model = angular.extend({}, task.model );
            } else if ( task.from && task.to ) {

                model = angular.extend({}, task );
            }

            model.from = model.from.format( 'YYYY-MM-DD' );
            model.to = model.to.format( 'YYYY-MM-DD' );

            return model;
        }

        $scope.canAutoWidth = function( scale ) {

            if ( scale.match( /.*?hour.*?/ ) || scale.match( /.*?minute.*?/ ) ) {

                return false;
            }
            return true;
        };

        $scope.getColumnWidth = function( widthEnabled, scale, zoom ) {

            if ( ! widthEnabled && $scope.canAutoWidth( scale ) ) {

                return undefined;
            }

            if ( scale.match( /.*?week.*?/ ) ) {

                return 150 * zoom;
            }

            if ( scale.match( /.*?month.*?/ ) ) {

                return 300 * zoom;
            }

            if ( scale.match( /.*?quarter.*?/ ) ) {

                return 500 * zoom;
            }

            if ( scale.match( /.*?year.*?/ ) ) {

                return 800 * zoom;
            }

            return 40 * zoom;
        };

        function remove( task ) {

            var foundRow;

            // $scope.dataから削除（これはやっといた方がいいらしい）
            // https://github.com/angular-gantt/angular-gantt/issues/359
            foundRow = _.find( $scope.data, function( v ) {

                return v.id === task.row.model.id;
            });

            if ( foundRow ) {

                foundRow.tasks = _.reject( foundRow.tasks, function( v ) {

                    return v.id === task.model.id;
                });
            }

            // 行から削除
            task.row.removeTask( task.model.id );

            //ストレージから削除
            DevicesData.remove( task );

            $scope.mapTasks();
            $scope.checkpoint();
            $scope.api.rows.refresh();
            $scope.$applyAsync();
        }

        function revert( task ) {

            task.$element.removeClass( 'error' );

            $scope.data.length = 0;
            // $scope.data = angular.copy( lastData );
            $scope.data = DevicesData.getDevicesData();

            $scope.mapTasks();
            $scope.api.rows.refresh();
            $scope.$applyAsync();
        }

        function save( task ) {

            DevicesData.save( task );

            $scope.mapTasks();
            $scope.checkpoint();
            $scope.api.rows.refresh();
            $scope.$applyAsync();
        }

        $scope.resort = function() {

            console.log( '$scope.data', $scope.data );

            $scope.api.rows.sort();
        };

        $scope.reset = function() {

            // DevicesData.removeAll();

            // $scope.clear();
            // $scope.reload();

            $scope.data.forEach(function( v ) {
                if ( v.type === 'device' ) {

                    v.tasks.length = 0;
                }
            });

            $scope.api.rows.refresh();
            $scope.$applyAsync();
        };

        // Reload data action
        $scope.load = function() {

            $scope.data = DevicesData.getDevicesData();

            $scope.checkpoint();
            $scope.mapTasks();
        };

        $scope.checkpoint = function() {

            lastData = angular.copy( $scope.data );
        };

        $scope.mapTasks = function() {

            var allTasks, devices, device, counterTasks, deviceTask;

            allTasks = [];

            // devices = _.groupBy( $scope.data, 'name' );
            devices = {};

            $scope.data.forEach(function( v ) {

                if ( v.type === 'device' ) {

                    v.tasks = [];
                    devices[v.name] = v;
                }
            });

            console.log( 'devices', devices );

            $scope.data.forEach(function( row ) {

                if ( row.type === 'counter' ) {

                    device = devices[row.parent];
                    device.tasks = device.tasks || [];

                    counterTasks = row.tasks || [];

                    counterTasks.forEach(function( t ) {

                        deviceTask = angular.copy( t );
                        deviceTask.id = utils.randomUuid();
                        deviceTask.movable = false;
                        device.tasks.push( deviceTask );
                    });

                    // device.tasks = device.tasks.concat( angular.copy( row.tasks || []) );

                    allTasks = allTasks.concat( row.tasks || []);
                }
            });

            $scope.allTasks = allTasks;

            console.log( 'allTasks', allTasks );
        };

        $scope.reload = function() {

            $scope.load();
        };

        // Clear data action
        $scope.clear = function() {

            $scope.data = [];
        };

    }]);
