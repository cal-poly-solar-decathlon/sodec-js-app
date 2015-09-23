/**
 * Created by shubhamkahal on 9/17/2015.
 */
(function() {

    var HOST = 'calpolysolardecathlon.org';
    var PORT =  3000;
    // temperature expressed in degrees:
    var TEMPERATURE_CONCERN_THRESHOLD = 20.0;
    var HUMIDITY_CONCERN_THRESHOLD = 90.0;
    var ELECTRIC_USE_CONCERN_THRESHOLD = 400.0;

    // these are the temperature and humidity devices
    var TEMP_HUM_DEVICES = [
        "living_room",
        "bedroom",
        "kitchen",
        "outside",
        "bathroom"];

    // these are the electric power devices
    var ELECTRIC_POWER_DEVICES = [
        "laundry",
        "dishwasher",
        "refrigerator",
        "induction_stove",
        "water_heater",
        "kitchen_outlets_1",
        "kitchen_outlets_2",
        "living_room_outlets",
        "dining_room_outlets_1",
        "dining_room_outlets_2",
        "bathroom_outlets",
        "bedroom_outlets_1",
        "bedroom_outlets_2",
        "mechanical_room_outlets",
        "entry_hall_outlets",
        "exterior_outlets",
        "greywater_pump",
        "blackwater_pump",
        "thermal_loop_pump",
        "water_supply_pump",
        "water_supply_booster_pump",
        "vehicle_charging",
        "heat_pump",
        "air_handler"];

    var ELECTRIC_POWER_GENERATION_DEVICES = [
        "main_solar_array",
        "bifacial_solar_array"];

    // this table maps measurement name (e.g. 'temperature') to the devices that
    // belong to that measurement
    var DEVICE_TABLE = {
        temperature : TEMP_HUM_DEVICES,
        humidity : TEMP_HUM_DEVICES,
    };

    // construct a sodec url
    function sodecUrl(endpoint,queryStr){
        // I want a way to accept the query as an array and validate it...
        return "http://"+HOST+":"+PORT+"/srv/"+endpoint+queryStr;
    }

    var app = angular.module("SolarHouseHistoricalDataApp", ['ngRoute', 'chart.js'])
        .config(function($routeProvider){
            $routeProvider
                .when('/tempHistory', {templateUrl:'../partials/tempHistory.html'})
                .when('/humHistory', {templateUrl:'../partials/humHistory.html'})
                .when('/elecUseHistory', {templateUrl:'../partials/elecUseHistory.html'})
                .when('/lightLevelHistory', {templateUrl:'../partials/lightLevelHistory.html'})
                .when('/occHistory', {templateUrl:'../partials/occHistory.html'})
                .when('/tempHistory/january/', {templateUrl:"../partials/tempHistory/january2015.html"})
                .when('/tempHistory/february/', {templateUrl:"../partials/tempHistory/february2015.html"})
                /*.when('/tempHistory/january/:year*',
                {templateUrl:function(urlattr){
                    return urlattr.year + '.html';
                }, controller: 'viewController'})
                .when('/tempHistory/february/:year*',
                {templateUrl:function(urlattr){
                    return urlattr.year + '.html';
                }, controller:'viewController'})*/
                .otherwise({redirectTo:'/home', templateUrl:'..partials/home.html'});
        })

    function getMeanByInterval($http, $scope, measurement, device, start, end, interval)
    {
        $http.get(sodecUrl("mean-by-interval","?measurement=" + measurement + "&device=" + device + "&start=" + start + "&end=" + end + "&interval=" + interval))
            .then(function(data) {
                console.log(data);
                $scope.tempHistoryData = data;
            });
    }

    app.controller('viewController', ['$scope', '$location', '$http', '$routeParams', function($scope, $location, $http, $routeParams) {
        $scope.setRoute = function(route){
            $location.path(route);
        }

        $scope.year = $routeParams.year;

        //getMeanByInterval($http, $scope, 'temperature', 'bedroom', 1442281115, 1442282115, 400);

        var janLabels = [];
        for(var day = 1; day <= 31; day++)
        {
            janLabels.push(day);
        }

        $scope.tempDataGraphJan = {
            "data": [[65, 59, 80, 81, 56, 55, 40, 28, 48, 40, 19, 86, 27, 90, 65, 59, 80, 81,
                56, 55, 40, 28, 48, 40, 19, 86, 27, 90, 65, 59, 80]],
            "labels": janLabels,
            onClick : function (points, evt) {
                console.log(points, evt)
            },
            "colours": [{
                "fillColor": "rgba(251,176,64, .3)",
                "strokeColor": "rgba(0,78,56,1)",
                "pointColor": "black",
                "pointStrokeColor": "#fff",
                "pointHighlightFill": "#fff",
                "pointHighlightStroke": "rgba(151,187,205,0.8)"
            }]
        };
    }])
})
();