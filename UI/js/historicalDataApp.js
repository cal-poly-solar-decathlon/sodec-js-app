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

    var deviceHistoricalDataArrays = {
        "January" : [],
        "February" : [],
        "March" : [],
        "April" : [],
        "May" : [],
        "June" : [],
        "July" : [],
        "August" : [],
        "September" : [],
        "October" : [],
        "November" : [],
        "December" : []
    };

    function fillHistoricalDataArrays($http) {

        for (var i = 0; i < deviceList.length; i++) {
            var id = deviceList[i];
            http.get(sodecUrl("latest-event","?measurement="+measurement+"&device="+id))
                .then((function(id,latestResponse){
                    updateFn(scope,id,latestResponse.data);
                }).bind(undefined,id))
        }
    }

    // construct a sodec url
    function sodecUrl(endpoint,queryStr){
        // I want a way to accept the query as an array and validate it...
        return "http://"+HOST+":"+PORT+"/srv/"+endpoint+queryStr;
    }

    var app = angular.module("SolarHouseHistoricalDataApp", ['ngRoute', 'chart.js'])
        .config(function($routeProvider){
            $routeProvider
                .when('/tempHistory', {templateUrl:'./partials/tempHistory.html'})
                .when('/humHistory', {templateUrl:'./partials/humHistory.html'})
                .when('/elecUseHistory', {templateUrl:'./partials/elecUseHistory.html'})
                .when('/lightLevelHistory', {templateUrl:'./partials/lightLevelHistory.html'})
                .when('/occHistory', {templateUrl:'./partials/occHistory.html'})
                .when('/tempHistory/august/', {templateUrl:"./partials/tempHistory/august2015.html"})
                .when('/tempHistory/september/', {templateUrl:"./partials/tempHistory/september2015.html"})
                .when('/tempHistory/october/', {templateUrl:"./partials/tempHistory/october2015.html"})
                .otherwise({redirectTo:'/home', templateUrl:'./partials/home.html'});
        })

    function daysInMonth(month, year) {
        return new Date(year, month, 0).getDate();
    }

    function getMonthNumber(month) {
        switch(month) {
            case "January":
                return 0;
                break;
            case "February":
                return 1;
                break;
            case "March":
                return 2;
                break;
            case "April":
                return 3;
                break;
            case "May":
                return 4;
                break;
            case "June":
                return 5;
                break;
            case "July":
                return 6;
                break;
            case "August":
                return 7;
                break;
            case "September":
                return 8;
                break;
            case "October":
                return 9;
                break;
            case "November":
                return 10;
                break;
            case "December":
                return 11;
                break;
        }
    }

    function getMeanByInterval($http, measurement, device, start, end, interval, month, year)
    {
        //get full month data
        console.log("Days in Month " + month + ": " + daysInMonth(getMonthNumber(month), year));

        if(month && year) {
            start = new Date(year, getMonthNumber(month), 1).getTime() / 1000;
            end = new Date(year, getMonthNumber(month), daysInMonth(getMonthNumber(month), year)).getTime() / 1000;
        }

        console.log("start: " + start);
        console.log("end: " + end);

        return $http.get(sodecUrl("mean-by-interval","?measurement=" + measurement + "&device=" + device + "&start=" + start + "&end=" + end + "&interval=" + interval))
            .then(function(historicalData) {
                //console.log("MONTH DATA: " + month);
                console.log(historicalData);
                for(var i = 0; i <  historicalData.data.length; i++) {
                    console.log(historicalData.data[i].r);
                    if (historicalData.data[i].r)
                        deviceHistoricalDataArrays[month].push(historicalData.data[i].r);
                    else {
                        //console.log("MONTHO: " + month);
                        deviceHistoricalDataArrays[month].push(-100);
                    }
                }
            });
    }

    app.controller('viewController', ['$scope', '$location', '$http', '$routeParams', function($scope, $location, $http) {
        $scope.setRoute = function(route){
            $location.path(route);
        }

        //$scope.year = $routeParams.year;

        getMeanByInterval($http, 'temperature', 'bedroom', 1441065600, 1443577325, 86000, "August", 2015)
            .then(function() {

                console.log("Fetching August Data");

                var augustLabels = [];
                for(var augday = 1; augday <= 31; augday++) {
                    augustLabels.push(augday);
                }

                $scope.tempDataGraphAug = {
                    "data": [deviceHistoricalDataArrays["August"]],
                    "labels": augustLabels,
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
            });

        //use scope to make year dynamic, so it can be binded to page and path easily

        getMeanByInterval($http, 'temperature', 'bedroom', 1441065600, 1443577325, 86000, "September", 2015)
            .then(function() {
                var septemberLabels = [];
                for(var septday = 1; septday <= 30; septday++) {
                    septemberLabels.push(septday);
                }

                $scope.tempDataGraphSept = {
                    "data": [deviceHistoricalDataArrays["September"]],
                    "labels": septemberLabels,
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
            });

        getMeanByInterval($http, 'temperature', 'bedroom', 1441065600, 1443577325, 86000, "October", 2015)
            .then(function() {
                console.log("Fetching October Data");
                var octoberLabels = [];
                for(var octday = 1; octday <= 31; octday++) {
                    octoberLabels.push(octday);
                }

                $scope.tempDataGraphOct = {
                    "data": [deviceHistoricalDataArrays["October"]],
                    "labels": octoberLabels,
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
            });

        $scope.deviceHistoricalDataIsEmpty = function(historicalDataArray) {
            if(historicalDataArray.length == 0) {
                return true;
            }

            for(var i = 0; i < historicalDataArray.length; i++) {
                if(historicalDataArray[i] != -100) {
                    return false;
                }
            }

            return true;
        }

    }])
})
();