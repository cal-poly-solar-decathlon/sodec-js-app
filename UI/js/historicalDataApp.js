/**
 * Created by shubhamkahal on 9/17/2015.
 */
angular.module("SolarHouseHistoricalDataApp", ['ngRoute'])
    .config(function($routeProvider){
        $routeProvider
            .when('/tempHistory', {templateUrl:'../partials/tempHistory.html'})
            .when('/humHistory', {templateUrl:'../partials/humHistory.html'})
            .when('/elecUseHistory', {templateUrl:'../partials/elecUseHistory.html'})
            .when('/lightLevelHistory', {templateUrl:'../partials/lightLevelHistory.html'})
            .when('/occHistory', {templateUrl:'../partials/occHistory.html'})
            .otherwise({redirectTo:'/home', templateUrl:'..partials/home.html'})
    })
    .controller('viewController', ['$scope', '$location', function($scope, $location) {
        $scope.setRoute = function(route){
            $location.path(route);
        }
    }]);