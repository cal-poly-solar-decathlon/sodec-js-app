DataHistory = (function (){

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
  "s-temp-testing-empty"
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

  // update the current Time span
  function updateCurrentTime(currentMsec) {
    $('#curdate').html(new Date(currentMsec).toString());
  }

  // update the timestamp span
  function updateTimestampDelta(num) {
    $('#timestamp').html(num.toString());
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
    var currentMsec = Date.now();
    updateCurrentTime(currentMsec);
    getTimestamp(function(timestamp) {
      var deltaTime = timestamp - Math.round(currentMsec/1000);
      updateTimestampDelta(deltaTime);
      // more idiomatic way to write this?
      var canvas = $('#historybar')[0];
      if (!canvas) {
        alert("can't find history bar");
      } else if (!canvas.getContext) {
        alert("no support for canvas getContext");
      } else {
        var ctx = canvas.getContext('2d');
        alert("yay!");
      }
    })
  }
  

  // this function is called every second to update everything
  function go(){
    var currentMsec = Date.now();
    updateCurrentTime(currentMsec);
    getTimestamp(function(timestamp) {
      var deltaTime = timestamp - Math.round(currentMsec/1000);
      updateTimestampDelta(deltaTime);
      //ugh, CPSing makes everything nasty...
      for (var i = 0; i < DEVICE_IDS.length; i++) {
        updateSensorStatus(timestamp,DEVICE_IDS[i]);
      }
;
    });
  }

  return {init: init}
}())

$( document ).ready(function() {
  DataHistory.init();

  //var intervalID = window.setInterval(SLOME.go, 1000);
});
