/**
 * Created by shubhamkahal on 9/17/2015.
 */
(function() {

    var HOST = 'calpolysolardecathlon.org';
    var PORT =  3000;

    // these are the temperature and humidity devices
    var TEMP_HUM_DEVICES = [
        "living_room",
        "bedroom",
        "kitchen",
        "outside",
        "bathroom"];

    // these are the electric power devices
    /*
     - main_solar_array
     - bifacial_solar_array
     - laundry
     - dishwasher
     - refrigerator
     - induction_stove (Cooktop)
     - water_heater (Solar Water Heater)
     - mechanical_room_outlets
     - greywater_pump
     - blackwater_pump
     - thermal_loop_pump
     - water_supply_pump
     - water_supply_booster_pump
     - vehicle_charging
     - heat_pump (heat recovery ventilation)
     - air_handler (air handler outlets)
     - mains
     - air_conditioning
     - microwave
     - lighting_1
     - lighting_2
     */

    var deviceHistoricalDataArray = [];

    // construct a sodec url
    function sodecUrl(endpoint,queryStr){
        // I want a way to accept the query as an array and validate it...
        console.log("http://"+HOST+":"+PORT+"/srv/"+endpoint+queryStr);
        return "http://"+HOST+":"+PORT+"/srv/"+endpoint+queryStr;
    }

    var app = angular.module("SolarHouseHistoricalDataApp", ['ngRoute', 'chart.js'])
        .config(function($routeProvider){
            $routeProvider
                .when('/tempHistory', {templateUrl:'./partials/tempHistory/index.html'})
                .when('/humHistory', {templateUrl:'./partials/humHistory/index.html'})
                .when('/elecHistory', {templateUrl:'./partials/elecHistory/index.html'})
                .when('/lightLevelHistory', {templateUrl:'./partials/lightLevelHistory.html'})
                .when('/occHistory', {templateUrl:'./partials/occHistory.html'})
                .when('/tempHistory/index', {templateUrl:"./partials/tempHistory/index.html"})
                .when('/humHistory/index', {templateUrl:"./partials/humHistory/index.html"})
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

    function getMonthName(month) {
        switch(month) {
            case 0:
                return "January";
            case 1:
                return "February";
            case 2:
                return "March";
            case 3:
                return "April";
            case 4:
                return "May";
            case 5:
                return "June";
            case 6:
                return "July";
            case 7:
                return "August";
            case 8:
                return "September";
            case 9:
                return "October";
            case 10:
                return "November";
            case 11:
                return "December";
        }

    }

    function getCurrentMonth() {
        var d = new Date();
        return d.getMonth();
    }

    function getMonthFromEpoch(timeStamp) {
        var date = new Date(timeStamp * 1000);

        return date.getMonth();
    }

    function calculateEpochTimeForCurrentDate() {
        var d = new Date();
        return d.getTime() / 1000;
    }

    function calculateEpochTimeForWeekEarlierDate() {
        var d = new Date();
        var seconds = d.getTime() / 1000;
        return seconds - 604800;
    }

    function calculateWeekEpochTime(week, month, year) {
        var startOfMonth = new Date(year, getMonthNumber(month), 1).getTime() / 1000;
        var endOfMonth = new Date(year, getMonthNumber(month), daysInMonth(getMonthNumber(month), year)).getTime() / 1000;
        var weekEpochTime = [];

        switch(week) {
            case "Week 1":
                weekEpochTime = [startOfMonth, startOfMonth + 604800];
                break;
            case "Week 2":
                weekEpochTime = [startOfMonth + 604800, startOfMonth + 604800  + 604800];
                break;
            case "Week 3":
                weekEpochTime = [startOfMonth + 604800 + 604800, startOfMonth + 604800 + 604800 + 604800];
                break;
            case "Week 4":
                weekEpochTime = [startOfMonth + 604800 + 604800 + 604800, endOfMonth];
                break;
        }

        return weekEpochTime;
    }

    function getDayFromEpoch(timeInSeconds) {
        var d = new Date(timeInSeconds * 1000);
        return d.getDate();
    }

    function calculateLabels(start, end) {
        var labels = [];
        for(var i = start; i <= end; i += 86400) {
            for(var j = 1; j <= 6; j++) {
                labels.push(j);
            }
            labels.push(getDayFromEpoch(i));
        }

        return labels;
    }

    function getMeanByInterval($http, $scope, measurement, device, interval, start, end)
    {
        if (!start && !end) {
            start = Math.round(calculateEpochTimeForWeekEarlierDate());
            end = Math.round(calculateEpochTimeForCurrentDate());
        }

        $scope.startTime = start;
        $scope.endTime = end;

        console.log("Month Number: " + getMonthFromEpoch(start));

        $scope.monthButtonTextPrevious = getMonthName(getMonthFromEpoch(start));
        $scope.monthPreviousDay = getDayFromEpoch(start);
        $scope.monthCurrentDay = getDayFromEpoch(end);
        $scope.monthButtonTextCurrent = getMonthName(getMonthFromEpoch(end));

        console.log("start: " + start);
        console.log("end: " + end);

        return $http.get(sodecUrl("mean-by-interval","?measurement=" + measurement + "&device=" + device + "&start=" + start + "&end=" + end + "&interval=" + interval))
            .then(function(historicalData) {
                deviceHistoricalDataArray = [];
                for(var i = 0; i <  historicalData.data.length; i++) {
                    console.log(historicalData.data[i].r);
                    if (historicalData.data[i].r)
                        deviceHistoricalDataArray.push((historicalData.data[i].r)/10);
                    else {
                        deviceHistoricalDataArray.push("");
                    }
                }

                var labels = calculateLabels(start, end);

                $scope.displayData = {
                    "data": [deviceHistoricalDataArray],
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
                };
            })
            .catch(function() {
                console.log("Something went wrong in the data fetch.");
            })
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

        $scope.monthButtonText = getMonthName(getCurrentMonth());

        $scope.updateMonthButtonText = function(choice){
            $scope.monthButtonText = choice;
            $scope.month = choice;
        };

        $scope.weekButtonText = "Week 1";

        $scope.updateWeekButtonText = function(choice){
            $scope.weekButtonText = choice;
            $scope.week = choice;
        };

        $scope.updateDeviceTempHum = function(choice) {
            $scope.deviceTempHum = choice;

            switch(choice) {
                case "bedroom":
                    $scope.displayDeviceTempHum = "Bedroom";
                    break;
                case "living_room":
                    $scope.displayDeviceTempHum = "Living Room";
                    break;
                case "kitchen":
                    $scope.displayDeviceTempHum = "Kitchen";
                    break;
                case "outside":
                    $scope.displayDeviceTempHum = "Outside";
                    break;
                case "bathroom":
                    $scope.displayDeviceTempHum = "Bathroom";
                    break;
            }
        }

        $scope.updateDeviceElec = function(choice) {
            $scope.deviceElec = choice;

            switch(choice) {
                case "main_solar_array":
                    $scope.displayDeviceElec = "Main Solar Array";
                    break;
                case "bifacial_solar_array":
                    $scope.displayDeviceElec = "Bifacial Solar Array";
                    break;
                case "laundry":
                    $scope.displayDeviceElec = "Laundry";
                    break;
                case "dishwasher":
                    $scope.displayDeviceElec = "Dishwasher";
                    break;
                case "refrigerator":
                    $scope.displayDeviceElec = "Bathroom";
                    break;
                case "induction_stove":
                    $scope.displayDeviceElec = "Cooktop";
                    break;
                case "water_heater":
                    $scope.displayDeviceElec = "Solar Water Heater";
                    break;
                case "mechanical_room_outlets":
                    $scope.displayDeviceElec = "Mechanical Room Outlets";
                    break;
                case "grey_water_pump":
                    $scope.displayDeviceElec = "Grey Water Pump";
                    break;
                case "blackwater_pump":
                    $scope.displayDeviceElec = "Black Water Pump";
                    break;
                case "thermal_loop_pump":
                    $scope.displayDeviceElec = "Thermal Loop Pump";
                    break;
                case "water_supply_pump":
                    $scope.displayDeviceElec = "Water Supply Pump";
                    break;
                case "water_supply_booster_pump":
                    $scope.displayDeviceElec = "Water Supply Booster Pump";
                    break;
                case "vehicle_charging":
                    $scope.displayDeviceElec = "Vehicle Charging";
                    break;
                case "heat_pump":
                    $scope.displayDeviceElec = "Heat Recovery Ventilation";
                    break;
                case "air_handler":
                    $scope.displayDeviceElec = "Air Handler Outlets";
                    break;
                case "mains":
                    $scope.displayDeviceElec = "Mains";
                    break;
                case "air_conditioning":
                    $scope.displayDeviceElec = "Air Conditioning";
                    break;
                case "microwave":
                    $scope.displayDeviceElec = "Microwave";
                    break;
                case "lighting_1":
                    $scope.displayDeviceElec = "Lighting 1";
                    break;
                case "lighting_2":
                    $scope.displayDeviceElec = "Lighting 2";
                    break;
            }

        }

        /*
         - main_solar_array
         - bifacial_solar_array
         - laundry
         - dishwasher
         - refrigerator
         - induction_stove (Cooktop)
         - water_heater (Solar Water Heater)
         - mechanical_room_outlets
         - greywater_pump
         - blackwater_pump
         - thermal_loop_pump
         - water_supply_pump
         - water_supply_booster_pump
         - vehicle_charging
         - heat_pump (heat recovery ventilation)
         - air_handler (air handler outlets)
         - mains
         - air_conditioning
         - microwave
         - lighting_1
         - lighting_2
         */

        $scope.month = $scope.monthButtonText;

        $scope.year = parseInt($scope.yearButtonText);

        $scope.week = $scope.weekButtonText;

        $scope.deviceTempHum = "bedroom";

        $scope.displayDeviceTempHum = "Bedroom";

        $scope.deviceTempHum = "bedroom";

        $scope.displayDeviceTempHum = "Bedroom";

        $scope.deviceElec = "main_solar_array";

        $scope.displayDeviceElec = "Main Solar Array";

        $scope.deviceHistoricalDataIsEmpty = function(deviceHistoricalDataArray) {

            if(deviceHistoricalDataArray.length == 0) {
                return true;
            }

            for(var i = 0; i < deviceHistoricalDataArray.length; i++) {
                if(deviceHistoricalDataArray[i] != "") {
                    return false;
                }
            }

            return true;
        };

        $scope.obtainHistoricalData = function(measurement, device, interval, start, end) {
            getMeanByInterval($http, $scope, measurement, device, interval, start, end);
        };

        $scope.timeInterval = 7200;
        $scope.obtainHistoricalData('temperature', 'bedroom', $scope.timeInterval);
        $location.path("tempHistory/index");

    }])
})
();