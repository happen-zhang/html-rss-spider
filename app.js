/**
 * app.js
 */

var express = require('express');
var http = require('http');
var path = require('path');

var config = require('./config/config.json');
var rssSiteConfig = require('./config/rss_site_config.json');

var postService = require('./service/post');
var db = require('./models/db');
var routes = require('./routes');

var app = express();
var staticPath = path.join(__dirname, 'public');
var faviconPath = staticPath + '/icon.png';

app.locals.moment= require('moment');

app.set('port', config.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(staticPath));
app.use(express.favicon(faviconPath));
app.use(express.logger('dev'));

// development
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

// 每隔ttl分钟爬取一次
(function schedule() {
  setTimeout(function() {
    console.log('Begin spider...');
    postService.spiderRss(function(err) {
      if (err) {
        console.log(err);
      }

      schedule();
    });
  }, rssSiteConfig.ttl * 1000 * 60);
})();

// 路由
routes.handle(app);

http.createServer(app).listen(app.get('port'), function() {
  console.log('Server listening on port ' + app.get('port'));
});
