/**
 * routes/post.js
 */

var async = require('async');

var sites = require('../config/rss_site_config.json').sites;

var Post = require('../models/post');

var QUEUE_SIZE = 5;

exports.index = function(req, res) {
  var channelList = [];
  var fields = '_id titlePic link title pubDate source';

  // 任务队列
  var queue = async.queue(function(channel, callback) {
    var result = {};
    Post.findByTypeId(channel.typeId, 0, 5, fields, function(err, posts) {
      if (err) {
        return console.log(err);
      }

      result.typeName = channel.title;
      result.posts = posts;
      callback(result);
    });
  }, QUEUE_SIZE);

  sites.forEach(function(site) {
    site.channels.forEach(function(channel) {
      if (false != channel.isWork) {
        queue.push(channel, function(result) {
          channelList.push(result);
        });
      }
    });
  });

  // 任务队列执行完成
  queue.drain = function() {
    res.render('index', { 'channelList': channelList });
  };
};

exports.show = function(req, res) {
  Post.findById(req.params.id, function(err, post) {
    if (err) {
      res.status(500);
      return res.send('System error!');
    }

    if (null == post) {
      res.status(404);
      return res.send('Not Found!');
    }

    res.render('post', { post: post });
  });
}
