const express = require('express');
const request = require('request');
const jimp = require("jimp");
const router = express.Router();

const imgurUrl = 'https://api.imgur.com/3/gallery/';
const headers = {
  'Authorization' : 'Client-ID 226919d0cce54d5'
};

var wifiRequest = false;

router.get('/**', function(req, res, next) {
  if (!authorized(req.headers.authorization))
    return res.sendStatus(401);

  if (req.headers.network == "wifi")
    wifiRequest = true;
  else
    wifiRequest = false;

  next();
});

router.get('/hot', function(req, res) {
  request({
    url: imgurUrl + 'hot',
    headers: headers
  }, function(error, response, body) {
    if (error || response.statusCode != 200)
      return res.sendStatus(response.statusCode);

    return res.send(parseResponse(body));
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
    if (error || (response.statusCode && response.statusCode != 200))
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

    compressed.getBuffer(jimp.MIME_JPEG, function(err, buffer) {
      if (err)
        return res.sendStatus(500)

      res.contentType('image/jpeg');
      return res.send(buffer);
    });
  });
});

function authorized(header) {
  /*
  if (header == 'Y5nqZMYCkeWwCAXFC8SVAeuvkPfxaC2Z')
    return true;

  return false;
  */
  return true;
}

function parseResponse(body) {
  var data = JSON.parse(body)['data'];

  if (data.hasOwnProperty('items'))
    data = data['items'];

  if (Array.isArray(data)) {
    for (var p in data) {
      var post = data[p];
      format(post);
      for(var i in post.images) {
        var image = post.images[i];
        format(image);
      }
    }
  } else {
    format(data);
    for(var i in data.images) {
      var image = data.images[i];
      format(image);
    }
  }
  return data;
}

function format(post) {
  if (post.type &&
      post.type.startsWith('image') &&
      !post.type.endsWith('gif')) {
    var compressedLink = post.link.replace(
      'https://i.imgur.com',
      wifiRequest ?
        'http://192.168.2.11:5055/imgur/i' :
        'http://honeycompressor.ddns.net:5055/imgur/i');
    post.link = compressedLink.replace('.png', '.jpg');
  }
  if (post.type)
    post.requestLoad = !post.type.includes('gif') && !post.type.includes('video');

  delete post.account_id;
  delete post.account_url;
  delete post.ad_type;
  delete post.ad_url;
  delete post.comment_count;
  delete post.cover;
  delete post.cover_height;
  delete post.cover_width;
  delete post.downs;
  delete post.favorite;
  delete post.favorite_count;
  delete post.in_gallery;
  delete post.in_most_viral;
  delete post.include_album_ads;
  delete post.is_ad;
  delete post.is_album;
  delete post.layout;
  delete post.points;
  delete post.privacy;
  delete post.score;
  delete post.section;
  delete post.tags;
  delete post.topic;
  delete post.topic_id;
  delete post.ups;
  delete post.views;
  delete post.vote;
  delete post.bandwidth;
  delete post.has_sound;
  delete post.height;
  delete post.width;
  delete post.processing;
}

module.exports = router;
