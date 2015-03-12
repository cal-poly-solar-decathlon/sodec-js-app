SLOME = (function (){

  function handleTimestamp(data){
    alert('success!');
  }
  
  function go(){
    alert('ready to goxxx');
    $.ajax(
      {url: 'http://localhost:8080/srv/timestamp',
       success: handleTimestamp,
       dataType: 'json'});
  }

  return {go : go}
}())

$( document ).ready(function() {
  SLOME.go();

  //GeneratePassword.start();
  // set up a handler for the go button
  /*$( "#gobutton" ).click(function( event ) {
    GeneratePassword.gobuttonclick();
    event.preventDefault();
    });*/
});
