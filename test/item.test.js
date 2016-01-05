const cheerio = require('cheerio');
const should = require('should');

const search = require("../lib/search.js");
const item = require("../lib/item.js");

describe('Item', function() {
    describe('GetUrl', function() {
        it('with id', function(done) {
            var i = new item.Item({id: 905817796});
            i.getUrl().should.equal("http://www.leboncoin.fr/cat/905817796.htm?ca=17_s");
            done()
        });

        it('with id and category', function(done) {
            var i = new item.Item({id: 905817796, category: "annimal"});
            i.getUrl().should.equal("http://www.leboncoin.fr/annimal/905817796.htm?ca=17_s");
            done()
        });

        it('with link', function(done) {
            var i = new item.Item({link: "http://www.leboncoin.fr/annimal/905817796.htm?ca=17_s"});
            i.getUrl().should.equal("http://www.leboncoin.fr/annimal/905817796.htm?ca=17_s");
            done()
        });
    });

    describe('Parsers', function() {
        it('parse title', function(done) {
            var html = '<div class="lbcContainer" itemscope itemtype="http://schema.org/Product"><div class="header_adview"><h1 id="ad_subject" itemprop="name">Maison 3-4chbres à rénover sur 1100m²</h1></div></div>';
            const $ = cheerio.load(html);
            var title = item.parseTitle($);
            title.should.equal('Maison 3-4chbres à rénover sur 1100m²');
            done()
        });

        it('parse Description', function(done) {
            var html = '<div class="AdviewContent"><div class="type">Description :</div><div class="content" itemprop="description">Maison dans un quartier calme, à rénover, avec dupotentiel; actuellement constituée de 2 logementsindépendants (qui peuvent être réunis), elle offresur env. 100 m²hab. :<br>- Sous-sol complet : garage (avec chaudière aufuel) et autre pièce (cave)<br>- Rez-de-chaussée surélevé : entrée, WC, cuisine, salle (avec baie ouvrant sur un balcon), 2chambres parquetées, dégagement , salle de bains.<br>- A l\'étage (accès par escalier extérieur)légèrement mansardé : salle, chambre, cuisine etsalle d\'eau avec WC.<br>Terrain tout autour  d\'environ 1.100m² .Huisseries en PVC.</div></div>';
            const $ = cheerio.load(html);
            var description = item.parseDescription($);
            description.should.equal('Maison dans un quartier calme, à rénover, avec dupotentiel; actuellement constituée de 2 logementsindépendants (qui peuvent être réunis), elle offresur env. 100 m²hab. :<br>- Sous-sol complet : garage (avec chaudière aufuel) et autre pièce (cave)<br>- Rez-de-chaussée surélevé : entrée, WC, cuisine, salle (avec baie ouvrant sur un balcon), 2chambres parquetées, dégagement , salle de bains.<br>- A l\'étage (accès par escalier extérieur)légèrement mansardé : salle, chambre, cuisine etsalle d\'eau avec WC.<br>Terrain tout autour  d\'environ 1.100m² .Huisseries en PVC.');
            done()
        });

        it('parse Table data', function(done) {
            var html = '<div class="lbcParams withborder" itemprop="offers" itemscope itemtype="http://schema.org/Offer"><meta itemprop="seller" content="Etude JOFFROY" /><div class="floatLeft"><table><tbody><tr class="price"><th>Prix : </th><td><meta itemprop="priceCurrency" content="EUR" /><span class="price" itemprop="price" content="130000">130 000&nbsp;&euro;</span></td></tr></tbody></table><table itemprop="availableAtOrFrom" itemscope itemtype="http://schema.org/Place"><tbody itemprop="address" itemscope itemtype="http://schema.org/PostalAddress"><tr><th>Ville :</th><td itemprop="addressLocality">Mézidon-Canon</td></tr><tr><th>Code postal :</th><td itemprop="postalCode">14270</td></tr></tbody></table></div><div class="floatRight x06_x07Div"><div class="oas-x06" id="oas-x06"><script type="text/javascript"><!--if(typeof OAS_listpos != \'undefined\' && OAS_listpos.search("(^x06|x06,|x06$)") != -1) {OAS_AD(\'x06\');}//--></script></div><!----><div class="oas-x07" id="oas-x07"><script type="text/javascript"><!--if(typeof OAS_listpos != \'undefined\' && OAS_listpos.search("(^x07|x07,|x07$)") != -1) {OAS_AD(\'x07\');}//--></script></div></div> </div><div class="lbcParams criterias"><table><tr><th>Frais d\'agence inclus : </th><td>Oui</td></tr><tr><th>Type de bien : </th><td>Maison</td></tr><tr><th>Pièces : </th><td>7</td></tr><tr><th>Surface : </th><td>100 m<sup>2</sup></td></tr><tr><th>Référence : </th><td>ma521</td></tr><tr><th>GES :</th><td><script type="text/javascript">document.write(\'<a href="javascript:;" onClick="window.open(\\\'http://www.leboncoin.fr/popup_diagnostic_performance_energetique.htm\\\', \\\'DPE\\\', \\\'scrollbars=yes,width=560,height=560\\\')">G (de 81 &agrave; 110)<\' + \'/a>\');</script><noscript><a href="http://www.leboncoin.fr/popup_diagnostic_performance_energetique.htm" target="_blank">G (de 81 &agrave; 110)</a></noscript></td></tr><tr><th>Classe énergie :</th><td><script type="text/javascript">document.write(\'<a href="javascript:;" onClick="window.open(\\\'http://www.leboncoin.fr/popup_diagnostic_performance_energetique.htm\\\', \\\'DPE\\\', \\\'scrollbars=yes,width=560,height=560\\\')">F (de 331 &agrave; 450)<\' + \'/a>\');</script><noscript><a href="http://www.leboncoin.fr/popup_diagnostic_performance_energetique.htm" target="_blank">F (de 331 &agrave; 450)</a></noscript></td></tr></table></div>';
            const $ = cheerio.load(html);
            var data = item.parseTableData($);
            data.zip.should.be.exactly(14270);
            data.price.should.be.exactly(130000);
            data.should.have.property('agencyFees', true);
            data.should.have.property('type de bien', 'Maison');
            data.should.have.property('rooms', 7);
            data.should.have.property('surface', 100);
            data.should.have.property('reference', 'ma521');
            data.should.have.property('ges', 'G');
            data.should.have.property('classe énergie', 'F');

            data.city.should.equal('Mézidon-Canon');
            done()
        });

        it('parse images', function(done) {
            var html = '<div class="thumbs_carousel_window"><div id="thumbs_carousel"><a id="thumb_0" class="thumbs_cadre active" href="#" onclick="return showImage(0);"> <span class="thumbs" style="background-image: url(\'http://img6.leboncoin.fr/thumbs/530/5300fe9f626d7480d175ba301929de4a316db6d1.jpg\');"></span> </a><a id="thumb_1" class="thumbs_cadre" href="#" onclick="return showImage(1);"> <span class="thumbs" style="background-image: url(\'http://img1.leboncoin.fr/thumbs/b07/b070082031df6f6a5b7bbeedd70ad047b0d968e4.jpg\');"></span> </a><a id="thumb_2" class="thumbs_cadre" href="#" onclick="return showImage(2);"> <span class="thumbs" style="background-image: url(\'http://img6.leboncoin.fr/thumbs/949/9495b009da8209a81bcfe4268a470503a771f4a0.jpg\');"></span> </a><a id="thumb_3" class="thumbs_cadre" href="#" onclick="return showImage(3);"> <span class="thumbs" style="background-image: url(\'http://img2.leboncoin.fr/thumbs/0d7/0d7da252a1a5a8c8ff5e6f8122fb9dc038dd7fa6.jpg\');"></span> </a><a id="thumb_4" class="thumbs_cadre" href="#" onclick="return showImage(4);"> <span class="thumbs" style="background-image: url(\'http://img2.leboncoin.fr/thumbs/c69/c6937688f3ea61727e095f1f9e42b23eccc79f51.jpg\');"></span> </a></div></div>';
            var $ = cheerio.load(html);
            var images = item.parseImages($);

            images.should.have.length(5);
            images[0].should.equal('http://img6.leboncoin.fr/images/530/5300fe9f626d7480d175ba301929de4a316db6d1.jpg');
            


            html = '<div class="images_cadre"><a id="image" onclick="return false;" class="images no-link" style="background-image: url(\'http://img5.leboncoin.fr/images/fda/fda1676786d4770ba29d6e7ff328f0d819930a83.jpg\');"><i title="Agrandir la photo"></i></a></div>';
            $ = cheerio.load(html);
            var images = item.parseImages($);

            images.should.have.length(1);
            images[0].should.equal('http://img5.leboncoin.fr/images/fda/fda1676786d4770ba29d6e7ff328f0d819930a83.jpg');
            done()
        });
    });

    describe('GetPhoneNumber', function() {
        it('parsePhoneNumberImage 1', function(done) {
            item.parsePhoneNumberImage('./test/assets/phone1.gif').then(function (phoneNumber) {
                phoneNumber.should.equal("0609064893");
                done();
            }, done);
        });

        it('parsePhoneNumberImage 2', function(done) {
            item.parsePhoneNumberImage('./test/assets/phone2.gif').then(function (phoneNumber) {
                phoneNumber.should.equal("0672341635");
                done();
            }, done);
        });

        it('parsePhoneNumberImage 3', function(done) {
            item.parsePhoneNumberImage('./test/assets/phone3.gif').then(function (phoneNumber) {
                phoneNumber.should.equal("0611404567");
                done();
            }, done);
        });

    });
});