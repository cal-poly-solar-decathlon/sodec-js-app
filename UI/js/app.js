/**
 * Created by skahal on 8/28/15.
 */
(function() {

  // I think all of this code is massively cavalier in its handling
  // of responses to the HTTP requests that it makes.

  var HOST = 'calpolysolardecathlon.org';
  var PORT =  3000;
  // temperature expressed in degrees:
  var TEMPERATURE_CONCERN_LO_THRESHOLD = 20.0;
  var HUMIDITY_CONCERN_THRESHOLD = 50.0;
  var ELECTRIC_USE_CONCERN_THRESHOLD = 400.0;

  var SECONDS_IN_DAY = 86400;
  var SECONDS_IN_HOUR = 3600;

  // these are the temperature and humidity devices
  var TEMP_HUM_DEVICES = [
    "living_room",
    "bedroom",
    "kitchen",
    "outside",
    "bathroom"];

  // these are the electric power devices
  // ... actually, no they're not.
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

  // this table maps measurement names to the corresponding update functions
  var UPDATE_FN_TABLE = {
    temperature : updateTemperatureDisplay,
    humidity : updateHumidityDisplay,
  };

  var app = angular.module("SolarHouseApp", ['chart.js']);

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
  function sodecUrl(endpoint,queryArr){
    // I want a way to accept the query as an array and validate it...
    return "http://"+HOST+":"+PORT+"/srv/"+endpoint+formatQueryParameters(queryArr);
  }

  // crude parameter formatting
  // no sanitizing for now...
  // takes an array of {p,v} pairs
  function formatQueryParameters(params){
    return "?"+params.map(function(pv){return pv.p + "=" + pv.v}).join("&");
  }

  // most pathetic testing ever...
  // console.log(formatQueryParameters([{p:"boo",v:"234"},{p:"zagbar",v:2341}]) ===  '?boo=234&zagbar=2341');

  function getForecast($http) {
    $http.get(sodecUrl("latest-forecast",[]))
        .then (function (forecastResponse) {
      var forecast = forecastResponse.data;
      var timestamp = forecast.timestamp;
      $('#insights').html('stomp stomp stomp');
    })
  }

  // timestamp in seconds
  function updateElectricGenerationDay(scope,http,device,ts,currentReading) {
    http.get(sodecUrl("first-by-interval",
        [{p:"measurement",v:"electric_power"},
          {p:"device",v:device},
          {p:"start",v:ts - SECONDS_IN_DAY},
          {p:"end",v:ts},
          {p:"interval",v:SECONDS_IN_DAY}]))
        .then(function(result){
          var table = result.data;
          var lastrow = table[table.length-1];
          var wattseconds = currentReading - lastrow.r;
          var kwh = wattseconds / (1000 * SECONDS_IN_HOUR);
          var kwhDisplay = Math.round(kwh * 10)/10;
          scope.elec_gen.day[device] = kwhDisplay;
        })
  }


  function updateElectricGenerationWeek(scope,http,device,ts,currentReading) {
    http.get(sodecUrl("first-by-interval",
        [{p:"measurement",v:"electric_power"},
          {p:"device",v:device},
          {p:"start",v:ts - SECONDS_IN_MONTH},
          {p:"end",v:ts},
          {p:"interval",v:SECONDS_IN_MONTH}]))
        .then(function(result){
          var table = result.data;
          var lastrow = table[table.length-1];
          var wattseconds = currentReading - lastrow.r;
          var kwh = wattseconds / (1000 * SECONDS_IN_HOUR);
          var kwhDisplay = Math.round(kwh * 10)/10;
          scope.elec_gen.week[device] = kwhDisplay;
        })
  }

  // update all time scales for electric generation for one device
  function updateElectricGeneration($scope,$http,device,ts,
                                    currentReading) {
    $http.get(sodecUrl("latest-event",
        [{p:"measurement",v:"electric_power"},
          {p:"device",v:device}]))
        .then (function (result) {
      var currentReading = result.data;
      updateElectricGenerationDay($scope,$http,device,ts,
          currentReading);
      /* updateElectricGenerationWeek($scope,$http,device,ts,
       currentReading) */
    })
  }


  // readings older than 5 minutes really shouldn't be displayed
  // as current

  var SOMEWHAT_CURRENT = (5 * 60);

  // compute the "instantaneous" power use of a device
  // returns a number representing average watts or "no events"
  function electricUse(scope,http,device,isGeneration) {
    // silly to fetch this over and over again...
    http.get(sodecUrl("timestamp",[]))
        .then(function(timestampResponse){
          var ts = timestampResponse.data.timestamp;
          var ts5 = ts - SOMEWHAT_CURRENT;
          http.get(sodecUrl("events-in-range",
              [{p:"measurement",v:"electric_power"},
                {p:"device",v:device},
                {p:"start",v:ts5},
                {p:"end",v:ts}]))
              .then(function(eventsResponse) {
                var events = eventsResponse.data;
                if (events.length < 2) {
                  return "no events";
                } else {
                  var lastIdx = events.length - 1;
                  var readingDiff = (events[lastIdx].r - events[lastIdx-1].r);
                  var timeDiff = (events[lastIdx].t - events[lastIdx-1].t) / 1000.0;
                  var instWatts = (readingDiff / timeDiff);
                  updateElectricPowerDisplay(scope,device,instWatts,isGeneration);
                }
              })
        })
  }

  // update the display of the given temperature with the given reading
  // (reading is raw data from http)
  function updateTemperatureDisplay(scope,id,reading){
    if (reading === "no events"){
      scope.s_temp_obj_display[id] = "n/a";
      scope.s_temp_obj_concern[id] = "no_concern";
    } else {
      var numReading = parseInt(reading)/10
      scope.s_temp_obj_display[id] = numReading + "°";
      scope.s_temp_obj_concern[id] =
          "no_concern"
        //((numReading > TEMPERATURE_CONCERN_THRESHOLD) ? "concern" : "no_concern")
      ;
    }
  }

  // update the display of the given humidity with the given reading
  function updateHumidityDisplay(scope,id,reading){
    if (reading === "no events"){
      scope.s_hum_obj_display[id] = "n/a";
      scope.s_hum_obj_concern[id] = "no_concern";
    } else {
      var numReading = parseInt(reading)/10
      scope.s_hum_obj_display[id] = numReading + "%";
      scope.s_hum_obj_concern[id] =
          ((numReading > HUMIDITY_CONCERN_THRESHOLD) ? "concern" : "no_concern");
    }
  }

  // update the display of the given electricity usage given a reading *as a number*
  function updateElectricPowerDisplay(scope,id,reading,isGeneration){
    var roundedReading = Math.round(reading * 10) / 10;
    scope.elec_use[id] = roundedReading;
    if (isGeneration) {
      scope.elec_concern[id] = "no_concern";
    } else {
      scope.elec_concern[id] =
          ((reading > ELECTRIC_USE_CONCERN_THRESHOLD) ? "concern" : "no_concern");
    }
  }


  // update all sensors associated with a measurement using instantaneous
  // reading. NOT FOR USE WITH ELECTRIC POWER; these readings are cumulative
  // watt-seconds.
  function updateSome(scope,http,measurement){
    var deviceList = DEVICE_TABLE[measurement];
    var updateFn = UPDATE_FN_TABLE[measurement];
    for (var i = 0; i < deviceList.length; i++) {
      var id = deviceList[i];
      http.get(sodecUrl("latest-event",
          [{p:"measurement",v:measurement},
            {p:"device",v:id}]))
          .then((function(id,latestResponse){
            updateFn(scope,id,latestResponse.data);
          }).bind(undefined,id))
    }
  }

  // update all electric sensors. For these, we need to take the "derivative"
  // (actually just the difference in the last two readings / time-diff
  function updateAllElectric(scope,http,ts) {
    var deviceList = ELECTRIC_POWER_DEVICES;
    deviceList.map(function(device) {
      electricUse(scope,http,device,false,ts);
    })
    var deviceListGen = ELECTRIC_POWER_GENERATION_DEVICES;
    deviceListGen.map(function(device) {
      electricUse(scope,http,device,true,ts);
    })
  }

  // update the insights section
  function updateInsights($http) {
    $http.get(sodecUrl("latest-insights",[]))
        .then (function(response){
      var insights = response.data;
      var insightItems = insights.map(renderInsightText)
      $("#comfortInsights").html("<ul>"+insightItems.join("\n")+"</ul>");
    })
  }

  // render an insight using red if it's priority 50 or higher
  function renderInsightText(insight) {
    var text = (insight.p > 50
        ? ("<span class='highPriority'>"+insight.m+"</span>")
        : (insight.m))
    return "<li>"+text+"</li>";
  }

  // update all of the page
  function updatePage($scope,$http){
    updateSome($scope,$http,'temperature');
    updateSome($scope,$http,'humidity');
    updateInsights($http);
    $http.get(sodecUrl("timestamp",[]))
        .then (function (result) {
      var ts = result.data.timestamp;
      updateElectricGeneration($scope,$http,"main_solar_array",ts)
      updateElectricGeneration($scope,$http,"bifacial_solar_array",ts)

      // not doing anything right now...
      //updateAllElectric($scope,$http,ts);
    })
  }

  app.controller("SolarHouseController", function($scope, $http) {
    $scope.s_temp_obj_display = {};
    $scope.s_temp_obj_concern = {};
    $scope.s_hum_obj_display = {};
    $scope.s_hum_obj_concern = {};
    $scope.elec_gen = {day:{},week:{}};
    $scope.elec_use = {};
    $scope.elec_concern = {};

    // update everything every fifteen seconds...
    var updater = updatePage.bind(undefined,$scope,$http);
    updater();
    setInterval(updater, 15000);

    /* SODECFORECAST.fetchForecast($http,function(forecast) {
     console.log(forecast);
     })*/
  });
})
();