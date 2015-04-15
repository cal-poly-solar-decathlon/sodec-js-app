SLOME = (function (){

  var DAYSECONDS = 86400;

  var DEVICE_IDS = [
  "s-temp-out",
  "s-temp-bed",
  "s-temp-bath",
  "s-temp-lr",
  "s-hum-out",
  "s-hum-bed",
  "s-hum-bath",
  "s-hum-lr",
  "s-occ-bed",
  "s-occ-mech",
  "s-occ-lr",
  "s-occ-bath",
  "s-amb-bed",
  "s-amb-mech",
  "s-amb-lr",
  "s-amb-bath",
  "s-temp-testing-blackhole",
  "s-temp-testing-empty",
  "s-light-entry-bookend-1A",
  "s-light-chandelier-1B",
  "s-light-tv-light-2A",
  "s-light-kitchen-uplight-3A",
  "s-light-under-counter-3B",
  "s-light-pendant-bar-lights-3C",
  "s-light-bathroom-ambient-4A",
  "s-light-mirror-4B",
  "s-light-flexspace-uplight-5A",
  "s-light-flexspace-cabinet-5B",
  "s-light-bedroom-uplight-6A",
  "s-light-bedroom-cabinet-6B",
  "s-light-porch-lights-8A",
  "s-light-uplights-and-pot-lights-8B"
  ];
  
  // copied from stackoverflow
  // http://stackoverflow.com/questions/1219860/html-encoding-in-javascript-jquery/1219983#1219983
  function htmlEscape(str) {
    return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
  }

  ////
  //
  // Jquery-using functions
  //
  ////

  // create the rows in the table, each with its own id
  function createTableRows() {
    var tableHeader = "<tr><th>Name</th><th>Reading</th><th>age in seconds</th></td>\n"
    var rowIds = _.map(DEVICE_IDS,function(name){return name+"-tablerow"});
    var rowStrs = _.map(rowIds,function(id){return "<tr id=\""+id+"\"><td>UNSET</td></tr>\n"});
    var tableRowsHtml = _.foldl(rowStrs,function(a,b) {return a.concat(b)});
    $('#devicereadingtable').html(tableHeader + tableRowsHtml);
  }
  
  // update the current Time span
  function updateCurrentTime(currentMsec) {
    $('#curdate').html(new Date(currentMsec).toString());
  }

  // update the timestamp span
  function updateTimestampDelta(num) {
    $('#timestamp').html(num.toString());
  }

  // update the age and reading of a sensor
  function updateTableRow(device,reading,age) {
    var newCells = '<td>'+device+'</td><td>'+reading+'</td><td>'+age+'</td>';
    $('#'+device+'-tablerow').html(newCells);
  }

  // send a request to the sodec server asynchronously
  function makeRequest(path,successFun){
    $.ajax({url: pathToURL(path),
            success: successFun,
            dataType: 'json'});
  }


  // construct sodec server url
  var HOST = 'calpolysolardecathlon.org'
  var PORT = 8080;
  function pathToURL(path){
    return 'http://'+HOST+':'+PORT+"/srv"+path;
  }

  // get the timestamp, hand it off to the continuation
  function getTimestamp(kont){
    makeRequest('/timestamp',
                function(data){
                  return kont(ensureInteger(data.timestamp));
                });
  }

  // only numbers get through. Contract system, anyone?
  function ensureInteger(x){
    if (Number.isInteger(x)){
      return x;
    } else {
      console.log("expected number, got: "+x);
      // what the heck do we return here? Grr, javascript...
      alert('ac');
    }
  }

  // EXTERNALLY VISIBLE:

  // initialize
  function init(){
    createTableRows();
  }
  

  // this function is called every second to update everything
  function go(){
    var currentMsec = Date.now();
    updateCurrentTime(currentMsec);
    getTimestamp(function(timestamp) {
      var deltaTime = timestamp - Math.round(currentMsec/1000);
      updateTimestampDelta(deltaTime);
      for (var i = 0; i < DEVICE_IDS.length; i++) {
        updateSensorStatus(timestamp,DEVICE_IDS[i]);
      };
    });
  }

  // collect the information and update one row of the
  // table
  function updateSensorStatus(timestamp,device){
    makeRequest(
      '/latest-event?device='+device,
      function(event) {
        if (event == "no events") {
          updateTableRow(device,'no reading','n/a');
        } else {
          updateTableRow(device,event.status,timestamp - event.timestamp);
        }
      });
  }

  // handle a click on the refresh button
  function refreshButton(){
    getTimestamp(
      function(ts){
        makeRequest(
          '/events-in-range?device=s-temp-bed?start='+(ts-DAYSECONDS)+';end='+ts,
          function(data){
            $('#numevents').html(data.seriesData.length)
          })
      });
    /*$.ajax({url: 'http://'+host+':8080/srv/events-in-range?device=s-temp-bed',
       success: lastHoursData,
       dataType: 'json'});*/
    alert('ding!');
  }

  return {init: init,
          go : go,
          refreshButton: refreshButton}
}())

$( document ).ready(function() {
  SLOME.init();
  SLOME.go();

  // set up a handler for the refresh button
  $( "#refreshbutton" ).click(function( event ) {
    SLOME.refreshButton();
    event.preventDefault();
  });

  var intervalID = window.setInterval(SLOME.go, 1000);
});
