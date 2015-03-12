SLOME = (function (){

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
    $('#timestamp').html(data.timestamp);
  }

  function updateBedTemp(data){
    $('#bed-temp').html("" + (data.status / 1000.0) + " degrees" );
  }

  var host = 'calpolysolardecathlon.org'
  function go(){
    $.ajax(
      {url: 'http://'+host+':8080/srv/timestamp',
       success: updateTimestamp,
       dataType: 'json'});
    $.ajax({url: 'http://'+host+':8080/srv/latest-event?device=s-temp-bed',
       success: updateBedTemp,
       dataType: 'json'});
  }

  return {go : go}
}())

$( document ).ready(function() {
  SLOME.go();

  var intervalID = window.setInterval(SLOME.go, 1000);
  //GeneratePassword.start();
  // set up a handler for the go button
  /*$( "#gobutton" ).click(function( event ) {
    GeneratePassword.gobuttonclick();
    event.preventDefault();
    });*/
});
