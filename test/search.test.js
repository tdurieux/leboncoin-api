const cheerio = require('cheerio');
const should = require('should');

const search = require("../lib/search.js");
const item = require("../lib/item.js");

describe('Search', function() {
    describe('GetUrl', function() {

        it('with query', function(done) {
            var s = new search.Search({
                query: "rénover OR réhabiliter OR investisseur"
            });
            s.getUrl().should.equal("http://www.leboncoin.fr/annonces/offres/ile_de_france/occasions?o=1&q=r%C3%A9nover+OR+r%C3%A9habiliter+OR+investisseur&f=a&ur=0&it=0");
            done();
        });

        it('check url wihout parameters', function(done) {
            var s = new search.Search();
            s.getUrl().should.equal("http://www.leboncoin.fr/annonces/offres/ile_de_france/occasions?o=1&f=a&ur=0&it=0");
            done();
        });

        it('check url with specified page', function(done) {
            var s = new search.Search()
                        .setPage(1);
            s.getUrl().should.equal("http://www.leboncoin.fr/annonces/offres/ile_de_france/occasions?o=1&f=a&ur=0&it=0");

            s = new search.Search({
                page: 1
            });
            s.getUrl().should.equal("http://www.leboncoin.fr/annonces/offres/ile_de_france/occasions?o=1&f=a&ur=0&it=0");

            s = new search.Search()
                        .setPage(2);
            s.getUrl().should.equal("http://www.leboncoin.fr/annonces/offres/ile_de_france/occasions?o=2&f=a&ur=0&it=0");

            s = new search.Search({
                page: 2
            });
            s.getUrl().should.equal("http://www.leboncoin.fr/annonces/offres/ile_de_france/occasions?o=2&f=a&ur=0&it=0");

            s = new search.Search()
                        .setPage('aa');
            s.getUrl().should.equal("http://www.leboncoin.fr/annonces/offres/ile_de_france/occasions?o=1&f=a&ur=0&it=0");


            s = new search.Search({
                page: 'aa'
            });
            s.getUrl().should.equal("http://www.leboncoin.fr/annonces/offres/ile_de_france/occasions?o=1&f=a&ur=0&it=0");

            done();
        });


        it('check search extra', function(done) {

            // without search extra
            var s = new search.Search();
            s.getUrl().should.equal("http://www.leboncoin.fr/annonces/offres/ile_de_france/occasions?o=1&f=a&ur=0&it=0");

            s = new search.Search({
                searchExtras: {
                    ps: 1000, // min price
                    pe: 20000 // max price
                }
            });
            s.getUrl().should.equal("http://www.leboncoin.fr/annonces/offres/ile_de_france/occasions?o=1&f=a&ur=0&it=0&ps=1000&pe=20000");

            s = new search.Search()
                        .addSearchExtra('ps', 1000)
                        .addSearchExtra('pe', 20000);
            s.getUrl().should.equal("http://www.leboncoin.fr/annonces/offres/ile_de_france/occasions?o=1&f=a&ur=0&it=0&ps=1000&pe=20000");
            done();
        });
    });

    describe('Parsers', function() {
        it('Parse NbResult', function(done) {
            const html = '<nav><ul class="navlist type"><li class="selected"><span class="name">Toutes</span><span class="value">1 - 35 de <b>2 109 564</b></span></li><li><a title="Afficher uniquement les annonces de Particuliers" href="http://www.leboncoin.fr/annonces/offres/nord_pas_de_calais/?f=p"><span class="name">Particuliers</span><span class="value">1 993 971 annonces</span></a></li><li><a title="Afficher uniquement les annonces de Professionnels" href="http://www.leboncoin.fr/annonces/offres/nord_pas_de_calais/?f=c"><span class="name">Professionnels</span><span class="value">115 593 annonces</span></a></li></ul></nav>';
            const $ = cheerio.load(html);
            var nbResult = search.parseNbResult($);
            nbResult.should.be.exactly(2109564);
            done();
        });

        it('Parse Entries', function(done) {
            const html = '<div class="list-lbc"><a href="http://www.leboncoin.fr/animaux/905817796.htm?ca=17_s" title="Poissons de bassin"><div class="lbc"><div class="date"><div>Aujourd\'hui</div><div>19:08</div></div><div class="image"><div class="image-and-nb"><img src="http://img6.leboncoin.fr/thumbs/881/8815dfeba3260d910f311a7b0d4aed3e1336651f.jpg" alt="Poissons de bassin"><div class="nb"><div class="top radius">&nbsp;</div><div class="value radius">1</div></div></div></div><div class="detail"><h2 class="title">Poissons de bassin</h2><div class="category">Animaux</div><div class="placement">Tressin/Nord</div><div class="price">1&nbsp;&euro;</div></div><div class="clear"></div></div></a><div class="clear"></div><a href="http://www.leboncoin.fr/vetements/877991952.htm?ca=17_s" title="Blouson cuir noir"><div class="lbc"><div class="date"><div>Hier</div><div>19:08</div></div><div class="image"><div class="image-and-nb"><img src="http://img2.leboncoin.fr/thumbs/bd7/bd70484d4ab2e95496033a30a9732575736c2eac.jpg" alt="Blouson cuir noir"><div class="nb"><div class="top radius">&nbsp;</div><div class="value radius">1</div></div></div></div><div class="detail"><h2 class="title">Blouson cuir noir</h2><div class="category">V&ecirc;tements</div><div class="placement">Tatinghem/Pas-de-Calais</div><div class="price">20&nbsp;&euro;</div></div><div class="clear"></div></div></a></div>';
            const $ = cheerio.load(html);
            var results = search.parseEntries($);

            results.should.have.length(2);

            results[0].should.have.property('title', 'Poissons de bassin');
            results[0].should.have.property('link', 'http://www.leboncoin.fr/animaux/905817796.htm?ca=17_s');
            results[0].should.have.property('location', 'Tressin/Nord');
            results[0].should.have.property('category', 'Animaux');
            results[0].should.have.property('price', 1);
            results[0].should.have.property('images');

            results[0].images[0].should.equal('http://img6.leboncoin.fr/images/881/8815dfeba3260d910f311a7b0d4aed3e1336651f.jpg');
            should(results[0].urgent).be.false();

            results[0].should.have.property('date');
            results[0].date.getDate().should.be.exactly(new Date().getDate());
            results[0].date.getHours().should.be.exactly(19);
            results[0].date.getMinutes().should.be.exactly(8);

            results[0].id.should.be.exactly(905817796);

            var yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            results[1].date.getDate().should.equal(yesterday.getDate())
            done();
        });
    });
    
    /*
    This test does not work on travis
    describe('Run', function() {
        it('Run without parameters', function(done) {
            new search.Search().run().then(function (data) {
                assert.equal(1, data.page);
                assert.equal(true, data.nbResult > 0);
                done();
            }, function (err) {
                done(err);
            });
        });
    });
    */
});