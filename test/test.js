/**
 * test/test.js
 */

var rewire = require('rewire');
var spiderUtil = rewire('../libs/spider_util');

var getHtmlTagContent = spiderUtil.__get__('getHtmlTagContent');
var getFirstImg = spiderUtil.__get__('getFirstImg');
var getParams = spiderUtil.__get__('getParams');
var getCharsetFromContentType =spiderUtil.__get__('getCharsetFromContentType');
var isUTF8 = spiderUtil.__get__('isUTF8');

var should = require('chai').should();

describe('spider_util', function() {
  describe('html tag', function() {
      var html = null;

      before(function() {
        html = '<div class="post">'
                + '<div class="content">'
                + '<p>hello world</p>'
                + '<p class="image"><img src="pathtoimg" alt="none"></p>'
                + '<p class="image"><img src="pnf" alt="none"></p>'
                + '<p class="other">other</p>'
                + '</div>';
                + '</div>';
      });

      it('getHtmlTagContent', function() {
        var result = '<p>hello world</p>'
                     + '<p class="image"><img src="pathtoimg" alt="none"></p>'
                     + '<p class="image"><img src="pnf" alt="none"></p>';
        var tagetTag = '.content';
        var rmTags = ['.other'];

        getHtmlTagContent(html, tagetTag, rmTags).should.equal(result);
      });

      it('getFirstImg', function() {
        getFirstImg(html).should.equal('pathtoimg');
        should.not.exist(getFirstImg('<p>noimg</p>'));
      });
  });

  it('getParams', function() {
    var ct = 'content-type: text/html; charset=utf8'
    var parts = getParams(ct);

    parts.hasOwnProperty('charset').should.true;
    parts.charset.should.equal('utf8');
  });

  it('getCharsetFromContentType', function() {
    var ct = 'content-type: text/html; charset=utf8'
    getCharsetFromContentType(ct).should.equal('utf8');
  });

  it('isUTF8', function() {
    isUTF8('utf8').should.true;
    isUTF8('UTF8').should.true;
    isUTF8('utf-8').should.true;
    isUTF8('utf-  8').should.false;
  });
});
