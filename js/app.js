/**
 * Created by skahal on 8/28/15.
 */

/**
 * Created by skahal on 8/28/15.
 */
(function() {

  var HOST = 'calpolysolardecathlon.org';
  var PORT = 8080;

  // construct a sodec url
  function sodecUrl(endpoint,queryStr){
    // I want a way to accept the query as an array and validate it...
    return "http://"+HOST+":"+PORT+"/srv/"+endpoint+queryStr;
  }

    var app = angular.module("SolarHouseApp", ['chart.js']);
    var deviceLatestResponses = {};
    var s_temp = [];
    var s_hum = [];
    var s_occ = [];
    var s_amb = [];
    var c_light = [];
    var s_light = [];
    var s_elec = [];
    var s_elec_gen = [];

    app.controller("SolarHouseController", function($scope, $http) {
        $http.get(sodecUrl("list-old-device-ids",""))
            .then(function(response) {
                console.log("list of devices");
                console.log(response);
                $scope.device_list = response.data;
                for(var i = 0; i < response.data.length; i++) {
                    if(response.data[i] !== "s-elec-used-vehicle-changing-recep" && response.data[i] !== "s-temp-bogus" && response.data[i] !== "s-temp-testing-blackhole")
                    {
                        $http.get("http://calpolysolardecathlon.org:8080/srv/latest-event?device=" + response.data[i])
                            .then(function (latestResponse) {

                                deviceLatestResponses[latestResponse.data["device-id"]] = latestResponse.data;

                                    $scope.results = deviceLatestResponses;

                                    var key = latestResponse.data["device-id"];

                                    if(!(key == undefined)) {
                                        if (key.indexOf('s-temp') > -1) {
                                            s_temp.push(deviceLatestResponses[key]);
                                        } else if (key.indexOf('s-hum') > -1) {
                                            s_hum.push(deviceLatestResponses[key]);
                                        } else if (key.indexOf('s-occ') > -1) {
                                            s_occ.push(deviceLatestResponses[key]);
                                        } else if (key.indexOf('s-amb') > -1) {
                                            s_amb.push(deviceLatestResponses[key]);
                                        } else if (key.indexOf('c-light') > -1) {
                                            c_light.push(deviceLatestResponses[key]);
                                        } else if (key.indexOf('s-light') > -1) {
                                            s_light.push(deviceLatestResponses[key]);
                                        } else if (key.indexOf('s-elec-used') > -1) {
                                            s_elec.push(deviceLatestResponses[key]);
                                        } else if (key.indexOf('s-elec-gen') > -1) {
                                            s_elec_gen.push(deviceLatestResponses[key]);
                                        }
                                    }
                            })
                            .then(function() {

                                console.log("Data Fetch Completed.");

                                var s_temp_labels = [];
                                var s_temp_statuses = [];
                                var s_temp_obj_display = {};

                                $scope.show_s_temp_graph = true;

                                setTimeout(function() {
                                    if(s_temp.length == 0)
                                    {
                                        $scope.show_s_temp_graph = false;
                                    }}, 1000);

                                for(var i in s_temp)
                                {
                                    s_temp_labels.push(s_temp[i]["device-id"]);
                                    s_temp_statuses.push(parseInt(s_temp[i]["status"]));
                                    s_temp_obj_display[s_temp[i]["device-id"]] = {"status":parseInt(s_temp[i]["status"])/10};
                                    if(s_temp_obj_display[s_temp[i]["device-id"]].status > 20)
                                    {
                                        s_temp_obj_display[s_temp[i]["device-id"]]["concern"] = "concern";
                                    }else
                                    {
                                        s_temp_obj_display[s_temp[i]["device-id"]]["concern"] = "no_concern";
                                    }
                                }
                                $scope.s_temp_series = ['Celsius * 10'];
                                $scope.s_temp_labels = s_temp_labels;
                                $scope.s_temp_data = [s_temp_statuses];
                                $scope.s_temp_obj_display = s_temp_obj_display;
                            })
                            .then(function() {

                                var s_hum_labels = [];
                                var s_hum_statuses = [];
                                var s_hum_obj_display = {};

                                $scope.show_s_hum_graph = true;

                                setTimeout(function() {
                                    if(s_hum.length == 0)
                                    {
                                        $scope.show_s_hum_graph = false;
                                    }}, 1000);

                                for(var i in s_hum)
                                {
                                    s_hum_labels.push(s_hum[i]["device-id"]);
                                    s_hum_statuses.push(parseInt(s_hum[i]["status"]));
                                    s_hum_obj_display[s_hum[i]["device-id"]] = {"status":parseInt(s_hum[i]["status"])};
                                    if(s_hum_obj_display[s_hum[i]["device-id"]].status > 600)
                                    {
                                        s_hum_obj_display[s_hum[i]["device-id"]]["concern"] = "concern";
                                    }else
                                    {
                                        s_hum_obj_display[s_hum[i]["device-id"]]["concern"] = "no_concern";
                                    }
                                }

                                $scope.s_hum_series = ['Celsius * 10'];
                                $scope.s_hum_labels = s_hum_labels;
                                $scope.s_hum_data = [s_hum_statuses];
                                $scope.s_hum_obj_display = s_hum_obj_display;
                            })
                            .then(function() { //latest-response returns undefined
                                var s_occ_labels = [];
                                var s_occ_statuses = [];

                                $scope.show_s_occ_graph = true;

                                setTimeout(function() {
                                    if(s_occ.length == 0)
                                    {
                                        $scope.show_s_occ_graph = false;
                                    }}, 1000);

                                for(var i in s_occ)
                                {
                                    s_occ_labels.push(s_occ[i]["device-id"]);
                                    s_occ_statuses.push(parseInt(s_occ[i]["status"]));
                                }

                                $scope.s_occ_series = ['CUMULATIVE milliwatt-hours'];
                                $scope.s_occ_labels = s_occ_labels;
                                $scope.s_occ_data = [s_occ_statuses];
                            })
                            .then(function() {
                                var s_amb_labels = [];
                                var s_amb_statuses = [];

                                $scope.show_s_amb_graph = true;

                                setTimeout(function() {
                                    if(s_amb.length == 0)
                                    {
                                        $scope.show_s_amb_graph = false;
                                    }}, 1000);

                                for(var i in s_amb)
                                {
                                    s_amb_labels.push(s_amb[i]["device-id"]);
                                    s_amb_statuses.push(parseInt(s_amb[i]["status"]));
                                }

                                $scope.s_amb_series = ['CUMULATIVE milliwatt-hours'];
                                $scope.s_amb_labels = s_amb_labels;
                                $scope.s_amb_data = [s_amb_statuses];
                            })
                            .then(function() {
                                var c_light_labels = [];
                                var c_light_statuses = [];

                                $scope.show_c_light_graph = true;

                                console.log("C Light Length: " + c_light.length);

                                setTimeout(function() {
                                    if(c_light.length == 0)
                                    {
                                        $scope.show_c_light_graph = false;
                                    }}, 500);

                                for(var i in c_light)
                                {
                                    c_light_labels.push(c_light[i]["device-id"]);
                                    c_light_statuses.push(parseInt(c_light[i]["status"]));
                                }

                                $scope.c_light_series = ['CUMULATIVE milliwatt-hours'];
                                $scope.c_light_labels = c_light_labels;
                                $scope.c_light_data = [c_light_statuses];
                            })
                            .then(function() {
                                var s_light_labels = [];
                                var s_light_statuses = [];

                                $scope.show_s_light_graph = true;

                                setTimeout(function() {
                                    if(s_light.length == 0)
                                    {
                                        $scope.show_s_light_graph = false;
                                    }}, 1000);

                                for(var i in s_light)
                                {
                                    s_light_labels.push(s_light[i]["device-id"]);
                                    s_light_statuses.push(parseInt(s_light[i]["status"]));
                                }

                                $scope.s_light_series = ['CUMULATIVE milliwatt-hours'];
                                $scope.s_light_labels = s_light_labels;
                                $scope.s_light_data = [s_light_statuses];
                            })
                            .then(function() {
                                var s_elec_labels = [];
                                var s_elec_statuses = [];
                                var s_elec_obj_display = {};

                                $scope.show_s_elec_graph = true;

                                setTimeout(function() {
                                    if(s_elec.length == 0)
                                    {
                                        $scope.show_s_elec_graph = false;
                                    }}, 3000);

                                for(var i in s_elec)
                                {
                                    s_elec_labels.push(s_elec[i]["device-id"]);
                                    s_elec_statuses.push(parseInt(s_elec[i]["status"]));
                                    s_elec_obj_display[s_elec[i]["device-id"]] = {"status":parseInt(s_elec[i]["status"])};
                                    if(s_elec_obj_display[s_elec[i]["device-id"]].status > 1529000000)
                                    {
                                        s_elec_obj_display[s_elec[i]["device-id"]]["concern"] = "concern";
                                    }else
                                    {
                                        s_elec_obj_display[s_elec[i]["device-id"]]["concern"] = "no_concern";
                                    }
                                }

                                $scope.s_elec_series = ['CUMULATIVE milliwatt-hours'];
                                $scope.s_elec_labels = s_elec_labels;
                                $scope.s_elec_data = [s_elec_statuses];
                                $scope.s_elec_obj_display = s_elec_obj_display;
                            })
                            .then(function() {
                                var s_elec_gen_obj_display = {};

                                for(var i in s_elec_gen)
                                {
                                    s_elec_gen_obj_display[s_elec_gen[i]["device-id"]] = {"status":parseInt(s_elec_gen[i]["status"])};
                                    if(s_elec_gen_obj_display[s_elec_gen[i]["device-id"]].status > 1529000000)
                                    {
                                        s_elec_gen_obj_display[s_elec_gen[i]["device-id"]]["concern"] = "concern";
                                    }else
                                    {
                                        s_elec_gen_obj_display[s_elec_gen[i]["device-id"]]["concern"] = "no_concern";
                                    }
                                }

                                $scope.s_elec_gen_obj_display = s_elec_gen_obj_display;
                            })
                        }
                    }
                })
            });
        })
();
