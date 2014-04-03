# html-rss-spider #

通过爬取站点的rss文档，从而爬取到站点中指定的内容。

演示地址：[html-rss-spider](http://112.124.35.12:3001)

## 安装 & 运行 ##

### 克隆项目到本地 ###

```
git clone https://github.com/happen-zhang/html-rss-spider.git path-to-your-dir
```

### 安装依赖 ###

```
cd path-to-your-dir

npm install
```

### 运行 ###

```
node app.js
```

## 配置 ##

### 端口 & 数据库 ###

```
config/config.json
```

### 超时时间 ###

`libs/spider_util.js`中`TIMEOUT`常量，默认为10秒。

### rss爬取站点 ###

可以在`config/rss_site_config.json`中配置需要爬取的rss站点，下面是对rss_site_config.json中配置项的说明：

```
ttl：int，服务器自动爬取rss信息的时间周期，单位分钟

sites：Array，保存需要爬取的rss站点

site.from：String，爬取站点的名称

site.contentTag：String，目标内容在Html源码中的标签，选择器形式，如<div id="content">...</div>，则应设置成"#content"

site.removeTag：Array，删除目标中不期望出现的内容，选择器形式

site.charset：String，目标页面的字符编码

channels：Array，站点的频道（分类）

channel.title：String，频道的名称

channel.link：String，频道的rss文档链接

channel.isWork：Boolean，设置是否需要进行爬取该频道

channel.rows：int, 指定爬取该频道rss的行数
```

## 说明 ##

与爬取相关的操作在`libs/spider_util.js`中。

## TODO ##

Test.....

## LICENSE ##

(The MIT License)

Copyright (c) 2014 happen-zhang <zhanghaipeng404@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
