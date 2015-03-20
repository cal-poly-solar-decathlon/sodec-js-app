SLOME = (function (){

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

  function updateTimestamp(data){
    $('#timestamp').html(data);
  }

  function updateBedTemp(data){
    $('#bed-temp').html("" + (data.status / 10.0) + " degrees" );
  }

  // construct sodec server url
  var HOST = 'calpolysolardecathlon.org'
  var PORT = 8080;
  function pathToURL(path){
    return 'http://'+HOST+':'+PORT+"/srv"+path;
  }

  // send a request to the sodec server asynchronously
  function makeRequest(path,successFun){
    $.ajax({url: pathToURL(path),
            success: successFun,
            dataType: 'json'});
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

  function go(){
    getTimestamp(updateTimestamp);
    //makeRequest('/timestamp',updateTimestamp);
    makeRequest('/latest-event?device=s-temp-bed',updateBedTemp);
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
  //GeneratePassword.start();
  // set up a handler for the go button
  /*$( "#gobutton" ).click(function( event ) {
    GeneratePassword.gobuttonclick();
    event.preventDefault();
    });*/
});
