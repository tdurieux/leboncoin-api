const filter = require('../lib/filters.js');
const should = require("should");
const search = require("../lib/search.js");
const item = require("../lib/item.js");

describe('Item', function() {
    describe('GetUrl', function() {
        it('with id', function(done) {
            var i = new item.Item({id: 905817796});
            i.getUrl().should.equal("http://www.leboncoin.fr/cat/905817796.htm/");
            done()
        });

        it('with id and category', function(done) {
            var i = new item.Item({id: 905817796, category: "annimal"});
            i.getUrl().should.equal("http://www.leboncoin.fr/annimal/905817796.htm/");
            done()
        });

        it('with link', function(done) {
            var i = new item.Item({link: "http://www.leboncoin.fr/annimal/905817796.htm/"});
            i.getUrl().should.equal("http://www.leboncoin.fr/annimal/905817796.htm/");
            done()
        });
    });

    
    describe('getDetails', function() {
        this.timeout(500000);
        it('Get the details of an item', function(done) {
            new search.Search().run().then(function (data) {
                data.results[0].getDetails().then(function (data) {
                    data.should.have.property('images');
                    data.should.have.property('description');
                    data.should.have.property('title');
                    data.should.have.property('id');
                    //console.log(data);
                    done()
                }, function (err) {
                    done(err);
                });
            }, function (err) {
                done(err);
            });
        });
    });
    /*describe('GetPhoneNumber', function() {
        this.timeout(500000);
        it('get phone number 1', function(done) {
            new search.Search()
                .setPage(1)
                .setQuery("renove")
                .run().then(function (data) {
                data.results[0].getPhoneNumber().then(function (phone) {
                    done(null, phone);
                }, function (err) {
                    done(err);
                });
            }, function (err) {
                done(err);
            });
        });
    });*/
    
});
