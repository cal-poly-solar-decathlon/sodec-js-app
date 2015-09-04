/**
 * Created by skahal on 8/27/15.
 */
var request = require('request');
var express = require('express');
var _ = require('lodash');
var util = require('util');
var Promise = require('Bluebird');
var rp = require('request-promise');

var app = express();

var arrayOfDevices = [];
var s_temp = [];
var s_hum = [];
var s_occ = [];
var s_amb = [];
var c_light = [];
var s_light = [];
var s_elec = [];

var deviceStatusesObj = {};

function getArrayOfDevices()
{
    return new Promise(function (resolve, reject) {
        request('http://calpolysolardecathlon.org:8080/srv/list-devices', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var bodyObj = JSON.parse(body);

                bodyObj.forEach(function (deviceObj) {
                    arrayOfDevices.push(deviceObj);
                });
                resolve(arrayOfDevices);
            }else {
                reject(error);
            }
        });
    })
}

function fillDeviceArrays(arrayOfDevices)
{
    return new Promise(function(resolve, reject) {
        arrayOfDevices.forEach(function (deviceObj) {
            if (deviceObj.device.indexOf('s-temp') > -1) {
                s_temp.push(deviceObj);
            } else if (deviceObj.device.indexOf('s-hum') > -1) {
                s_hum.push(deviceObj);
            } else if (deviceObj.device.indexOf('s-occ') > -1) {
                s_occ.push(deviceObj);
            } else if (deviceObj.device.indexOf('s-amb') > -1) {
                s_amb.push(deviceObj);
            } else if (deviceObj.device.indexOf('c-light') > -1) {
                c_light.push(deviceObj);
            } else if (deviceObj.device.indexOf('s-light') > -1) {
                s_light.push(deviceObj);
            } else if (deviceObj.device.indexOf('s-elec') > -1) {
                s_elec.push(deviceObj);
            }
        });

        resolve("Device arrays initiated.");
    });
}

function printDeviceArrays()
{
    console.log('s-temp: ' + util.inspect(s_temp));
    console.log('s-hum: ' + util.inspect(s_hum));
    console.log('s-occ: ' + util.inspect(s_occ));
    console.log('s-amb: ' + util.inspect(s_amb));
    console.log('c-light: ' + util.inspect(c_light));
    console.log('s-light: ' + util.inspect(s_light));
    console.log('s-elec: ' + util.inspect(s_elec));
}

function getSTempLatestStatuses()
{
    return new Promise(function(resolve, reject) {

        var s_temp_latest_status = [];
        // indicates how many callbacks haven't yet returned:
        var callbacks_remaining = s_temp.length;

        s_temp.forEach(function(deviceObj)
        {
            request('http://calpolysolardecathlon.org:8080/srv/latest-event?device=' + deviceObj.device, function (error, response, body)
            {
                if (!error && response.statusCode == 200)
                {
                    s_temp_latest_status.push(body);
                }
                // decrement the # of callbacks pending, release
                // if zero
                callbacks_remaining -= 1;
                if (callbacks_remaining <= 0){
                    resolve(s_temp_latest_status);
                }
            });
        });
    });
}

function getSHumLatestStatuses()
{
    return new Promise(function(resolve, reject) {

        var s_hum_latest_status = [];
        // indicates how many callbacks haven't yet returned:
        var callbacks_remaining = s_hum.length;

        s_hum.forEach(function(deviceObj)
        {
            request('http://calpolysolardecathlon.org:8080/srv/latest-event?device=' + deviceObj.device, function (error, response, body)
            {
                if (!error && response.statusCode == 200)
                {
                    s_hum_latest_status.push(body);
                }
                // decrement the # of callbacks pending, release
                // if zero
                callbacks_remaining -= 1;
                if (callbacks_remaining <= 0){
                    resolve(s_hum_latest_status);
                }
            });
        });
    });
}

function getSOccLatestStatuses()
{
    return new Promise(function(resolve, reject) {

        var s_occ_latest_status = [];
        // indicates how many callbacks haven't yet returned:
        var callbacks_remaining = s_occ.length;

        s_occ.forEach(function(deviceObj)
        {
            request('http://calpolysolardecathlon.org:8080/srv/latest-event?device=' + deviceObj.device, function (error, response, body)
            {
                if (!error && response.statusCode == 200)
                {
                    s_occ_latest_status.push(body);
                }
                // decrement the # of callbacks pending, release
                // if zero
                callbacks_remaining -= 1;
                if (callbacks_remaining <= 0){
                    resolve(s_occ_latest_status);
                }
            });
        });
    });
}

function getSAmbLatestStatuses()
{
    return new Promise(function(resolve, reject) {

        var s_amb_latest_status = [];
        // indicates how many callbacks haven't yet returned:
        var callbacks_remaining = s_amb.length;

        s_amb.forEach(function(deviceObj)
        {
            request('http://calpolysolardecathlon.org:8080/srv/latest-event?device=' + deviceObj.device, function (error, response, body)
            {
                if (!error && response.statusCode == 200)
                {
                    s_amb_latest_status.push(body);
                }
                // decrement the # of callbacks pending, release
                // if zero
                callbacks_remaining -= 1;
                if (callbacks_remaining <= 0){
                    resolve(s_amb_latest_status);
                }
            });
        });
    });
}

function getCLightLatestStatuses()
{
    return new Promise(function(resolve, reject) {

        var c_light_latest_status = [];
        // indicates how many callbacks haven't yet returned:
        var callbacks_remaining = c_light.length;

        c_light.forEach(function(deviceObj)
        {
            request('http://calpolysolardecathlon.org:8080/srv/latest-event?device=' + deviceObj.device, function (error, response, body)
            {
                if (!error && response.statusCode == 200)
                {
                    c_light_latest_status.push(body);
                }
                // decrement the # of callbacks pending, release
                // if zero
                callbacks_remaining -= 1;
                if (callbacks_remaining <= 0){
                    resolve(c_light_latest_status);
                }
            });
        });
    });
}

function getSLightLatestStatuses()
{
    return new Promise(function(resolve, reject) {

        var s_light_latest_status = [];
        // indicates how many callbacks haven't yet returned:
        var callbacks_remaining = s_light.length;

        s_light.forEach(function(deviceObj)
        {
            request('http://calpolysolardecathlon.org:8080/srv/latest-event?device=' + deviceObj.device, function (error, response, body)
            {
                if (!error && response.statusCode == 200)
                {
                    s_light_latest_status.push(body);
                }
                // decrement the # of callbacks pending, release
                // if zero
                callbacks_remaining -= 1;
                if (callbacks_remaining <= 0){
                    resolve(s_light_latest_status);
                }
            });
        });
    });
}

function getSElecLatestStatuses()
{
    return new Promise(function(resolve, reject) {

        var s_elec_latest_status = [];
        // indicates how many callbacks haven't yet returned:
        var callbacks_remaining = s_elec.length;

        s_elec.forEach(function(deviceObj)
        {
            request('http://calpolysolardecathlon.org:8080/srv/latest-event?device=' + deviceObj.device, function (error, response, body)
            {
                if (!error && response.statusCode == 200)
                {
                    s_elec_latest_status.push(body);
                }
                // decrement the # of callbacks pending, release
                // if zero
                callbacks_remaining -= 1;
                if (callbacks_remaining <= 0){
                    resolve(s_elec_latest_status);
                }
            });
        });
    });
}

function handleGetRequests(deviceStatsusesObj)
{
    app.get("/", function(response, request) {
        response.send("hello world");
    });

    app.get("/s-temp", function(response, request) {
        response.json(deviceStatsusesObj.s_temp_status);
    });

    app.get("/s-hum", function(response, request) {
        response.json(deviceStatsusesObj.s_hum_status);
    });

    app.get("/s-occ", function(response, request) {
        response.json(deviceStatsusesObj.s_occ_status);
    });

    app.get("/s-amb", function(response, request) {
        response.json(deviceStatsusesObj.s_amb_status);
    });

    app.get("/c-light", function(response, request) {
        response.json(deviceStatsusesObj.c_light_status);
    });

    app.get("/s-light", function(response, request) {
        response.json(deviceStatsusesObj.s_light_status);
    });

    app.get("/s-elec", function(response, request) {
        response.json(deviceStatsusesObj.s_elec_status);
    });
}

getArrayOfDevices()
    .then(fillDeviceArrays)
    .then(getSTempLatestStatuses)
    .then(function(s_temp_data) {
        deviceStatusesObj["s_temp_status"] = s_temp_data;
    })
    .then(getSHumLatestStatuses)
    .then(function(s_hum_data) {
       deviceStatusesObj["s_hum_status"] = s_hum_data;
    })
    .then(getSOccLatestStatuses)
    .then(function(s_occ_data) {
        deviceStatusesObj["s_occ_status"] = s_occ_data;
    })
    .then(getSAmbLatestStatuses)
    .then(function(s_amb_data) {
        deviceStatusesObj["s_amb_status"] = s_amb_data;
    })
    .then(getCLightLatestStatuses)
    .then(function(c_light_data) {
        deviceStatusesObj["c_light_status"] = c_light_data;
    })
    .then(getSLightLatestStatuses)
    .then(function(s_light_data) {
        deviceStatusesObj["s_light_status"] = s_light_data;
    })
    .then(getSElecLatestStatuses)
    .then(function(s_elec_data) {
        deviceStatusesObj["s_elec_status"] = s_elec_data;
    })
    .then(function() {
       console.log("Final Obj: " + util.inspect(deviceStatusesObj));
    })
    .then(handleGetRequests)
    .catch(function(err) {
        console.log(util.inspect(err))
    })
    .finally(function() {
        app.listen(3000, function() {
            console.log("Listening on port 3000.");
        });
        console.log("Solar House data fetch complete.");
    });