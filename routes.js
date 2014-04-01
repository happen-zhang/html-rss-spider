/**
 * routes.js
 */

var post = require('./routes/post');

exports.handle = function(app) {
  app.get('/', post.index);
};
