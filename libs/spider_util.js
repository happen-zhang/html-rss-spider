/**
 * libs/spider_util.js
 */

var request = require('request');
var FeedParser = require('feedparser');
var Iconv = require('iconv').Iconv;
var BufferHelper = require('bufferhelper');

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

/**
 * 爬取rss页面
 * @param  {String}        url 需要爬取的rss页面的url  
 * @param  {Function} callback 回调函数
 */
function spiderRss(url, callback) {
  var req = request(url, reqOptions);
  var feedParser = new FeedParser();
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
    if (!iconv && charset && !/utf-*8/i.test(charset)) {
      try {
      	// 转换成对应的编码
        iconv = new Iconv(charset, CHARSET);
        iconv.on('error', done);
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

    callback(null, items);
  });
}

/**
 * 爬取html页面
 * @param  {String}          url 需要爬取的rss页面的url
 * @param  {Function}   callback 回调函数 
 */
function spiderHtml(url, callback) {
  var req = request(url, reqOptions);

  req.on('error', function(err) {
    if (err) {
      callback(err);
    }
  });
  req.on('response', function(res) {
    var bufferHelper = new BufferHelper();
    var iconv = null;
    var charset = getCharset(res.headers['content-type'] || '');
    var result = null;

    res.on('data', function(chunk) {
      bufferHelper.concat(chunk);
    });
    res.on('end', function() {
      if (charset && !isUTF8(charset)) {
        try {
          if (!iconv) {
            // 设置编码
            iconv = new Iconv(charset, CHARSET);
            iconv.on('error', function(err) {
              return callback(err);
            });
          }

          // 转换成对应的编码
          result = iconv.convert(bufferHelper.toBuffer()).toString();
        } catch(err) {
          this.emit('error', err);
        }
      } else {
        result = bufferHelper.toString();
      }

      callback(null, result);
    });
  });
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
