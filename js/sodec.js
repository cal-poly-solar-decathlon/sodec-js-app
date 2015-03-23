SLOME = (function (){

  var currentSeconds = false;
  var currentServerSeconds = false;
  
  var DAYSECONDS = 86400;

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
  
  // update the current Time span
  function updateCurrentTime(currentMsec) {
    $('#curdate').html(new Date(currentMsec).toString());
  }

  // update the timestamp span
  function updateTimestampDelta(num) {
    $('#timestamp').html(num.toString());
  }

  // update the age of the bedroom temperature reading
  function updateBedTempAge(deltaSeconds){
    $('#bed-temp-age').html(deltaSeconds.toString());
  }

  // update the temperature of the bedroom
  function updateBedTemp (status){
    $('#bed-temp').html((status / 10.0).toString() );
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

  // this function is called every second to update everything
  function go(){
    var currentMsec = Date.now();
    updateCurrentTime(currentMsec);
    getTimestamp(function(timestamp) {
      var deltaTime = timestamp - Math.round(currentMsec/1000);
      updateTimestampDelta(deltaTime);
      //ugh, CPSing makes everything nasty...
      makeRequest(
        '/latest-event?device=s-temp-bed',
        function(event) {
          updateBedTempAge(timestamp - event.timestamp);
          updateBedTemp(event.status);
        });
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

  return {go : go,
          refreshButton: refreshButton}
}())

$( document ).ready(function() {
  SLOME.go();

  // set up a handler for the refresh button
  $( "#refreshbutton" ).click(function( event ) {
    SLOME.refreshButton();
    event.preventDefault();
  });

  var intervalID = window.setInterval(SLOME.go, 1000);
});
