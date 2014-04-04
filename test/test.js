/**
 * test/test.js
 */

var spiderUtil = require('../libs/spider_util');
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

        spiderUtil.getHtmlTagContent(html, tagetTag, rmTags)
                  .should.equal(result);
      });

      it('getFirstImg', function() {
        spiderUtil.getFirstImg(html).should.equal('pathtoimg');
        should.not.exist(spiderUtil.getFirstImg('<p>noimg</p>'));
      });
  });

  it('getParams', function() {
    var ct = 'content-type: text/html; charset=utf8'
    var parts = spiderUtil.getParams(ct);

    parts.hasOwnProperty('charset').should.true;
    parts.charset.should.equal('utf8');
  });

  it('getCharsetFromContentType', function() {
  	var ct = 'content-type: text/html; charset=utf8'
    spiderUtil.getCharsetFromContentType(ct).should.equal('utf8');
  });

  it('isUTF8', function() {
  	spiderUtil.isUTF8('utf8').should.true;
  	spiderUtil.isUTF8('UTF8').should.true;
    spiderUtil.isUTF8('utf-8').should.true;
    spiderUtil.isUTF8('utf-  8').should.false;
  });
});
