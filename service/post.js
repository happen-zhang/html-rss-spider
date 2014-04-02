/**
 * service/post.js
 */

var rssSiteConfig = require('../config/rss_site_config.json');

var spiderUtil = require('../libs/spider_util');
var Post = require('../models/post');

/**
 * 爬取rss内容并存入数据库
 */
function spiderRss(callback) {
  var sites = rssSiteConfig.sites;
  var rows = 0;

  sites.forEach(function(site) {
    site.channels.forEach(function(channel) {
      // 是否爬取
      if (false === channel.isWork) {
        return ;
      }

      // 开始爬取
      spiderUtil.spiderRss(channel.link, function(err, items) {
        if (err) {
          return callback(err);
        }

        // 爬取每条item中的link
        items.forEach(function(item) {
          spiderUtil.spiderContent(item.link,
                                   site.charset,
                                   site.contentTag,
                                   site.removeTag,
                                   function(err, content, titlePic) {
            if (err) {
              return callback(err);
            }

            if (!titlePic) {
              titlePic = '/icon.png';
            }

            if (!content) {
              content = '';
            }

            // 保存到数据库中b
            new Post({
              link: item.link,
              title: item.title,
              titlePic: titlePic,
              content: content,
              description: item.description,
              pubDate: item.pubDate,
              source: site.from,
              typeId: channel.typeId
            }).save(function(err, post) {
              if (err) {
                return callback(err);
              }
            });

            callback(null, ++rows);
          });
        });
      });
    });
  });
}

exports.spiderRss = spiderRss;
