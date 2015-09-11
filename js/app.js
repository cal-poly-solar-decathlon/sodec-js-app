/**
 * Created by skahal on 8/28/15.
 */
(function() {

  var HOST = 'calpolysolardecathlon.org';
  var PORT =  8080;
  // temperature expressed in tenths of degrees:
  var TEMPERATURE_CONCERN_THRESHOLD = 300;
  var HUMIDITY_CONCERN_THRESHOLD = 900;

  // construct a sodec url
  function sodecUrl(endpoint,queryStr){
    // I want a way to accept the query as an array and validate it...
    return "http://"+HOST+":"+PORT+"/srv/"+endpoint+queryStr;
  }

  var app = angular.module("SolarHouseApp", ['chart.js']);
  var deviceLatestResponses = {};

  // return the update function to use with this id
  function findUpdateFunction(id){
    if (id.indexOf('s-temp') === 0) {
      return updateTemperatureDisplay(id);
    } else if (id.indexOf('s-hum') === 0) {
      return updateHumidityDisplay(id);
    } else if (id.indexOf('s-elec-used') === 0) {
      return updateElectricityUsedDisplay(id);
    } else if (id.indexOf('s-elec-gen') === 0) {
      return updateElectricityGeneratedDisplay(id);
    } else {
      return ignoreData(id);
    }
  }

  // update the display of the given temperature with the given reading
  function updateTemperatureDisplay(id){
    return (function (scope,reading){
      scope.s_temp_obj_display[id] = reading/10;
      scope.s_temp_obj_concern[id] =
        ((reading > TEMPERATURE_CONCERN_THRESHOLD) ? "concern" : "no_concern");
    })
  }

  // update the display of the given humidity with the given reading
  function updateHumidityDisplay(id){
    return (function (scope,reading) {
      scope.s_hum_obj_display[id] = reading/10;
      scope.s_hum_obj_concern[id] =
        ((reading > HUMIDITY_CONCERN_THRESHOLD) ? "concern" : "no_concern");
    })
  }

  // update the display of the given electricity usage
  function updateElectricityUsedDisplay(id){
    return (function (scope,reading) {
      // INCOMPLETE: NEED TO TAKE DIFFERENCE FROM AN HOUR AGO...
      scope.s_elec_use_obj_display[id] = reading/1000;
      /*scope.s_hum_obj_concern[id] =
        ((reading > HUMIDITY_CONCERN_THRESHOLD) ? "concern" : "no_concern"); */
    })
  }

  // update the display of the given electricity generation
  function updateElectricityGeneratedDisplay(id){
    return (function (scope,reading) {
    // INCOMPLETE: NEED TO TAKE DIFFERENCE FROM AN HOUR AGO...
    scope.s_elec_gen_obj_display[id] = reading/1000;
    /*scope.s_hum_obj_concern[id] =
      ((reading > HUMIDITY_CONCERN_THRESHOLD) ? "concern" : "no_concern"); */
    })
  }

  // don't do anything with this data...
  function ignoreData() {
    return (function () {
      // do nothing!
    })
  }

  app.controller("SolarHouseController", function($scope, $http) {
    $scope.s_temp_obj_display = [];
    $scope.s_temp_obj_concern = [];
    $scope.s_hum_obj_display = [];
    $scope.s_hum_obj_concern = [];
    $scope.s_elec_use_obj_display = [];
    $scope.s_elec_use_obj_concern = [];
    $scope.s_elec_gen_obj_display = [];
    $scope.s_elec_gen_obj_concern = [];

    $http.get(sodecUrl("list-old-device-ids",""))
      .then(function(response) {
        console.log("list of devices");
        console.log(response);
        var deviceList = response.data
        for(var i = 0; i < deviceList.length; i++) {
          var id = response.data[i];
          var updateFunction = findUpdateFunction(id);
          $http.get(sodecUrl("latest-event","?device="+id))
            .then((function (updateFunction) (function (latestResponse) {
              var reading = parseInt(latestResponse.data);
              updateFunction($scope,reading);
            }))(updateFunction))
        }
      })
  });
})
();
