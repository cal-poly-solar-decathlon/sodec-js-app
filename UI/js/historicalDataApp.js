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
        "air_handler",
        "main_solar_array",
        "bifacial_solar_array"];

    // this table maps measurement name (e.g. 'temperature') to the devices that
    // belong to that measurement
    var DEVICE_TABLE = {
        "temperature": TEMP_HUM_DEVICES,
        "humidity": TEMP_HUM_DEVICES,
        "electric_power": ELECTRIC_POWER_DEVICES
    };

    var monthsOfYear = ["January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"];

    var deviceHistoricalDataArray = {
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
                .when('/tempHistory/index', {templateUrl:"./partials/tempHistory/index.html"})
                .otherwise({redirectTo:'/home', templateUrl:'./partials/home.html'});
        })

    function daysInMonth(month, year) {
        var monthStart = new Date(year, month, 1);
        var monthEnd = new Date(year, month + 1, 1);
        var monthLength = (monthEnd - monthStart) / (1000 * 60 * 60 * 24);
        return monthLength;
    }

    function getMonthNumber(month) {
        switch(month) {
            case "January":
                return 0;
            case "February":
                return 1;
            case "March":
                return 2;
            case "April":
                return 3;
            case "May":
                return 4;
            case "June":
                return 5;
            case "July":
                return 6;
            case "August":
                return 7;
            case "September":
                return 8;
            case "October":
                return 9;
            case "November":
                return 10;
            case "December":
                return 11;
        }
    }

    function calculateLabels(month, year) {
        var labels = [];
        for(var i = 1; i <= daysInMonth(getMonthNumber(month), year); i++) {
            labels.push(i);
        }

        return labels;
    }

    function getMeanByInterval($http, $scope, measurement, device, interval, month, year, start, end)
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
                console.log("PRINT ONE");
                console.log(historicalData);
                deviceHistoricalDataArray[month] = [];
                for(var i = 0; i <  historicalData.data.length; i++) {
                    console.log(historicalData.data[i].r);
                    if (historicalData.data[i].r)
                        deviceHistoricalDataArray[month].push(historicalData.data[i].r);
                    else {
                        deviceHistoricalDataArray[month].push(-100);
                    }
                }

                console.log(deviceHistoricalDataArray[month]);

                var labels = calculateLabels(month, year);

                console.log(labels);

                $scope.displayData = {
                    "data": [deviceHistoricalDataArray[month]],
                    "labels": labels,
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
                    }],
                    "month": month,
                    "year": year
                };
            });
    }

    app.controller('viewController', ['$scope', '$location', '$http', '$routeParams', function($scope, $location, $http) {
        var vm = this;

        $scope.setRoute = function(route){
            $location.path(route);
        };

        $scope.sensorButtonText = "Temperature";

        $scope.updateSensorButtonText = function(choice){
            $scope.sensorButtonText = choice;
        };

        $scope.yearButtonText = "2015";

        $scope.updateYearButtonText = function(choice){
            $scope.yearButtonText = choice;
            $scope.year = parseInt($scope.yearButtonText);
        };

        $scope.monthButtonText = "September";

        $scope.updateMonthButtonText = function(choice){
            $scope.monthButtonText = choice;
            $scope.month = choice;
        };

        $scope.month = $scope.monthButtonText;

        $scope.year = parseInt($scope.yearButtonText);

        $scope.deviceHistoricalDataIsEmpty = function(deviceHistoricalDataArray) {

            if(deviceHistoricalDataArray.length == 0) {
                return true;
            }

            for(var i = 0; i < deviceHistoricalDataArray.length; i++) {
                if(deviceHistoricalDataArray[i] != -100) {
                    return false;
                }
            }

            return true;
        }

        $scope.obtainHistoricalData = function(measurement, device, interval, month, year, start, end) {
            getMeanByInterval($http, $scope, measurement, device, interval, month, year, start, end);
        }

        $scope.obtainHistoricalData('temperature', 'bedroom', 86000, "September", 2015);
        $location.path("tempHistory/index");

    }])
})
();