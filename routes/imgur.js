var express = require('express');
var request = require('request');
var imageConverter = require('image-to-base64');
var lzString = require('lz-string')
var lzutf8 = require('lzutf8');
var zlib = require('zlib');
var sizeof = require('object-sizeof');
var jimp = require("jimp");
var router = express.Router();

var imgurUrl = 'https://api.imgur.com/3/gallery/';
var headers = {
  'Authorization' : 'Client-ID 226919d0cce54d5'
};

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Imgur' });
});

router.get('/hot', function(req, res) {
  request({
    url: imgurUrl + 'hot',
    headers: headers
  }, function(error, response, body) {
    if (error || response.statusCode != 200)
      return res.sendStatus(response.statusCode);

    return res.send(JSON.parse(body)['data']);
  });
});

router.get('/r/:tag', function(req, res) {
  var tag = req.params.tag;
  request({
    url: imgurUrl + `r/${tag}`,
    headers: headers
  }, function(error, response, body) {
    if (error || response.statusCode != 200)
      return res.sendStatus(response.statusCode);

    return res.send(parseResponse(body));
  });
});

router.get('/t/:tag', function(req, res) {
  var tag = req.params.tag;
  request({
    url: imgurUrl + `t/${tag}`,
    headers: headers
  }, function(error, response, body) {
    if (error || response.statusCode != 200)
      return res.sendStatus(response.statusCode);

    return res.send(parseResponse(body));
  });
});

router.get('/p/:id', function(req, res) {
  var id = req.params.id;
  request({
    url: imgurUrl + id,
    headers: headers
  }, function(error, response, body) {
    if (error || response.statusCode != 200)
      return res.sendStatus(response.statusCode);

    return res.send(parseResponse(body));
  });
});

router.get('/i/:id', function(req, res) {
  var id = req.params.id;

  jimp.read(`https://i.imgur.com/${id}.jpg`, function(err, image) {
    if (err)
      return res.sendStatus(500);

    if (image.bitmap.width > 1000 || image.bitmap.height > 1000) {
      if (image.bitmap.width > image.bitmap.height) {
        image = image.resize(1000, jimp.AUTO);
      } else {
        image = image.resize(jimp.AUTO, 1000);
      }
    }
    var compressed = image.quality(50);

    compressed.getBase64(jimp.MIME_JPEG, function(err, base64) {
      if (err)
        return res.sendStatus(500)
      return res.send(base64);
    });
  });
});

function parseResponse(body) {
  var data = JSON.parse(body)['data'];

  if (data.hasOwnProperty('items'))
    data = data['items'];

  return data;
}

module.exports = router;
