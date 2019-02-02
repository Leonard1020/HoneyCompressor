const express = require('express');
const request = require('request');
const rpiDhtSensor = require('rpi-dht-sensor');
const router = express.Router();

var dht = new rpiDhtSensor.DHT11(2);

var apiKey = '23cd3863209483680599f1a8c7437871';

router.get('/forecast/:lat,:long', function(req, res) {
    var lat = req.params.lat;
    var long = req.params.long;

    var url = `https://api.darksky.net/forecast/${apiKey}/${lat},${long}?exclude=minutely,alerts,flags`
    request(url, function(error, response, body) {
        return res.json(JSON.parse(body));
    });
});


router.get('/rooms', function(req, res) {
    var data = dht.read();
    var livingroom = {
        room: 'Living Room',
        temperature: data.temperature * 9.0 / 5.0 + 32.0,
        humidity: data.humidity
    };

    request('http:\/\/192.168.2.12:3000', function(error, response, body) {
        if (error)
            return res.json([livingroom])
        return res.json([JSON.parse(body), livingroom]);
    });
});

module.exports = router;
