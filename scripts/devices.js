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
    .controller( 'MainCtrl', ['$scope', '$timeout', 'ganttUtils', 'GanttObjectModel', 'DevicesData', 'moment', function( $scope, $timeout, utils, ObjectModel, DevicesData, moment ) {

        var objectModel;
        var dataToRemove;

        var $ = angular.element;

        $scope.options = {
            mode: 'custom',
            scale: 'day',

            // viewScale: 'day',
            sortMode: undefined,
            sideMode: 'Tree',
            daily: true,
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
                }
            },
            timeFramesWorkingMode: 'hidden',
            timeFramesNonWorkingMode: 'visible', // visible hidden

            // columnMagnet: '1 day',
            // columnMagnet: '1 hour',
            columnMagnet: '1 minute',

            // columnMagnet: '1 second',
            // columnMagnet: '23 hours',
            timeFramesMagnet: false,
            canDraw: function( event ) {

                var isLeftMouseButton = event.button === 0 || event.button === 1;

                return $( event.target ).parent( 'div' ).hasClass( 'row-counter' ) && isLeftMouseButton;
            },
            drawTaskFactory: function() {

                return {
                    id: utils.randomUuid(), // Unique id of the task.
                    name: 'Drawn task', // Name shown on top of each task.
                    color: '#F1C232' // Color of the task in HEX format (Optional).
                };
            },
            api: function( api ) {

                $scope.api = api;

                api.core.on.ready( $scope, function() {

                    api.core.on.rendered( $scope, function() {

                        $( '.gantt-tree-root' ).sortable({
                            handle: '.gantt-tree-sort-handle',
                            start: function( event, ui ) {

                                // $( '.gantt-side-background-body' ).addClass( 'hidden' );
                            },
                            stop: function() {

                                // $( '.gantt-side-background-body' ).removeClass( 'hidden' );
                                console.log( 'sortable stopped', arguments );
                            }
                        });

                        $( '.gantt-tree-root li' ).each(function() {

                            var id, classes, row;

                            // var id = $(this).children('div').attr('class').split(' ')[2]

                            classes = $( this ).children( 'div' ).attr( 'class' ).split( ' ' );

                            classes.forEach(function( v ) {

                                if ( v.indexOf( 'id_' ) === 0 ) {

                                    id = v.slice( 3 );
                                }
                            });

                            row = _.find( $scope.data, function( v ) {

                                return v.id === id;
                            });

                            // $( this ).trigger( 'setRowData', row );
                        });
                    });

                    api.tasks.on.change( $scope, function( task ) {

                    });

                    // 移動
                    if ( api.tasks.on.moveBegin ) {

                        api.tasks.on.moveBegin( $scope, function( task ) {

                            task.original = {
                                model: angular.extend({}, task.model ),
                                rowModel: angular.extend({}, task.row.model )
                            };

                        });

                        api.tasks.on.moveEnd( $scope, function( task ) {

                            var duplicate;

                            duplicate = findDuplicate( task );

                            console.log( 'duplicate', duplicate );
                        });
                    }

                    // 変更
                    if ( api.tasks.on.resizeBegin ) {

                        api.tasks.on.resizeBegin( $scope, function( task ) {

                            console.log( 'resizeBegin', task );

                            task.original = {
                                model: angular.extend({}, task.model ),
                                rowModel: angular.extend({}, task.row.model )
                            };
                        });

                        api.tasks.on.resizeEnd( $scope, function( task ) {

                            // 追加タスクの場合は時間が同じにならないようにする
                            if ( ! task.original ) {

                                task.model.from.hour( 0 );
                                task.model.to.hour( 23 );
                            }

                            console.log( 'resizeEnd', getFlatModel( task ) );

                            DevicesData.addNew( task );
                        });

                        api.tasks.on.resize( $scope, function( task ) {

                            // console.log('resize', task);
                        });
                    }

                    function findDuplicate( task ) {

                        return _.find( $scope.allTasks, function( v ) {

                            var tf, tt, vf, vt;

                            tf = task.model.from.format( 'YYYYMMDD' );
                            tt = task.model.to.format( 'YYYYMMDD' );
                            vf = v.from.format( 'YYYYMMDD' );
                            vt = v.to.format( 'YYYYMMDD' );

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

                    api.tasks.on.move( $scope, function( task ) {

                        task.$element.removeClass( 'error' );

                        if ( task.row.tasks.length > 1 ) {

                            // task.$element.addClass( 'error' );
                        }

                        if ( findDuplicate( task ) ) {

                            task.$element.addClass( 'error' );
                        }

                        // console.log( 'tasks.on.change' );
                    });

                    api.tasks.on.resize( $scope, function( task ) {

                        task.$element.removeClass( 'error' );

                        if ( findDuplicate( task ) ) {

                            task.$element.addClass( 'error' );
                        }
                    });

                    api.data.on.change( $scope, function( newData ) {

                    });

                    $scope.load();

                    api.directives.on.new( $scope, function( directiveName, directiveScope, element　) {

                        var item, addHandler;

                        // ラベルの場合
                        if ( directiveName === 'ganttRowLabel' ) {

                            if ( element[0].tagName === 'SPAN' ) {

                                item = element.closest( 'li' );
                                addHandler = $( '<a class="gantt-tree-handle-button gantt-tree-add btn btn-xs">' );
                                addHandler.append( '<i class="glyphicon glyphicon-plus-sign">' );

                                element.closest( 'div' ).prepend( addHandler );

                                // 店舗追加
                                addHandler.click(function( evt ) {

                                    var row, counter;

                                    evt.preventDefault();

                                    row = getRomFromDom( item );
                                    counter = DevicesData.getNewCounter();

                                    row.tasks = row.tasks || [];
                                    row.children = row.children || [];

                                    // 親子関係を築く
                                    counter.parent = row.name;
                                    // row.children.push( counter.name );

                                    $scope.data.push( counter );

                                    $scope.mapTasks();
                                    api.rows.refresh();
                                    $scope.$applyAsync();

                                    console.log( 'row', $scope.data );
                                });

                                /*item.on( 'setRowData', function( event, row ) {

                                });*/
                            }
                        }
                    });

                    api.directives.on.new( $scope, function( directiveName, directiveScope, element, attr, ctrl ) {

                        var foundRow, item;

                        if ( directiveName === 'ganttTask' ) {

                            // console.log( directiveScope.task.model.name, directiveScope, element );

                            element.on( 'contextMenuClick', function() {

                                foundRow = _.find( $scope.data, function( v ) {

                                    return v.id === directiveScope.task.row.model.id;
                                });

                                // console.log( 'directiveScope.task', directiveScope.task );
                                // console.log( 'row', foundRow );

                                if ( foundRow ) {

                                    foundRow.tasks = _.reject( foundRow.tasks, function( v ) {

                                        return v.id === directiveScope.task.model.id;
                                    });

                                    $scope.mapTasks();
                                    api.rows.refresh();
                                    $scope.$applyAsync();
                                }
                            });
                        }

                        // ラベルの場合
                        if ( directiveName === 'ganttRowLabel' ) {

                            if ( element[0].tagName === 'SPAN' ) {

                                // item = element.closest( 'li' );

                                // element.closest( 'div' ).prepend( '<a class="gantt-tree-handle-button gantt-tree-sort-handle btn btn-xs"><i class="glyphicon glyphicon-sort"></a>' );
                            }

                        }

                    });

                    api.tasks.on.rowChange( $scope, function( task ) {

                    });

                    api.tasks.on.add( $scope, function( task ) {

                        // console.log( 'tasksOnAdd', angular.extend({}, task.model) );
                    });

                    api.tasks.on.change( $scope, function( task ) {

                        // console.log( 'tasksOnChange', angular.extend({}, task.model) );
                    });

                    api.rows.on.add( $scope, function( row ) {

                    });

                    objectModel = new ObjectModel( api );
                });
            }
        };

        function getRomFromDom( item ) {

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

        function getFlatModel ( task ) {

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

        $scope.$watch( 'options.sideMode', function( newValue, oldValue ) {

            if ( newValue !== oldValue ) {

                $scope.api.side.setWidth( undefined );
                $timeout(function() {

                    $scope.api.columns.refresh();
                });
            }
        });

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

        // Reload data action
        $scope.load = function() {

            $scope.data = DevicesData.getDevicesData();
            dataToRemove = undefined;

            $scope.mapTasks();
        };

        $scope.mapTasks = function() {

            var allTasks = [];

            $scope.data.forEach(function( row ) {

                allTasks = allTasks.concat( row.tasks || []);
            });

            $scope.allTasks = allTasks;
        };

        $scope.reload = function() {

            $scope.load();
        };

        // Remove data action
        $scope.remove = function() {

            $scope.api.data.remove( dataToRemove );
        };

        // Clear data action
        $scope.clear = function() {

            $scope.data = [];
        };

    }]);
