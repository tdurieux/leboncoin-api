const search = require("../lib/search.js");
const item = require("../lib/item.js");
const filters = require("../lib/filters.js");

describe('Search', function() {
    describe('GetBodyParams', function() {

        it('with query', function(done) {
            var s = new search.Search({
                query: "rénover OR réhabiliter OR investisseur"
            });
            var bodyParams = JSON.stringify(s.getBodyParams())
            bodyParams.should.equal("{\"limit\":35,\"filters\":{\"category\":{\"id\":null},\"enums\":{\"ad_type\":[\"offer\"]},\"location\":{},\"keywords\":{\"text\":\"rénover OR réhabiliter OR investisseur\"},\"ranges\":{}},\"offset\":0,\"owner_type\":null,\"sort_by\":null,\"sort_order\":null}");
            done();
        });

        it('check url wihout parameters', function(done) {
            var s = new search.Search();
            var bodyParams = JSON.stringify(s.getBodyParams())
            bodyParams.should.equal("{\"limit\":35,\"filters\":{\"category\":{\"id\":null},\"enums\":{\"ad_type\":[\"offer\"]},\"location\":{},\"keywords\":{},\"ranges\":{}},\"offset\":0,\"owner_type\":null,\"sort_by\":null,\"sort_order\":null}");
            done();
        });

        it('check url with specified page', function(done) {
            var s = new search.Search()
                        .setRegion("ile_de_france")
                        .setPage(1);

            var bodyParams = JSON.stringify(s.getBodyParams())
            var expectedBodyParams = "{\"limit\":35,\"filters\":{\"category\":{\"id\":null},\"enums\":{\"ad_type\":[\"offer\"]},\"location\":{\"region\":\"12\"},\"keywords\":{},\"ranges\":{}},\"offset\":0,\"owner_type\":null,\"sort_by\":null,\"sort_order\":null}";
            bodyParams.should.equal(expectedBodyParams);


            s = new search.Search({
                page: 1
            });
            bodyParams = JSON.stringify(s.getBodyParams())
            expectedBodyParams = "{\"limit\":35,\"filters\":{\"category\":{\"id\":null},\"enums\":{\"ad_type\":[\"offer\"]},\"location\":{},\"keywords\":{},\"ranges\":{}},\"offset\":0,\"owner_type\":null,\"sort_by\":null,\"sort_order\":null}";
            bodyParams.should.equal(expectedBodyParams);

            s = new search.Search()
                        .setPage(2);
            bodyParams = JSON.stringify(s.getBodyParams())
            expectedBodyParams = "{\"limit\":35,\"filters\":{\"category\":{\"id\":null},\"enums\":{\"ad_type\":[\"offer\"]},\"location\":{},\"keywords\":{},\"ranges\":{}},\"offset\":35,\"owner_type\":null,\"sort_by\":null,\"sort_order\":null}";
            bodyParams.should.equal(expectedBodyParams);

            s = new search.Search({
                page: 2
            });
            bodyParams = JSON.stringify(s.getBodyParams())
            expectedBodyParams = "{\"limit\":35,\"filters\":{\"category\":{\"id\":null},\"enums\":{\"ad_type\":[\"offer\"]},\"location\":{},\"keywords\":{},\"ranges\":{}},\"offset\":35,\"owner_type\":null,\"sort_by\":null,\"sort_order\":null}";
            bodyParams.should.equal(expectedBodyParams);

            s = new search.Search()
                        .setPage('aa');
            bodyParams = JSON.stringify(s.getBodyParams())
            expectedBodyParams = "{\"limit\":35,\"filters\":{\"category\":{\"id\":null},\"enums\":{\"ad_type\":[\"offer\"]},\"location\":{},\"keywords\":{},\"ranges\":{}},\"offset\":0,\"owner_type\":null,\"sort_by\":null,\"sort_order\":null}";
            bodyParams.should.equal(expectedBodyParams);

            s = new search.Search({
                page: 'aa'
            });
            bodyParams = JSON.stringify(s.getBodyParams())
            expectedBodyParams = "{\"limit\":35,\"filters\":{\"category\":{\"id\":null},\"enums\":{\"ad_type\":[\"offer\"]},\"location\":{},\"keywords\":{},\"ranges\":{}},\"offset\":0,\"owner_type\":null,\"sort_by\":null,\"sort_order\":null}";
            bodyParams.should.equal(expectedBodyParams);

            done();
        });

        it('check search extra', function(done) {

            // without search extra
            var s = new search.Search();
            var bodyParams = JSON.stringify(s.getBodyParams());
            var expectedBodyParams = "{\"limit\":35,\"filters\":{\"category\":{\"id\":null},\"enums\":{\"ad_type\":[\"offer\"]},\"location\":{},\"keywords\":{},\"ranges\":{}},\"offset\":0,\"owner_type\":null,\"sort_by\":null,\"sort_order\":null}";
            bodyParams.should.equal(expectedBodyParams);

            s = new search.Search({
                searchExtras: {
                    price: {min: 1000, max: 20000} // price range min and max
                }
            });
            bodyParams = JSON.stringify(s.getBodyParams());
            expectedBodyParams = "{\"limit\":35,\"filters\":{\"category\":{\"id\":null},\"enums\":{\"ad_type\":[\"offer\"]},\"location\":{},\"keywords\":{},\"ranges\":{}},\"offset\":0,\"owner_type\":null,\"sort_by\":null,\"sort_order\":null}";
            bodyParams.should.equal(expectedBodyParams);

            s = new search.Search({
                category: 2,
                searchExtras: {
                    price: {min: 1000, max: 20000} // price range min and max
                }
            });

            bodyParams = JSON.stringify(s.getBodyParams());
            expectedBodyParams = "{\"limit\":35,\"filters\":{\"category\":{\"id\":2},\"enums\":{\"ad_type\":[\"offer\"]},\"location\":{},\"keywords\":{},\"ranges\":{\"price\":{\"min\":1000,\"max\":20000}}},\"offset\":0,\"owner_type\":null,\"sort_by\":null,\"sort_order\":null}";
            bodyParams.should.equal(expectedBodyParams);

            done();
        });

        it('check bike criteria', function(done) {
            var s = new search.Search({
                category: 2
            }).setMileAge({min : 20000, max : 30000});
            bodyParams = JSON.stringify(s.getBodyParams());
            expectedBodyParams = "{\"limit\":35,\"filters\":{\"category\":{\"id\":2},\"enums\":{\"ad_type\":[\"offer\"]},\"location\":{},\"keywords\":{},\"ranges\":{\"mileage\":{\"min\":20000,\"max\":30000}}},\"offset\":0,\"owner_type\":null,\"sort_by\":null,\"sort_order\":null}";
            bodyParams.should.equal(expectedBodyParams);

            done();
        });

        it('check title only', function(done) {
            var s = new search.Search({
                category: 2,
                query: "tiger"
            })
            .setTitleOnly(true);
            bodyParams = JSON.stringify(s.getBodyParams());
            expectedBodyParams = "{\"limit\":35,\"filters\":{\"category\":{\"id\":2},\"enums\":{\"ad_type\":[\"offer\"]},\"location\":{},\"keywords\":{\"text\":\"tiger\",\"type\":\"subject\"},\"ranges\":{}},\"offset\":0,\"owner_type\":null,\"sort_by\":null,\"sort_order\":null}";
            bodyParams.should.equal(expectedBodyParams);

            done();
        });

        it('check departement', function(done) {
            var s = new search.Search({
                category: 2,
                region : "provence_alpes_cote_d_azur",
                department : "alpes_maritimes"
            });
            bodyParams = JSON.stringify(s.getBodyParams());
            expectedBodyParams = "{\"limit\":35,\"filters\":{\"category\":{\"id\":2},\"enums\":{\"ad_type\":[\"offer\"]},\"location\":{\"region\":\"21\",\"department\":\"6\"},\"keywords\":{},\"ranges\":{}},\"offset\":0,\"owner_type\":null,\"sort_by\":null,\"sort_order\":null}";
            done();
        });

        it('check search with location', function (done) {
            var s = new search.Search()
                .setRegion("ile_de_france")
                .setDepartment("yvelines")
                .setPage(1);

            var bodyParams = JSON.stringify(s.getBodyParams())
            var expectedBodyParams = "{\"limit\":35,\"filters\":{\"category\":{\"id\":null},\"enums\":{\"ad_type\":[\"offer\"]},\"location\":{\"region\":\"12\",\"department\":\"78\"},\"keywords\":{},\"ranges\":{}},\"offset\":0,\"owner_type\":null,\"sort_by\":null,\"sort_order\":null}";
            bodyParams.should.equal(expectedBodyParams);

            var s = new search.Search()
                .setRegion("ile_de_france")
                .setLocation([{"zipcode":"78100"}])
                .setPage(1);

            var bodyParams = JSON.stringify(s.getBodyParams())
            var expectedBodyParams = "{\"limit\":35,\"filters\":{\"category\":{\"id\":null},\"enums\":{\"ad_type\":[\"offer\"]},\"location\":{\"region\":\"12\",\"city_zipcodes\":[{\"zipcode\":\"78100\"}]},\"keywords\":{},\"ranges\":{}},\"offset\":0,\"owner_type\":null,\"sort_by\":null,\"sort_order\":null}";
            bodyParams.should.equal(expectedBodyParams);

            done();
        });

        it('check search with area', function (done) {
            var s = new search.Search()
                .setArea({
                    "lat": 48.8861712,
                    "lng": 2.3581992,
                    "radius": 10000
                })
                .setPage(1);

            var bodyParams = JSON.stringify(s.getBodyParams())
            var expectedBodyParams = "{\"limit\":35,\"filters\":{\"category\":{\"id\":null},\"enums\":{\"ad_type\":[\"offer\"]},\"location\":{\"area\":{\"lat\":48.8861712,\"lng\":2.3581992,\"radius\":10000}},\"keywords\":{},\"ranges\":{}},\"offset\":0,\"owner_type\":null,\"sort_by\":null,\"sort_order\":null}";
            bodyParams.should.equal(expectedBodyParams);

            done();
        });
    });

    
    describe('SetCategory', function() {

        it('check when category is a number', function(done) {
            var s = new search.Search();
            s.setCategory(5);
            
            s.category.should.equal(5);
            done();
        });

        it('check when category is a sub category name', function(done) {
            var s = new search.Search();
            s.setCategory('electromenager');
            
            s.category.should.equal('20');
            done();
        });

        it('check when category is a main category name', function(done) {
            var s = new search.Search();
            s.setCategory('_maison_');
            
            s.category.should.equal('18');
            done();
        });
    });

    // describe('Parsers', function() {
    //     it('Parse NbResult', function(done) {
    //         var html = '<header class="tabsHeader clearfix"><nav class="fl"><a href="//www.leboncoin.fr/annonces/offres/ile_de_france//?ur=1" title="Afficher toutes les annonces" class="tabsSwitch trackable active" data-info=\'{"event_name" : "ad_search::ongvar::toutes_les_annonces", "event_type" : "click", "event_s2" : "8", "click_type" : "N"}\'>Toutes<span class="tabsSwitchNumbers small-hidden tiny-hidden"> 21 661</span></a><a href="//www.leboncoin.fr/annonces/offres/ile_de_france//?ur=1&amp;f=p" title="Afficher uniquement les annonces de Particuliers" class="tabsSwitch trackable" data-info=\'{"event_name" : "ad_search::ongvar::particuliers", "event_type" : "click", "event_s2" : "8", "click_type" : "N"}\'>Part<span class="custom-medium-hidden">iculiers</span><span class="tabsSwitchNumbers small-hidden tiny-hidden"> 14 451</span></a><a href="//www.leboncoin.fr/annonces/offres/ile_de_france//?ur=1&amp;f=c" title="Afficher uniquement les annonces de Professionnels" class="tabsSwitch trackable" data-info=\'{"event_name" : "ad_search::ongvar::professionnels", "event_type" : "click", "event_s2" : "8", "click_type" : "N"}\'>Pro<span class="custom-medium-hidden">fessionnels</span><span class="tabsSwitchNumbers small-hidden tiny-hidden"> 7 210</span></a></nav><article class="list_properties"> <a title="Trier les annonces par prix" href="//www.leboncoin.fr/annonces/offres/ile_de_france//?ur=1&amp;sp=1" class="trackable" data-info=\'{"event_name" : "ad_search::trier_par_prix", "event_type" : "click", "event_s2" : "8", "click_type" : "N"}\'><i class="icon-currency-eur"></i>Tri<span class="custom-medium-hidden">er par prix</span></a> </article></header>';
    //         var $ = cheerio.load(html);
    //         var nbResult = search.parseNbResult($);
    //         nbResult.should.be.exactly(21661);
    //         done();
    //     });

    //     it('Parse Entries', function(done) {
    //         var html = '<section class="list mainList tabs"><!-- Listing filters --><!-- Listing list --><ul class="tabsContent dontSwitch block-white"> <li> <a href="//www.leboncoin.fr/campings/921756076.htm?ca=12_s" title="Location Mobil home, gite, chavar, week&#45;end," class="list_item clearfix trackable" data-info=\'{"event_type" : "selfpromotion", "campaign" : "ad_search", "ad_listid" : "921756076", "ad_location" : "list_content", "ad_position" : "1", "ad_type" : "offres", "ad_offres" : "pro", "ad_options" : "|gallery|ldv|urgent|"}\'> <!-- Listing item image --> <div class="item_image"> <span class="item_imagePic"> <span class="lazyload" style="display:block; width:100%; height:100%;" data-imgSrc="//img1.leboncoin.fr/thumbs/8f1/8f19d808a3d69b3cc49a006a3e74de9cdf6d6e3e.jpg" data-imgAlt="Location Mobil home, gite, chavar, week&#45;end,"></span> </span> <span class="item_imageNumber"> <i class="icon-camera icon-2x nomargin"></i> <span>10</span> </span> </div> <!-- Listing item info --> <section class="item_infos"> <h2 class="item_title"> Location Mobil home, gite, chavar, week&#45;end, </h2> <p class="item_supp"> <span class="ispro">(pro)</span> Campings </p> <p class="item_supp"> Renty / Pas-de-Calais </p> <h3 class="item_price">95&nbsp;&euro; - 155&nbsp;&euro;</h3> <aside class="item_absolute"> <p class="item_supp"> <span class="item_supp emergency"><i class="icon-star"></i>Urgent</span> 28 fév, 23:29 </p> </aside> </section> </a> </li></ul></selection>';
    //         var $ = cheerio.load(html);
    //         var results = search.parseEntries($);

    //         results.should.have.length(1);

    //         results[0].should.have.property('title', 'Location Mobil home, gite, chavar, week-end,');
    //         results[0].should.have.property('link', '//www.leboncoin.fr/campings/921756076.htm?ca=12_s');
    //         results[0].should.have.property('location', 'Renty / Pas-de-Calais');
    //         results[0].should.have.property('category', 'Campings');
    //         results[0].should.have.property('price', 95);
    //         results[0].should.have.property('images');

    //         results[0].images[0].should.equal('//img1.leboncoin.fr/images/8f1/8f19d808a3d69b3cc49a006a3e74de9cdf6d6e3e.jpg');
    //         should(results[0].urgent).be.true();

    //         results[0].should.have.property('date');
    //         results[0].date.getDate().should.be.exactly(28);
    //         results[0].date.getMonth().should.be.exactly(1); // February
    //         results[0].date.getHours().should.be.exactly(23);
    //         results[0].date.getMinutes().should.be.exactly(29);

    //         results[0].id.should.be.exactly(921756076);
    //         done();
    //     });
    // });


    // describe('Run', function() {
    //     this.timeout(50000);
    //     it('Run without parameters', function(done) {
    //         new search.Search().run().then(function (data) {
    //             data.page.should.be.exactly(1);
    //             done();
    //         }, function (err) {
    //             done(err);
    //         });
    //     });
    // });
});
