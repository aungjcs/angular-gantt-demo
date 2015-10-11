'use strict';

/**
 * @ngdoc service
 * @name angularGanttDemoApp.Sample
 * @description
 * # Sample
 * Service in the angularGanttDemoApp.
 */
angular.module( 'angularGanttDemoApp' )
    .service( 'Sample', function Sample() {

        return {
            getSampleData: function() {

                return [

                        // Order is optional. If not specified it will be assigned automatically
                        { name: 'Milestones', height: '3em', sortable: false, classes: 'gantt-row-milestone', color: '#45607D', tasks: [

                            // Dates can be specified as string, timestamp or javascript date object. The data attribute can be used to attach a custom object
                            { name: 'Kickoff', color: '#93C47D', from: '2013-10-07', to: '2013-10-07T00:00:00', data: 'Can contain any custom data or object' },
                            { name: 'Concept approval', color: '#93C47D', from: new Date( 2013, 9, 18 ), to: new Date( 2013, 9, 18 ), est: new Date( 2013, 9, 16 ), lct: new Date( 2013, 9, 19 ) },
                            { name: 'Development finished', color: '#93C47D', from: new Date( 2013, 10, 15 ), to: new Date( 2013, 10, 15 ) },
                            { name: 'Shop is running', color: '#93C47D', from: new Date( 2013, 10, 22 ), to: new Date( 2013, 10, 22 ) },
                            { name: 'Go-live', color: '#93C47D', from: new Date( 2013, 10, 29 ), to: new Date( 2013, 10, 29 ) }
                        ], data: 'Can contain any custom data or object' },
                        /*{ name: 'Status meetings', tasks: [
                            { name: 'Demo #1', color: '#9FC5F8', from: new Date( 2013, 9, 25 ), to: new Date( 2013, 9, 25 ) },
                            { name: 'Demo #2', color: '#9FC5F8', from: new Date( 2013, 10, 1 ), to: new Date( 2013, 10, 1 ) },
                            { name: 'Demo #3', color: '#9FC5F8', from: new Date( 2013, 10, 8 ), to: new Date( 2013, 10, 8 ) },
                            { name: 'Demo #4', color: '#9FC5F8', from: new Date( 2013, 10, 15 ), to: new Date( 2013, 10, 15 ) },
                            { name: 'Demo #5', color: '#9FC5F8', from: new Date( 2013, 10, 24 ), to: new Date( 2013, 10, 24 ) }
                        ] },
                        { name: 'Kickoff', classes: 'gantt-row-Kickoff', movable: { allowResizing: false }, tasks: [
                            { name: 'Day 1', color: '#9FC5F8', from: new Date( 2013, 9, 7 ), to: new Date( 2013, 9, 7 ),
                                progress: { percent: 100, color: '#3C8CF8' }, movable: false },
                            { name: 'Day 2', color: '#9FC5F8', from: new Date( 2013, 9, 8 ), to: new Date( 2013, 9, 8 ),
                                progress: { percent: 100, color: '#3C8CF8' } },
                            { name: 'Day 3', color: '#9FC5F8', from: new Date( 2013, 9, 9 ), to: new Date( 2013, 9, 9 ),
                                progress: { percent: 100, color: '#3C8CF8' } }
                        ] },*/
                        { name: 'Dummy', classes: ['gantt-dummy-row'], content: '<i class="fa fa-file-code-o" ng-click="scope.handleRowIconClick(row.model)"></i> {{row.model.name}}' },
                        { name: 'Create concept', tasks: [
                            { name: 'Create concept',  content: '<i class="fa fa-cog" ng-click="scope.handleTaskIconClick(task.model)"></i> {{task.model.name}}', color: '#F1C232', from: new Date( 2013, 9, 10 ), to: new Date( 2013, 9, 13 ), est: new Date( 2013, 9, 8 ), lct: new Date( 2013, 9, 18 ),
                                progress: 100, data: {isMax: true} }
                        ]},
                        { name: 'Finalize concept', tasks: [
                            { name: 'Finalize concept', color: '#F1C232', from: new Date( 2013, 9, 17 ), to: new Date( 2013, 9, 18 ) }
                        ] },
                        { name: 'Development', children: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4'], content: '<i class="fa fa-file-code-o" ng-click="scope.handleRowIconClick(row.model)"></i> {{row.model.name}}' },
                        { name: 'Sprint 1', tooltips: false, tasks: [
                            { name: 'Product list view', color: '#F1C232', from: new Date( 2013, 9, 21 ), to: new Date( 2013, 9, 25 ),
                                progress: 25 }
                        ] },
                        { name: 'Sprint 2', classes: ['sprint2'], tasks: [
                            { name: 'Order basket', color: '#F1C232', classes:['order'], from: new Date( 2013, 9, 28 ), to: new Date( 2013, 10, 1 ) }
                        ] },
                        { name: 'Sprint 3', tasks: [
                            { name: 'Checkout', color: '#F1C232', from: new Date( 2013, 10, 4 ), to: new Date( 2013, 10, 8 ) }
                        ] },
                        { name: 'Sprint 4', tasks: [
                            { name: 'Login & Signup & Admin Views', color: '#F1C232', from: new Date( 2013, 10, 11 ), to: new Date( 2013, 10, 15 ) }
                        ] },
                        { name: 'Hosting' },
                        { name: 'Setup', tasks: [
                            { name: 'HW', color: '#F1C232', from: new Date( 2013, 10, 18 ), to: new Date( 2013, 10, 18 ) }
                        ] },
                        { name: 'Config', tasks: [
                            { name: 'SW / DNS/ Backups', color: '#F1C232', from: new Date( 2013, 10, 18 ), to: new Date( 2013, 10, 21 ) }
                        ] },
                        { name: 'Server', parent: 'Hosting', children: ['Setup', 'Config'] },
                        { name: 'Deployment', parent: 'Hosting', tasks: [
                            { name: 'Depl. & Final testing', color: '#F1C232', from: new Date( 2013, 10, 21 ), to: new Date( 2013, 10, 22 ), 'classes': 'gantt-task-deployment' }
                        ] },
                        { name: 'Workshop', tasks: [
                            { name: 'On-side education', color: '#F1C232', from: new Date( 2013, 10, 24 ), to: new Date( 2013, 10, 25 ) }
                        ] },
                        { name: 'Content', tasks: [
                            { name: 'Supervise content creation', color: '#F1C232', from: new Date( 2013, 10, 26 ), to: new Date( 2013, 10, 29 ) }
                        ] },
                        { name: 'Documentation', tasks: [
                            { name: 'Technical/User documentation', color: '#F1C232', from: new Date( 2013, 10, 26 ), to: new Date( 2013, 10, 28 ) }
                        ] }
                    ];
            },
            getSampleTimespans: function() {

                return [
                        {
                            from: new Date( 2013, 9, 21 ),
                            to: new Date( 2013, 9, 25 ),
                            name: 'Sprint 1 Timespan'

                            //priority: undefined,
                            //classes: [],
                            //data: undefined
                        }
                    ];
            }
        };
    })
;
