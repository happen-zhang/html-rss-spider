/**
 * models/post.js
 */

var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
  // 链接
  link: String,
  // 标题
  title: {
    type: String,
    unique: true
  },
  // 图片
  titlePic: String,
  // 内容
  content: String,
  // 描述
  description: String,
  // 发布内容
  pubDate: {
    type: Date,
    default: Date.now
  },
  source: String,
  typeId: Number,
});

/**
 * 按typeId得到post
 * @param  {int}   tid      [description]
 * @param  {int}   skip     [description]
 * @param  {int}   limit    [description]
 * @param  {String}   fields   [description]
 */
PostSchema.static('findByTypeId', function(tid, skip, limit, fields,callback) {
  var options = {
    skip: skip,
    limit: limit,
    sort: {
      _id: -1
    }
  };

  return this.find({ typeId: tid }, fields, options, callback);
});

module.exports = mongoose.model('Post', PostSchema);
