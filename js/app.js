(
  function() {

    'use strict';

    // I think all of this code is massively cavalier in its handling
    // of responses to the HTTP requests that it makes. And indeed in not
    // delivering things like NaN to the sodec server.

    var HOST = 'calpolysolardecathlon.org';
    var PORT =  3000;
    /*var HOST = 'localhost';
      var PORT =  3000;*/

    // temperature expressed in degrees:
    //var TEMPERATURE_CONCERN_LO_THRESHOLD = 20.0;
    var HUMIDITY_CONCERN_THRESHOLD = 50.0;
    //var ELECTRIC_USE_CONCERN_THRESHOLD = 400.0;

    var SECONDS_IN_HOUR = 3600;
    // var LATE_START_SECONDS = 6 * SECONDS_IN_HOUR;

    // these are the temperature and humidity devices
    var TEMP_HUM_DEVICES = [
      'living_room',
      'bedroom',
      'kitchen',
      'outside',
      'bathroom'];

    // these are the electric power devices
    // ... actually, no they're not.
    var ELECTRIC_POWER_DEVICES = [
      'laundry',
      'dishwasher',
      'refrigerator',
      'induction_stove',
      'water_heater',
      'greywater_pump',
      'blackwater_pump',
      'thermal_loop_pump',
      'water_supply_pump',
      'vehicle_charging_station',
      'mechanical_room_outlets',
      'heat_recovery_ventilation',
      'air_handler',
      'air_conditioning',
      'microwave',
      'lighting_1',
      'lighting_2'
    ];

    /* var ELECTRIC_POWER_GENERATION_DEVICES = [
      'main_solar_array',
      'bifacial_solar_array']; */

    // this table maps measurement name (e.g. 'temperature') to the devices that
    // belong to that measurement
    var DEVICE_TABLE = {
      temperature : TEMP_HUM_DEVICES,
      humidity : TEMP_HUM_DEVICES
    };

    // this table maps measurement names to the corresponding update functions
    var UPDATE_FN_TABLE = {
      temperature : updateTemperatureDisplay,
      humidity : updateHumidityDisplay
    };

    var app = angular.module('SolarHouseApp', ['chart.js']);

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
      return 'http://'+HOST+':'+PORT+'/srv/'+endpoint+formatQueryParameters(queryArr);
    }

    // crude parameter formatting
    // no sanitizing for now...
    // takes an array of {p,v} pairs
    function formatQueryParameters(params){
      return '?'+params.map(function(pv){return pv.p + '=' + pv.v;}).join('&');
    }

    // most pathetic testing ever...
    // console.log(formatQueryParameters([{p:'boo',v:'234'},{p:'zagbar',v:2341}]) ===  '?boo=234&zagbar=2341');

    // given scope & http, device, timestamps in seconds, and a continuation,
    // compute the first and last readings in the interval, convert the difference
    // to kWh, format the result, and pass the string to the continuation
    function updateElectric($scope,http,device,from,to,kont) {
      http.get(sodecUrl('interval-first-event',
                        [{p:'measurement',v:'electric_power'},
                         {p:'device',v:device},
                         {p:'start',v:from},
                         {p:'end',v:to}]))
        .then (function (result) {
          var maybeFirst = result.data;
          // give up in no events in range:
          if (maybeFirst !== 'no events') {
            http.get(sodecUrl('interval-last-event',
                              [{p:'measurement',v:'electric_power'},
                               {p:'device',v:device},
                               {p:'start',v:from},
                               {p:'end',v:to}]))
              .then(function (result) {
                var thisLast = result.data;
                // give up unless we have a reading from today
                if (thisLast !== 'no events') {
                  // don't know how best to use angular to add this data:
                  //var startSeconds = maybeFirst.t / 1000;
                  // var lateStart = (startSeconds - from) > LATE_START_SECONDS;
                  var wattseconds = thisLast - maybeFirst.r;
                  var kwh = wattseconds / (1000 * SECONDS_IN_HOUR);
                  kont(kwh);
                }
              });
          }
        });
    }

    // update electric use for the day on one device
    function updateElectricUseDay($scope,http,device) {
      // Dates:
      var nowDate = new Date();
      var dayBeginDate = new Date(nowDate.getFullYear(),nowDate.getMonth(),
                                  nowDate.getDate());
      // seconds:
      var nowSeconds = Math.round(nowDate.valueOf() / 1000);
      var dayBegin = Math.round(dayBeginDate.valueOf() / 1000);
      updateElectric($scope,http,device,dayBegin,nowSeconds,
                     function(kwh){
                       var kwhDisplay = kwhToString(kwh);
                       $scope.elec.day[device] = {val:kwh,
                                                  text:kwhDisplay,
                                                  cp_class:'bogus'};
                       updateMissingPower($scope);
                     });
    }

    // update one electric input's daily figure
    // timestamp in seconds
    function updateElectricInputDay($scope,http,device) {
      // Dates:
      var nowDate = new Date();
      var dayBeginDate = new Date(nowDate.getFullYear(),nowDate.getMonth(),
                                  nowDate.getDate());
      // seconds:
      var nowSeconds = Math.round(nowDate.valueOf() / 1000);
      var dayBegin = Math.round(dayBeginDate.valueOf() / 1000);
      updateElectric($scope,http,device,dayBegin,nowSeconds,
                     function(kwh){
                       var kwhDisplay = kwhToString(kwh);
                       $scope.elec.day[device] = {val:kwh,
                                                  text:kwhDisplay,
                                                  cp_class:'bogus'};
                       updateElectricSurplus($scope,'day');
                       updateMissingPower($scope);
                     });
    }

    // update one electric input's weekly figure
    function updateElectricInputWeek($scope,http,device) {
      // Dates:
      var nowDate = new Date();
      var weekBeginDate = new Date(nowDate.getFullYear(),nowDate.getMonth(),
                                   nowDate.getDate()-nowDate.getDay());
      // seconds:
      var nowSeconds = Math.round(nowDate.valueOf() / 1000);
      var weekBegin = Math.round(weekBeginDate.valueOf() / 1000);
      updateElectric($scope,http,device,weekBegin,nowSeconds,
                     function(kwh){
                       var kwhDisplay = kwhToString(kwh);
                       $scope.elec.week[device] = {val:kwh,
                                                   text:kwhDisplay,
                                                   cp_class:'bogus'};
                       updateElectricSurplus($scope,'week');
                     });
    }

    // given the scope and 'day' or 'week',
    // recompute the electrical surplus for the day or week
    function updateElectricSurplus($scope,timeLabel) {
      var solarNet = $scope.elec[timeLabel].main_solar_array.val
          + $scope.elec[timeLabel].bifacial_solar_array.val;
      // this is unfotunately negated...
      var mainsNet = - $scope.elec[timeLabel].mains.val;
      var used = solarNet + mainsNet;
      var surplus = -1 * mainsNet;
      $scope.elec[timeLabel].surplus = {val:surplus,
                                            text:kwhToString(surplus),
                                            cp_class:'bogus'};
      $scope.elec[timeLabel].total_used = {val:used,
                                               text:kwhToString(used),
                                               cp_class:'bogus'};
    }

    function updateMissingPower($scope){
      var totalKnownUse = 0;
      for (var i=0;i<ELECTRIC_POWER_DEVICES.length;i++) {
        totalKnownUse += $scope.elec.day[ELECTRIC_POWER_DEVICES[i]].val;
      }
      var leftover = - ($scope.elec.day.total_used.val + totalKnownUse);
      $scope.elec.day.everything_else = {val:leftover,
                                         text:kwhToString(leftover),
                                        cp_class:'bogus'};
    }

    // update all time scales for electric generation for one device
    function updateElectricInputDayAndWeek($scope,$http,device) {
      updateElectricInputDay($scope,$http,device);
      updateElectricInputWeek($scope,$http,device);
    }

    // update all standard loads
    function updateAllElectricUse($scope,http) {
      var deviceList = ELECTRIC_POWER_DEVICES;
      deviceList.map(function(device) {
        updateElectricUseDay($scope,http,device);
      });
    }


    // readings older than 5 minutes really shouldn't be displayed
    // as current

    // var SOMEWHAT_CURRENT = (5 * 60);

    // compute the "instantaneous" power use of a device
    // returns a number representing average watts or "no events"
    /* function electricUse($scope,http,device,isGeneration) {
      // silly to fetch this over and over again...
      http.get(sodecUrl('timestamp',[]))
        .then(function(timestampResponse){
          var ts = timestampResponse.data.timestamp;
          var ts5 = ts - SOMEWHAT_CURRENT;
          http.get(sodecUrl('events-in-range',
                            [{p:'measurement',v:'electric_power'},
                             {p:'device',v:device},
                             {p:'start',v:ts5},
                             {p:'end',v:ts}]))
            .then(function(eventsResponse) {
              var events = eventsResponse.data;
              if (events.length < 2) {
                return 'no events';
              } else {
                var lastIdx = events.length - 1;
                var readingDiff = (events[lastIdx].r - events[lastIdx-1].r);
                var timeDiff = (events[lastIdx].t - events[lastIdx-1].t) / 1000.0;
                var instWatts = (readingDiff / timeDiff);
                updateElectricPowerDisplay($scope,device,instWatts,isGeneration);
              }
            })
        })
    } */

    // update the display of the given temperature with the given reading
    // (reading is raw data from http)
    function updateTemperatureDisplay($scope,id,reading){
      if (reading === 'no events'){
        $scope.temp[id] = {text:'n/a',cp_class:'no_concern'};
      } else {
        var numReading = parseInt(reading)/10;
        $scope.temp[id] = {val:numReading,text:numReading + '°',cp_class:'no_concern'};
        //((numReading > TEMPERATURE_CONCERN_THRESHOLD) ? 'concern' : 'no_concern')
      }
    }

    // update the display of the given humidity with the given reading
    function updateHumidityDisplay($scope,id,reading){
      if (reading === 'no events'){
        $scope.hum[id] = {text:'n/a',cp_class:'no_concern'};
      } else {
        var numReading = parseInt(reading)/10;
        var isConcern =
            ((numReading > HUMIDITY_CONCERN_THRESHOLD) ? 'concern' : 'no_concern');
        $scope.hum[id] = {val:numReading,text:numReading + '%',cp_class:isConcern};
      }
    }


    // update all sensors associated with a measurement using instantaneous
    // reading. NOT FOR USE WITH ELECTRIC POWER; these readings are cumulative
    // watt-seconds.
    function updateSome($scope,http,measurement){
      var deviceList = DEVICE_TABLE[measurement];
      var updateFn = UPDATE_FN_TABLE[measurement];
      for (var i = 0; i < deviceList.length; i++) {
        var id = deviceList[i];
        http.get(sodecUrl('latest-event',
                          [{p:'measurement',v:measurement},
                           {p:'device',v:id}]))
          .then((function(id,latestResponse){
            updateFn($scope,id,latestResponse.data);
          }).bind(undefined,id));
      }
    }

    // update the insights section
    function updateInsights($scope,$http) {
      $http.get(sodecUrl('latest-insights',[]))
        .then (function(response){
          var insights = response.data;
          $scope.insights = insights.map(renderInsightText);
        });
    }

    // render an insight using red if it's priority 50 or higher
    function renderInsightText(insight) {
      var priorityClass = (insight.p > 50
                           ? 'highPriority'
                           : 'lowPriority');
      return {text:insight.m,sp_class:priorityClass};
    }

    function kwhToString(kwh) {
      return ''+(Math.round(kwh * 1000) / 1000);
    }

    function tempToString(temp){
      return ''+(Math.round(temp*10)/10);
    }

    // update all of the page
    function updatePage($scope,$http){
      updateSome($scope,$http,'temperature');
      updateSome($scope,$http,'humidity');
      updateInsights($scope,$http);
      updateElectricInputDayAndWeek($scope,$http,'main_solar_array');
      updateElectricInputDayAndWeek($scope,$http,'bifacial_solar_array');
      updateElectricInputDayAndWeek($scope,$http,'mains');
      updateAllElectricUse($scope,$http);
    }

    app.filter('cToF', function() {
      return function(cels) {
        var fahrenheit =  32 + (9.0/5.0) * cels;
        return tempToString(fahrenheit) + '°';
      };
    }).controller('SolarHouseController', function($scope, $http) {
      $scope.temp = {};
      $scope.hum = {};
      $scope.elec = {day:{},week:{},rate:{}};

      var updater = updatePage.bind(undefined,$scope,$http);
      updater();
      // update everything every fifteen seconds...
      // setInterval(maybeUpdater, 15000);

      /* SODECFORECAST.fetchForecast($http,function(forecast) {
         console.log(forecast);
         })*/
    });
  })
();
