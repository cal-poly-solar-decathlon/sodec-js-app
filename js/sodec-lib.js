var SODECLIB =
(function() {

  

  var HOST = 'calpolysolardecathlon.org';
  var PORT =  3000;
  // temperature expressed in tenths of degrees:
  var TEMPERATURE_CONCERN_THRESHOLD = 300;
  var HUMIDITY_CONCERN_THRESHOLD = 900;

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
    temperature : TEMP_HUM_DEVICES,
    humidity : TEMP_HUM_DEVICES,
    electric_power : ELECTRIC_POWER_DEVICES
  };

  // this table maps measurement names to the corresponding update functions
  var UPDATE_FN_TABLE = {
    temperature : updateTemperatureDisplay,
    humidity : updateHumidityDisplay,
    electric_power : updateElectricPowerDisplay
  };

  /* messing around with fully dynamic generation of rows. Ignore for now...
  var electric_titles = ELECTRIC_POWER_DEVICES.map(deviceToTitle);

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // map a device name such as "heat_pump" to a
  // record containing the device and a title such as "Heat Pump"
  function deviceToTitle(device){
    var words = device.split(/_/);
    var upcasewords = words.map(capitalizeFirstLetter)
    return {device:device,title:upcasewords.join(" ")};

  }

  var ROW_LEN = 9;

  var t1 = [];
  var t2 = []
  for(i=0;i < ROW_LEN; i++) {
    t1.push('<th class="text-center">'+electric_titles[i].title+'</th>');
    t2.push()
  }
  $('#electric-titles-1').append(t1.join('\n'));

  //var l1 = $('#electric-readings-1');
  //l1.html('WHEE')
*/

  // construct a sodec url
  function sodecUrl(endpoint,queryStr){
    // I want a way to accept the query as an array and validate it...
    return "http://"+HOST+":"+PORT+"/srv/"+endpoint+queryStr;
  }

  var app = angular.module("SolarHouseApp", ['chart.js']);

  // update the display of the given temperature with the given reading
  function updateTemperatureDisplay(scope,id,reading){
    if (reading === "no events"){
      scope.s_temp_obj_display[id] = "n/a";
      scope.s_temp_obj_concern[id] = "no_concern";
    } else {
      scope.s_temp_obj_display[id] = parseInt(reading)/10;
      scope.s_temp_obj_concern[id] =
        ((reading > TEMPERATURE_CONCERN_THRESHOLD) ? "concern" : "no_concern");
    }
  }

  // update the display of the given humidity with the given reading
  function updateHumidityDisplay(scope,id,reading){
    if (reading === "no events"){
      scope.s_hum_obj_display[id] = "n/a";
      scope.s_hum_obj_concern[id] = "no_concern";
    } else {
      scope.s_hum_obj_display[id] = parseInt(reading)/10;
      scope.s_hum_obj_concern[id] =
        ((reading > HUMIDITY_CONCERN_THRESHOLD) ? "concern" : "no_concern");
    }
  }

  // update the display of the given electricity usage
  function updateElectricPowerDisplay(scope,id,reading){
    // INCOMPLETE: NEED TO TAKE DIFFERENCE FROM AN HOUR AGO...
    scope.s_elec_obj_display[id] = parseInt(reading);
    /*scope.s_hum_obj_concern[id] =
      ((reading > HUMIDITY_CONCERN_THRESHOLD) ? "concern" : "no_concern"); */
  }


  // update all sensors associated with a measurement
  function updateAll(scope,http,measurement){
    var deviceList = DEVICE_TABLE[measurement];
    var updateFn = UPDATE_FN_TABLE[measurement];
    for (var i = 0; i < deviceList.length; i++) {
      var id = deviceList[i];
      http.get(sodecUrl("latest-event","?measurement="+measurement+"&device="+id))
        .then((function (id) (function(latestResponse){
          updateFn(scope,id,latestResponse.data);
        }))(id))
    }

  }

  app.controller("SolarHouseController", function($scope, $http) {
    $scope.s_temp_obj_display = [];
    $scope.s_temp_obj_concern = [];
    $scope.s_hum_obj_display = [];
    $scope.s_hum_obj_concern = [];
    $scope.s_elec_obj_display = [];
    $scope.s_elec_obj_concern = [];

    updateAll($scope,$http,'temperature');
    updateAll($scope,$http,'humidity');
    updateAll($scope,$http,'electric_power');

  });

  return {
    fugu : 9
  }
})
();