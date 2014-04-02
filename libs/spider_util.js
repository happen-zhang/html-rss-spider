/**
 * libs/spider_util.js
 */

var request = require('request');
var FeedParser = require('feedparser');
var Iconv = require('iconv').Iconv;
var BufferHelper = require('bufferhelper');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');

var CHARSET = 'utf-8';
var TIMEOUT = 10 * 1000;

// request选项
var reqOptions = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) '
                  + 'AppleWebKit/537.36 (KHTML, like Gecko) '
                  + 'Chrome/31.0.1650.63 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml' 
  },
  timeout: TIMEOUT,
  pool: false
};

// feedparser选项
var feedParserOptions = {
  'addmeta': false
};

/**
 * 爬取rss页面
 * @param  {String}        url 需要爬取的rss页面的url
 * @param  {Int}          rows 需要爬取的rss条数
 * @param  {Function} callback 回调函数
 */
function spiderRss(url, rows, callback) {
  var req = request(url, reqOptions);
  var feedParser = new FeedParser(feedParserOptions);
  var iconv = null;
  var items = null;
  var charset = null;

  req.on('error', function(err) {
    if (err) {
      callback(err);
    }
  });
  req.on('response', function(res) {
    var stream = this;

    if (200 != res.statusCode) {
      // 请求失败
      return this.emit('error', new Error('Bad status code'));
    }

    // 转换charset
    charset = getCharset(res.headers['content-type'] || '');
    if (!iconv && charset && !isUTF8()) {
      try {
        // 转换成对应的编码
        iconv = new Iconv(charset, CHARSET);
        iconv.on('error', function(err) {
          if (err) {
            return callback(err);
          }
        });
        stream = this.pipe(iconv);
      } catch(err) {
        this.emit('error', err);
      }
    }

    items = [];
    // feed parse
    stream.pipe(feedParser);
  });

  feedParser.on('error', function(err) {
    if (err) {
      callback(err);
    }
  });
  feedParser.on('readable', function() {
    var item = null;
    while (item = this.read()) {
      items.push(item);
    }
  });
  feedParser.on('end', function(err) {
    if (err) {
      return callback(err);
    }

    console.log(rows);

    if (rows && !isNaN(parseInt(rows))) {
      items = items.slice(0, rows);
    }

    callback(null, items);
  });
}

/**
 * 爬取html页面
 * @param  {String}          url 需要爬取的rss页面的url
 * @param  {String}      charset 页面的charset
 * @param  {Function}   callback 回调函数
 */
function spiderHtml(url, charset, callback) {
  var req = request(url, reqOptions);

  req.on('error', function(err) {
    if (err) {
      callback(err);
    }
  });
  req.on('response', function(res) {
    var bufferHelper = new BufferHelper();
    var result = null;

    res.on('data', function(chunk) {
      bufferHelper.concat(chunk);
    });
    res.on('end', function() {
      result = iconv.decode(bufferHelper.toBuffer(), charset);
      callback(null, result);
    });
  });
}

/**
 * 爬取html页面中的指定tag中的内容，并且支持删除tag
 * @param  {String} url     需要爬取的url
 * @param  {String} htmlTag 需要得到内容对应的html tag
 * @param  {Array} rmTag   需要删除的tag
 */
function spiderContent(url, charset, htmlTag, rmTag, callback) {
  spiderHtml(url, charset, function(err, html) {
    var $ = null;
    var img = null;
    var content = null;
    var titlePic = null;

    if (err) {
      return callback(err);
    }

    content = getHtmlTagContent(html, htmlTag, rmTag);
    img = getFirstImg(content);

    // 内容和标题图片
    callback(null, getHtmlTagContent(html, htmlTag, rmTag), img);
  });
}

/**
 * 得到页面中指定<Tag>的区域内容
 * @param  {String}   html     html内容
 * @param  {String}   htmlTag  需要截取的html tag
 * @param  {Array}    rmTag    需要移除的html tag
 * @return {String}
 */
function getHtmlTagContent(html, htmlTag, rmTags) {
  var $ = cheerio.load(html);

  if (Array.isArray(rmTags)) {
    rmTags.forEach(function(tag) {
      $(tag).remove();
    });
  }

  return $(htmlTag).html();
}

/**
 * 得到内容中的第一个img
 * @param  {String} content 包含img的内容
 * @return {String}
 */
function getFirstImg(content) {
  var $ = cheerio.load(content);
  var img = $('img')[0];
  var src = null;

  if (img) {
    src = $(img).attr('src');
  }

  return src;
}

/**
 * 从header中得到键值对象
 * @param  {String} src 需要解析的header
 * @return {Object}
 */
function getParams(src) {
  var params = src.split(';').reduce(function(pairs, pair) {
    var parts = pair.split('=').map(function(part) {
      return part.trim();
    });

    if (2 === parts.length) {
      pairs[parts[0]] = parts[1];
    }

    return pairs;
  }, {});

  return params;
}

/**
 * 解析的content-type中的charset
 * @param  {String} contentType 需要解析的content-type内容
 * @return {String}
 */
function getCharsetFromContentType(contentType) {
  return getParams(contentType).charset;
}

/**
 * 解析meta中的charset
 * @param  {String} html 需要解析的html
 * @return {String}
 */
function getCharsetFromMeta(html) {
  var matched = html.match(/<meta.+?charset=([-\w]+)/i);
  return matched[1];
}

/**
 * 得到charset
 * @param  {String} contentType
 * @param  {String} html
 * @return {String}
 */
function getCharset(contentType, html) {
  var charset = getCharsetFromContentType(contentType);
  if (!charset && html) {
    return getChartsetFromMeta(html);
  }

  return charset;
}

/**
 * 是否utf8
 * @param  {String}  charset
 * @return {Boolean}
 */
function isUTF8(charset) {
  return /utf-*8/i.test(charset);
}

exports.spiderRss = spiderRss;
exports.spiderHtml = spiderHtml;
exports.spiderContent = spiderContent;
