var assert = require("assert");
var leboncoin = require("../main.js");

describe('Search', function() {
    it('check url wihout parameters', function(done) {
        var s = new leboncoin.Search();
        assert.equal("http://www.leboncoin.fr/annonces/offres/ile_de_france/occasions?o=1&f=a&ur=0&it=0", s.getUrl());
        done();
    });

    it('check url with specified page', function(done) {
        var s = new leboncoin.Search()
                    .setPage(1);
        assert.equal("http://www.leboncoin.fr/annonces/offres/ile_de_france/occasions?o=1&f=a&ur=0&it=0", s.getUrl());

        s = new leboncoin.Search({
            page: 1
        });
        assert.equal("http://www.leboncoin.fr/annonces/offres/ile_de_france/occasions?o=1&f=a&ur=0&it=0", s.getUrl());

        s = new leboncoin.Search()
                    .setPage(2);
        assert.equal("http://www.leboncoin.fr/annonces/offres/ile_de_france/occasions?o=2&f=a&ur=0&it=0", s.getUrl());

        s = new leboncoin.Search({
            page: 2
        });
        assert.equal("http://www.leboncoin.fr/annonces/offres/ile_de_france/occasions?o=2&f=a&ur=0&it=0", s.getUrl());

        s = new leboncoin.Search()
                    .setPage('aa');
        assert.equal("http://www.leboncoin.fr/annonces/offres/ile_de_france/occasions?o=1&f=a&ur=0&it=0", s.getUrl());


        s = new leboncoin.Search({
            page: 'aa'
        });
        assert.equal("http://www.leboncoin.fr/annonces/offres/ile_de_france/occasions?o=1&f=a&ur=0&it=0", s.getUrl());

        done();
    });


    it('check search extra', function(done) {

        // without search extra
        var s = new leboncoin.Search();
        assert.equal("http://www.leboncoin.fr/annonces/offres/ile_de_france/occasions?o=1&f=a&ur=0&it=0", s.getUrl());

        s = new leboncoin.Search({
            searchExtras: {
                ps: 1000, // min price
                pe: 20000 // max price
            }
        });
        assert.equal("http://www.leboncoin.fr/annonces/offres/ile_de_france/occasions?o=1&f=a&ur=0&it=0&ps=1000&pe=20000", s.getUrl());

        s = new leboncoin.Search()
                    .addSearchExtra('ps', 1000)
                    .addSearchExtra('pe', 20000);
        assert.equal("http://www.leboncoin.fr/annonces/offres/ile_de_france/occasions?o=1&f=a&ur=0&it=0&ps=1000&pe=20000", s.getUrl());
        done();
    });
});