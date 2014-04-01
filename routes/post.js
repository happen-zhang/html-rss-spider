/**
 * routes/post.js
 */

var Post = require('../models/post');

exports.index = function(req, res) {
  res.render('index');
};
