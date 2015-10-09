'use strict';

/**
 * @ngdoc overview
 * @name angularGanttDemoApp
 * @description
 * # angularGanttDemoApp
 *
 * Main module of the application.
 */

angular.module( 'angularGanttDemoApp', [
    'gantt', // angular-gantt.
    'gantt.sortable',
    'gantt.movable',
    'gantt.drawtask',
    'gantt.tooltips',
    'gantt.bounds',
    'gantt.progress',
    'gantt.table',
    'gantt.tree',
    'gantt.groups',
    'gantt.overlap',
    'gantt.resizeSensor',
    'ngAnimate',
    'mgcrea.ngStrap'
]).config(['$compileProvider', function( $compileProvider ) {

    $compileProvider.debugInfoEnabled( false ); // Remove debug info (angularJS >= 1.3)
}]);

angular.element(function() {

    var $ = angular.element;

    $.contextMenu({

        // define which elements trigger this menu
        selector: '.gantt-task',

        // define the elements of the menu
        items: {
            foo: {
                name: 'Delete',
                callback: function( key, opt ) {

                    // alert( 'Foo!' );

                    $( this ).trigger( 'contextMenuClick' );
                }
            }
        }
    });
});
