/**
 * Created by skahal on 8/28/15.
 */
(function() {

  // I think all of this code is massively cavalier in its handling
  // of responses to the HTTP requests that it makes. And indeed in not
  // delivering things like NaN to the sodec server.

  /*var HOST = 'calpolysolardecathlon.org';
  var PORT =  3000;*/
  var HOST = 'localhost';
  var PORT =  3000;

  // temperature expressed in degrees:
  var TEMPERATURE_CONCERN_LO_THRESHOLD = 20.0;
  var HUMIDITY_CONCERN_THRESHOLD = 50.0;
  var ELECTRIC_USE_CONCERN_THRESHOLD = 400.0;

  var SECONDS_IN_DAY = 86400;
  var SECONDS_IN_HOUR = 3600;
  var STALE_SECONDS = 6 * SECONDS_IN_HOUR;
  
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
    "microwave",
    "water_heater",
    "greywater_pump",
    "blackwater_pump",
    "thermal_loop_pump",
    "water_supply_pump",
    "vehicle_charging",
    "mechanical_room_outlets",
    "heat_pump",
    "air_handler",
    "air_conditioning",
    "lighting_1"];

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

  // given an array of numbers and falses, find the last non-false value
  // returns false if there are no non-false values
  function findFinalValue(arr) {
    var result = false;
    // sad about this nasty 'return'
    // find last index with data:
    for (var i = arr.length-1;i>=0;i--) {
      if (table[i].r !== false) {
        return table[i].r;
      }
    }
    return false;
  }
  
  function electricPowerToday($http,device,elevenpm,now,kont) {
    http.get(sodecUrl("last-by-interval",
                     [{p:"measurement",v:"electric_power"},
                      {p:"device",v:device},
                      {p:"start",v:elevenPM},
                      {p:"end",v:nowSeconds},
                      {p:"interval",v:SECONDS_IN_HOUR}]))
      .then (function (result) {
        var table = result.data;
        var firstrow = table[0];
        // only continue if there is data from last hour of yesterday:
        if (firstrow.r !== false) {
          var lastReadingOfYesterday = firstrow.r;
          var lastReadingOfToday = false;
          // sad about this mutation...
          // find last index with data:
          for (var i = table.length-1;i>=0;i--) {
            if (table[i].r !== false) {
              lastReadingOfToday = table[i].r;
              break;
            }
          }
          // give up if no readings today:
          if (lastReadingOfToday) {
            var wattseconds = lastReadingOfToday - lastReadingOfYesterday;
            var kwh = wattseconds / (1000 * SECONDS_IN_HOUR);
            return kont(kwh);
          }
        }
      })
  }

  
  function updateElectric(scope,http,device,from,to,defaultToZero,kont) {
    var windowBegin = from - STALE_SECONDS;
    http.get(sodecUrl("interval-last-event",
                      [{p:"measurement",v:"electric_power"},
                       {p:"device",v:device},
                       {p:"start",v:windowBegin},
                       {p:"end",v:from}]))
      .then (function (result) {
        var maybePrevLast = result.data;
        var prevLast = ((defaultToZero && maybePrevLast === "no events")
                       ? 0
                       : maybePrevLast);
        // give up unless we have a reading from prev period
        if (prevLast !== "no events") {
          http.get(sodecUrl("interval-last-event",
                            [{p:"measurement",v:"electric_power"},
                             {p:"device",v:device},
                             {p:"start",v:from},
                             {p:"end",v:to}]))
            .then(function (result) {
              var thisLast = result.data
              // give up unless we have a reading from today
              if (thisLast !== "no events") {
                var wattseconds = thisLast - prevLast;
                var kwh = wattseconds / (1000 * SECONDS_IN_HOUR);
                kont(kwh);
              }
            })
        }
      })
  }

  // update electric use for the day on one device
  function updateElectricUseDay(scope,http,device) {
    // Dates:
    var nowDate = new Date();
    var dayBeginDate = new Date(nowDate.getFullYear(),nowDate.getMonth(),
                               nowDate.getDate());
    // seconds:
    var nowSeconds = Math.round(nowDate.valueOf() / 1000);
    var dayBegin = Math.round(dayBeginDate.valueOf() / 1000);
    function updateDisplay(kwh) {
      var kwhDisplay = Math.round(kwh * 1000)/1000;
      scope.elec_use[device] = kwhDisplay;
    }
    updateElectric(scope,http,device,dayBegin,nowSeconds,false,
                   updateDisplay);
  }

  // timestamp in seconds
  function updateElectricInputDay(scope,http,device) {
    // Dates:
    var nowDate = new Date();
    var dayBeginDate = new Date(nowDate.getFullYear(),nowDate.getMonth(),
                               nowDate.getDate());
    // seconds:
    var nowSeconds = Math.round(nowDate.valueOf() / 1000);
    var dayBegin = Math.round(dayBeginDate.valueOf() / 1000);
    function updateDisplay(kwh) {
      var kwhDisplay = Math.round(kwh * 1000)/1000;
      scope.elec_gen.day[device] = kwhDisplay;
    }
    updateElectric(scope,http,device,dayBegin,nowSeconds,false,
                   updateDisplay);
  }


  function updateElectricInputWeek(scope,http,device) {
    // Dates:
    var nowDate = new Date();
    var weekBeginDate = new Date(nowDate.getFullYear(),nowDate.getMonth(),
                                 nowDate.getDate()-nowDate.getDay());
    // seconds:
    var nowSeconds = Math.round(nowDate.valueOf() / 1000);
    var weekBegin = Math.round(weekBeginDate.valueOf() / 1000);
    function updateDisplay(kwh) {
      var kwhDisplay = Math.round(kwh * 1000)/1000;
      scope.elec_gen.week[device] = kwhDisplay;
    }
    updateElectric(scope,http,device,weekBegin,nowSeconds,true,
                   updateDisplay);
  }

  // update all time scales for electric generation for one device
  function updateElectricInputDayAndWeek($scope,$http,device) {
    updateElectricInputDay($scope,$http,device);
    updateElectricInputWeek($scope,$http,device);
  }

  // update all electric sensors. For these, we need to take the "derivative"
  // (actually just the difference in the last two readings / time-diff
  function updateAllElectricUse(scope,http,ts) {
    var deviceList = ELECTRIC_POWER_DEVICES;
    deviceList.map(function(device) {
      updateElectricUseDay(scope,http,device);
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
        updateElectricInputDayAndWeek($scope,$http,"main_solar_array")
        updateElectricInputDayAndWeek($scope,$http,"bifacial_solar_array")
        updateElectricInputDayAndWeek($scope,$http,"mains")
        updateAllElectricUse($scope,$http);
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
