const cheerio = require('cheerio');
const should = require('should');

const user = require("../lib/user.js");

describe('User', function() {
    this.timeout(500000);
    
    describe('login', function() {
        it('via options', function(done) {
            
            var u = new user.User({"email": "test@leeching.net", "password": "123456789a"});
            u.login().then(function (user) {
                done();
            }, function (error) {
                done(error);
            });
        });
    });

    describe('logout', function() {
        it('via options', function(done) {
            var u = new user.User({"email": "test@leeching.net", "password": "123456789a"});
            u.login().then(function (user) {
                u.logout().then(function (user) {
                    done();
                }, done);
            }, function (error) {
                done(error);
            });
        });
    });
});