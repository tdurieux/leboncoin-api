const cheerio = require('cheerio');
const assert = require("assert");

const search = require("../lib/search.js");
const item = require("../lib/item.js");

describe('Item', function() {
    describe('GetUrl', function() {
        it('with id', function(done) {
            var i = new item.Item({id: 905817796});
            assert.equal("http://www.leboncoin.fr/cat/905817796.htm?ca=17_s", i.getUrl());
            done()
        });

        it('with id and category', function(done) {
            var i = new item.Item({id: 905817796, category: "annimal"});
            assert.equal("http://www.leboncoin.fr/annimal/905817796.htm?ca=17_s", i.getUrl());
            done()
        });

        it('with link', function(done) {
            var i = new item.Item({link: "http://www.leboncoin.fr/annimal/905817796.htm?ca=17_s"});
            assert.equal("http://www.leboncoin.fr/annimal/905817796.htm?ca=17_s", i.getUrl());
            done()
        });

    });

    describe('GetPhoneNumber', function() {
        it('parsePhoneNumberImage 1', function(done) {
            item.parsePhoneNumberImage('./test/assets/phone1.gif').then(function (phoneNumber) {
                assert.equal("0609064893", phoneNumber);
                done();
            }, done);
        });

        it('parsePhoneNumberImage 2', function(done) {
            item.parsePhoneNumberImage('./test/assets/phone2.gif').then(function (phoneNumber) {
                assert.equal("0672341635", phoneNumber);
                done();
            }, done);
        });

        it('parsePhoneNumberImage 3', function(done) {
            item.parsePhoneNumberImage('./test/assets/phone3.gif').then(function (phoneNumber) {
                assert.equal("0611404567", phoneNumber);
                done();
            }, done);
        });

    });
});