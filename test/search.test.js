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
            const html = '<header class="tabsHeader clearfix"><nav class="fl"><a href="//www.leboncoin.fr/annonces/offres/ile_de_france/occasions/?ur=1" title="Afficher toutes les annonces" class="tabsSwitch trackable active" data-info=\'{"event_name" : "ad_search::onglet::toutes_les_annonces", "event_type" : "click", "event_s2" : "8", "click_type" : "N"}\'>Toutes<span class="tabsSwitchNumbers small-hidden tiny-hidden"> 21 661</span></a><a href="//www.leboncoin.fr/annonces/offres/ile_de_france/occasions/?ur=1&amp;f=p" title="Afficher uniquement les annonces de Particuliers" class="tabsSwitch trackable" data-info=\'{"event_name" : "ad_search::onglet::particuliers", "event_type" : "click", "event_s2" : "8", "click_type" : "N"}\'>Part<span class="custom-medium-hidden">iculiers</span><span class="tabsSwitchNumbers small-hidden tiny-hidden"> 14 451</span></a><a href="//www.leboncoin.fr/annonces/offres/ile_de_france/occasions/?ur=1&amp;f=c" title="Afficher uniquement les annonces de Professionnels" class="tabsSwitch trackable" data-info=\'{"event_name" : "ad_search::onglet::professionnels", "event_type" : "click", "event_s2" : "8", "click_type" : "N"}\'>Pro<span class="custom-medium-hidden">fessionnels</span><span class="tabsSwitchNumbers small-hidden tiny-hidden"> 7 210</span></a></nav><article class="list_properties"> <a title="Trier les annonces par prix" href="//www.leboncoin.fr/annonces/offres/ile_de_france/occasions/?ur=1&amp;sp=1" class="trackable" data-info=\'{"event_name" : "ad_search::trier_par_prix", "event_type" : "click", "event_s2" : "8", "click_type" : "N"}\'><i class="icon-currency-eur"></i>Tri<span class="custom-medium-hidden">er par prix</span></a> </article></header>';
            const $ = cheerio.load(html);
            var nbResult = search.parseNbResult($);
            nbResult.should.be.exactly(21661);
            done();
        });

        it('Parse Entries', function(done) {
            const html = '<section class="list mainList tabs"><!-- Listing filters --><!-- Listing list --><ul class="tabsContent dontSwitch block-white"> <li> <a href="//www.leboncoin.fr/campings/921756076.htm?ca=12_s" title="Location Mobil home, gite, chalet, week&#45;end," class="list_item clearfix trackable" data-info=\'{"event_type" : "selfpromotion", "campaign" : "ad_search", "ad_listid" : "921756076", "ad_location" : "list_content", "ad_position" : "1", "ad_type" : "offres", "ad_offres" : "pro", "ad_options" : "|gallery|ldv|urgent|"}\'> <!-- Listing item image --> <div class="item_image"> <span class="item_imagePic"> <span class="lazyload" style="display:block; width:100%; height:100%;" data-imgSrc="//img1.leboncoin.fr/thumbs/8f1/8f19d808a3d69b3cc49a006a3e74de9cdf6d6e3e.jpg" data-imgAlt="Location Mobil home, gite, chalet, week&#45;end,"></span> </span> <span class="item_imageNumber"> <i class="icon-camera icon-2x nomargin"></i> <span>10</span> </span> </div> <!-- Listing item info --> <section class="item_infos"> <h2 class="item_title"> Location Mobil home, gite, chalet, week&#45;end, </h2> <p class="item_supp"> <span class="ispro">(pro)</span> Campings </p> <p class="item_supp"> Renty / Pas-de-Calais </p> <h3 class="item_price">95&nbsp;&euro; - 155&nbsp;&euro;</h3> <aside class="item_absolute"> <p class="item_supp"> <span class="item_supp emergency"><i class="icon-star"></i>Urgent</span> 28 fév, 23:29 </p> </aside> </section> </a> </li></ul></selection>';
            const $ = cheerio.load(html);
            var results = search.parseEntries($);

            results.should.have.length(1);

            results[0].should.have.property('title', 'Location Mobil home, gite, chalet, week-end,');
            results[0].should.have.property('link', '//www.leboncoin.fr/campings/921756076.htm?ca=12_s');
            results[0].should.have.property('location', 'Renty / Pas-de-Calais');
            results[0].should.have.property('category', 'Campings');
            results[0].should.have.property('price', 95);
            results[0].should.have.property('images');

            results[0].images[0].should.equal('//img1.leboncoin.fr/images/8f1/8f19d808a3d69b3cc49a006a3e74de9cdf6d6e3e.jpg');
            should(results[0].urgent).be.true();

            results[0].should.have.property('date');
            results[0].date.getDate().should.be.exactly(28);
            results[0].date.getMonth().should.be.exactly(1); // February
            results[0].date.getHours().should.be.exactly(23);
            results[0].date.getMinutes().should.be.exactly(29);

            results[0].id.should.be.exactly(921756076);
            done();
        });
    });
    
    
    describe('Run', function() {
        this.timeout(50000);
        it('Run without parameters', function(done) {
            new search.Search().run().then(function (data) {
                data.page.should.be.exactly(1);
                done();
            }, function (err) {
                done(err);
            });
        });
    });
});
