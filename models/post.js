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

module.exports = mongoose.model('Post', PostSchema);
