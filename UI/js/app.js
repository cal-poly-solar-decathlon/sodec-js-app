/**
 * Created by skahal on 8/28/15.
 */
(function() {

  var HOST = 'calpolysolardecathlon.org';
  var PORT =  3000;
  // temperature expressed in degrees:
  var TEMPERATURE_CONCERN_THRESHOLD = 20.0;
  var HUMIDITY_CONCERN_THRESHOLD = 90.0;
  var ELECTRIC_USE_CONCERN_THRESHOLD = 400.0;

  /* these are the temperature and humidity devices
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
  };*/

  // this table maps measurement names to the corresponding update functions

  var app = angular.module("SolarHouseHistoricalData", ['chart.js']);

  // construct a sodec url
  function sodecUrl(endpoint,queryStr){
    // I want a way to accept the query as an array and validate it...
    return "http://"+HOST+":"+PORT+"/srv/"+endpoint+queryStr;
  }

  function getMeanByInterval(measurement, device, start, ind, interval)
  {
    $http.get(sodecUrl("mean-by-interval","?measurement=" + measurement + "&device=" + device + "&start=" + start + "&ind=" + ind + "&interval=" + interval))
        .then(function(data) {
          console.log("data");
          console.log(data);
        });
  }

  app.controller("SolarHouseHistoricalDataController", function($scope) {
    $scope.tempHistoryData = getMeanByInterval('temperature', 'bedroom', '1442220000', '1442967707', '86400');
  });
})
();
