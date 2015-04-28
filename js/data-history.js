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

  // get the data for the last hour
  function getHoursData(){
    return 'wahoo!';
  }

  var linedata = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "My First dataset",
        fillColor: "rgba(220,220,220,0.2)",
        strokeColor: "rgba(220,220,220,1)",
        pointColor: "rgba(220,220,220,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(220,220,220,1)",
        data: [65, 59, 80, 81, 56, 55, 40]
      },
      {
        label: "My Second dataset",
        fillColor: "rgba(151,187,205,0.2)",
        strokeColor: "rgba(151,187,205,1)",
        pointColor: "rgba(151,187,205,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(151,187,205,1)",
        data: [28, 48, 40, 19, 86, 27, 90]
      }
    ]
  };

  var lineoptions = {

    ///Boolean - Whether grid lines are shown across the chart
    scaleShowGridLines : true,

    //String - Colour of the grid lines
    scaleGridLineColor : "rgba(0,0,0,.05)",

    //Number - Width of the grid lines
    scaleGridLineWidth : 1,

    //Boolean - Whether to show horizontal lines (except X axis)
    scaleShowHorizontalLines: true,

    //Boolean - Whether to show vertical lines (except Y axis)
    scaleShowVerticalLines: true,

    //Boolean - Whether the line is curved between points
    bezierCurve : true,

    //Number - Tension of the bezier curve between points
    bezierCurveTension : 0.4,

    //Boolean - Whether to show a dot for each point
    pointDot : true,

    //Number - Radius of each point dot in pixels
    pointDotRadius : 4,

    //Number - Pixel width of point dot stroke
    pointDotStrokeWidth : 1,

    //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
    pointHitDetectionRadius : 20,

    //Boolean - Whether to show a stroke for datasets
    datasetStroke : true,

    //Number - Pixel width of dataset stroke
    datasetStrokeWidth : 2,

    //Boolean - Whether to fill the dataset with a colour
    datasetFill : true,

    //String - A legend template
    legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

  };

  // EXTERNALLY VISIBLE:

  // initialize
  function init(){

    var canvas = $('#chartchart')[0];
    if (!canvas) {
      alert("can't find chart chart");
    } else if (!canvas.getContext) {
      alert("no support for canvas getContext");
    } else {
      var ctx = canvas.getContext('2d');
      alert("yay222!");
      var myLineChart = new Chart(ctx).Line(linedata, lineoptions);
    }


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
