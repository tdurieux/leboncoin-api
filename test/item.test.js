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
        const html = `<section id="adview" class="grid-2-1" itemscope itemtype="http://schema.org/Offer">
	<section class="adview block-white flex-item-first">
		<header class="adview_header clearfix">
			<div class="print">
				<img src="//www2.leboncoin.fr/img/logo-mobile.png">
			</div>
			<h1 class="no-border" itemprop="name">
            	Renoir


			</h1>
		</header>
		<section class="adview_main">



				<div id="item_image" class="item_image big popin-open trackable" data-popin-type="image" data-popin-content="//img5.leboncoin.fr/ad-large/1508c908164d3bb1f40522c72bfda4f9299bcad9.jpg" data-info='{"event_name" : "ad_view::zoom_photos", "event_type" : "click", "click_type" : "N", "event_s2" : "2"}'>

                        <span class="lazyload" style="display:block; width:100%; height:100%;" data-imgSrc="//img5.leboncoin.fr/ad-image/1508c908164d3bb1f40522c72bfda4f9299bcad9.jpg" data-imgAlt="Renoir"></span>

					<p class="item_imageCaption">Renoir</p>
					<div class="layout loader hidden">
						<span class="loader-gif"></span>
					</div>

                    <div class="interstitial hidden" id="adview_interstitial">
                        <div class="container">
                            <p class="mbl">Contactez le vendeur pour plus d'informations :</p>



                                        <button id="adview_interstitial_button" data-href="https://api.leboncoin.fr" data-listid="1150678173" data-salesmen="1" data-textenabled="1" class="button-orange phoneNumber skip_interstitial mw trackable" data-info='{"event_name" : "ad_reply::telephone::voir_le_numero", "event_type" : "load", "event_s2" : "4"}'><i class="icon-phone icon-2x skip_interstitial"></i>Voir le num&eacute;ro</button>


                                <br/>

                            <a id="adview_interstitial_link" rel="nofollow" href="//www.leboncoin.fr/ar?ca=2_s&amp;id=1150678173" class="button-blue mts skip_interstitial mw trackable" data-info='{"event_name" : "ad_reply::email::envoyer_email", "event_type" : "load", "event_s2" : "4"}'><i class="icon-email icon-2x skip_interstitial"></i>Envoyer un email</a>

                        </div>
                    </div>
				</div>


                <script>
                    var lazyloadAdviewMain = new Lazyload(".item_image.big", 2, "//static.leboncoin.fr/img/no-picture.png");
                </script>


				<section class="carousel">
					<div class="thumbnails" data-alt="Renoir">
						<ul>

								<li id="thumb_0" class="thumb selected trackable" data-info='{"event_name" : "ad_view::photos", "event_type" : "click", "click_type" : "N", "event_s2" : "2"}'></li>

								<li id="thumb_1" class="thumb trackable" data-info='{"event_name" : "ad_view::photos", "event_type" : "click", "click_type" : "N", "event_s2" : "2"}'></li>

								<li id="thumb_2" class="thumb trackable" data-info='{"event_name" : "ad_view::photos", "event_type" : "click", "click_type" : "N", "event_s2" : "2"}'></li>

						</ul>
					</div>
				</section>
				<p class="item_photo">3 photos disponibles</p>
				<script>

						var images = new Array(), images_thumbs = new Array();
						images_thumbs[0] = "//img5.leboncoin.fr/ad-thumb/1508c908164d3bb1f40522c72bfda4f9299bcad9.jpg";

                      images[0] = "//img5.leboncoin.fr/ad-large/1508c908164d3bb1f40522c72bfda4f9299bcad9.jpg";

						images_thumbs[1] = "//img3.leboncoin.fr/ad-thumb/abb57c98af5662587c913b6f0e11bc7ac1f5e0e8.jpg";

                      images[1] = "//img3.leboncoin.fr/ad-large/abb57c98af5662587c913b6f0e11bc7ac1f5e0e8.jpg";

						images_thumbs[2] = "//img4.leboncoin.fr/ad-thumb/8a1cc0249241f2af90c63c256f7fdc9650121f36.jpg";

                      images[2] = "//img4.leboncoin.fr/ad-large/8a1cc0249241f2af90c63c256f7fdc9650121f36.jpg";





                        var interstitial_active=false, interstitial_trigger_number=3, carouselAdview=null;

                    jQuery(document).ready(function() {
	                    var interstitial_adview=document.getElementById('adview_interstitial');
	                    $('#item_image').attr('data-popin-cancelClick', 'adview_interstitial_button,adview_interstitial_link');
                        carouselAdview = new CarouselInterstitial("#adview", ".item_image.big", "thumbnails", images, images_thumbs, 3, 755, 485, 172, 118, interstitial_adview, interstitial_trigger_number);
                        carouselAdview.init();
                    });
				</script>



<section class="properties lineNegative">


<div class="apn-vp">
    <div id="vp1-s" class="teal-apn"></div>
    <div id="vp1-m" class="teal-apn"></div><!--
    --<div id="vp2-m" class="teal-apn"></div>-->
</div>



	<p class="line line_pro" itemprop="availabilityStarts" content="2017-06-18">Mise en ligne le 18 juin &agrave; 12:12</p>
	<div class="line line_pro noborder">
		<p></span>
        <a href="//www2.leboncoin.fr/ar?ca=2_s&amp;id=1150678173" class="uppercase bold trackable" data-info='{"event_name" : "ad_reply::email::pseudo_annonceur", "event_type" : "load", "event_s2" : "4"}'>

        theodore</a>
		</p>
	</div>



<div class="apn-blt">
    <div id="blt1-s" class="teal-apn"></div>
  	<div id="blt1-m" class="teal-apn"></div>
  	<div id="blt1-l" class="teal-apn"></div><!--
  	--><div id="blt2-l" class="teal-apn"></div>
  	<div id="blt1-xl" class="teal-apn"></div><!--
  	--><div id="blt2-xl" class="teal-apn"></div>
  	<div class="clear"></div>
</div>



        <div class="line">
            <h2 class="item_price clearfix" itemprop="price" content="12">

                <span class="property">Prix</span>
                <meta itemprop="priceCurrency" content="EUR" />
                <span class="value">

                            12&nbsp;&euro;



                </span>
            </h2>
        </div>


		<div class="line line_city" itemprop="availableAtOrFrom" itemscope itemtype="http://schema.org/Place">
			<h2 class="clearfix">
                <span class="property">
                    <span class="fl">Ville</span>


                            <button class="button-orange-mobile popin-open trackable large-hidden medium-hidden small-hidden" data-popin-type="map" data-popin-template="adviewMap" data-application="adview" data-info='{"event_name" : "ad_view::voir_sur_la_carte", "event_type" : "click", "click_type" : "N", "event_s2" : "2"}'><i class="icon-map-marker nomargin"></i></button>


                </span>
                <span class="value" itemprop="address">Hendaye 64700
                </span>


                        <button class="button-orange-mobile popin-open trackable tiny-hidden" data-popin-type="map" data-popin-template="adviewMap" data-application="adview" data-info='{"event_name" : "ad_view::voir_sur_la_carte", "event_type" : "click", "click_type" : "N", "event_s2" : "2"}'><i class="icon-map-marker nomargin"></i></button>


            </h2>
		</div>













































		<div class="line properties_description">
			<p class="property semibold">Description :</p>
			<p class="value" itemprop="description">Dans la série "grands peintres" vends livre sur RENOIR par Denis Rouart<br>aux éditions NATHAN imprimé à Lausanne.<br>Sous la couverture en papier glacé le livre a une belle couverture "tissée" bleue.<br>158 pages  H 33cm  L 24cm<br>Valeur 35 euros (noté sur la couverture)<br>Livre état neuf !</p>

		</div>






    <script> var apiKey = "54bb0281238b45a03f0ee695f73e704f"; </script>
</section>



		</section>
		<footer class="adview_footer mts">
			<div class="grid-4 sharer clearfix">
				<div>
					<span class="flat-horizontal saveAd link-like" data-savead-id="1150678173" title="Sauvegarder l'annonce">
						<div class="saveMsg trackable" data-info='{"event_name" : "ad_view::sauvegarder::on", "event_type" : "click", "click_type" : "N", "event_s2" : "2"}'><i class="icon-heart-outline"></i>Sauvegarder l'annonce</div>
						<div class="savedMsg red trackable" data-info='{"event_name" : "ad_view::sauvegarder::off", "event_type" : "click", "click_type" : "N", "event_s2" : "2"}'><i class="icon-heart"></i>Annonce sauvegard&eacute;e<span class="flagMyAds"> dans &laquo;Mes annonces&raquo;</span></div>
                        <div title="" class="disabledLink disabled showTip" data-text="Le nombre maximum d'annonces sauvegard&eacute;es a &eacute;t&eacute; atteint."><i class="icon-heart"></i>Sauvegarder l'annonce</div>
						<div title="" class="failedMsg disabled showTip" data-text="Fonctionnalit&eacute; indisponible pour le moment."><i class="icon-heart-outline"></i>Sauvegarder l'annonce</div>
					</span>
				</div>
				<a rel="nofollow" title="Signaler l'annonce" href="//www2.leboncoin.fr/support/form/0?id=1&amp;ca=2_s&amp;subject=15&amp;ad=1150678173" class="flat-horizontal trackable" data-info='{"event_name" : "ad_view::signaler_un_probleme", "event_type" : "click", "click_type" : "N", "event_s2" : "2"}'><i class="icon-alert-circle"></i>Signaler l'annonce</a>
				<div class="flex-item-double">
					<span class="sharer_title semibold"><i class="icon-share-variant"></i>Partager l'annonce</span>
					<div class="sharer_social">

							<button class="share facebook trackable" data-href="http://www.facebook.com/sharer.php?u=https://www.leboncoin.fr/livres/1150678173.htm?ca=2_s" data-info='{"event_name" : "ad_view::partage::reseaux_sociaux::facebook", "event_type" : "click", "event_s2" : "2", "click_type" : "S"}'><i class="icon-facebook nomargin"></i></button>



							<button class="share twitter trackable" data-href="https://twitter.com/share" data-text="Renoir Livres Pyr&eacute;n&eacute;es&#45;Atlantiques" data-url="https://www.leboncoin.fr/vi/1150678173.htm" data-hashtag="leboncoin" data-info='{"event_name" : "ad_view::partage::reseaux_sociaux::twitter", "event_type" : "click", "event_s2" : "2", "click_type" : "S"}'><i class="icon-twitter nomargin"></i></button>

						<button rel="nofollow" class="share mail trackable" title="Envoyer l'annonce par mail" data-info='{"event_name" : "ad_view::partage::email_ami::formulaire", "event_type" : "load", "event_s2" : "2"}'><i class="icon-email nomargin"></i></button>
					</div>
				</div>
			</div>
			<div id="saveAd_error" class="hidden">Le nombre maximum d'annonces sauvegard&eacute;es a &eacute;t&eacute; atteint.</div>

			<aside id="sendMail" class="sendMail">
				<p class="sendMail_title">Envoyer l'annonce par mail</p>
				<form action="/st" method="post">
					<input type="hidden" name="ca" value="2_s">
					<input type="hidden" name="id" value="1150678173">
					<div class="line">
						<label for="tip_sender" class="label">Votre adresse mail : </label>
						<div class="field-wrapper">
							<input name="tip_sender" type="text" size="30" value="" maxlength="60" id="tip_sender" class="input full">

						</div>
					</div>
					<div class="line">
						<label for="tip_email" class="label">L'adresse mail de votre ami(e) : </label>
						<div class="field-wrapper">
							<input name="tip_email" type="text" size="30" value="" maxlength="60" id="tip_email" class="input full">

						</div>
					</div>
					<input type="submit" value="Envoyer" class="button-blue" data-info='{"event_name" : "ad_view::partage::email_ami::confirmation", "event_type" : "load", "event_s2" : "2"}'>
				</form>

<div class="information">
    <p class="information_title">Information : </p>
    <p class="information_text"><a href="//www.leboncoin.fr/popup_collecte_donnees_conseiller.htm
" onclick="return cnilPopup(this, 700, 300);">- Le responsable de traitement, les destinataires et la finalit&eacute; de la collecte des donn&eacute;es.</a><br>
    <a href="//www.leboncoin.fr/popup_droits_opposition.htm" onclick="return cnilPopup(this, 700, 300);">- Vos droits d'opposition, d'acc&egrave;s et de rectification sur vos donn&eacute;es collect&eacute;es.</a></p>
</div>

<script type="text/javascript">
	function cnilPopup(link, width, height) {
	    var left = window.screenX + (screen.width / 2) - (width / 2);
	    var top = (screen.height / 2) - (height / 2);
	    var windowFeatures = "status=no,height=" + height + ",width=" + width + ",resizable=yes,left=" + left + ",top=" + top + ",toolbar=no,menubar=no,scrollbars=no,location=no,directories=no";
	    u=link.href;
	    t=document.title;
	    window.open(u,'InfosCNIL', windowFeatures);
	    return false;
	}
</script>


			</aside>
		</footer>
	</section>
	<aside class="sidebar" role="complementary">
		<div class="fixedSrolling">
			<div class="box-grey-light mbs align-center">

					<p class="title">
						theodore
					</p>

				<div class="container">



        				<button data-href="https://api.leboncoin.fr" data-listid="1150678173" data-salesmen="1" data-textenabled="1" class="button-orange large phoneNumber trackable" data-info='{"event_name" : "ad_reply::telephone::voir_le_numero", "event_type" : "load", "event_s2" : "4"}'><i class="icon-phone icon-2x"></i>Voir le num&eacute;ro</button>




                    <a rel="nofollow" href="//www.leboncoin.fr/ar?ca=2_s&amp;id=1150678173" class="button-blue large trackable" data-info='{"event_name" : "ad_reply::email::envoyer_email", "event_type" : "load", "event_s2" : "4"}'><i class="icon-email icon-2x"></i>Envoyer un email</a>





				</div>
			</div>
			<div class="box-grey-light mbm align-center">
				<p class="title">G&eacute;rer votre annonce</p>
				<div class="container">
					<div class="grid-2">


								<button class="flat-vertical link-like popin-open trackable" data-info='{"event_name" : "ad_view::gerer_annonce::mettre_en_avant", "event_type" : "load", "event_s2" : "2"}' data-popin-type="general" data-popin-template="connexion" data-follow-url="//www2.leboncoin.fr/ai?ca=2_s&amp;id=1150678173&amp;cmd=gallery7"><i class="icon-star icon-2x"></i>Mettre en avant</button>
								<button class="flat-vertical link-like popin-open trackable" data-info='{"event_name" : "ad_view::gerer_annonce::remonter_en_tete_de_liste", "event_type" : "load", "event_s2" : "2"}' data-popin-type="general" data-popin-template="connexion"  data-follow-url="//www2.leboncoin.fr/ai?ca=2_s&amp;id=1150678173&amp;cmd=daily_bump"><i class="icon-sort-ascending icon-2x"></i>Remonter en t&ecirc;te de liste</button>



										<button class="flat-vertical link-like mts popin-open trackable" data-info='{"event_name" : "ad_view::gerer_annonce::modifier", "event_type" : "load", "event_s2" : "2"}' data-popin-type="general" data-popin-template="connexion" data-follow-url="//www2.leboncoin.fr/ai?ca=2_s&amp;id=1150678173&amp;cmd=edit"><i class="icon-pencil icon-2x"></i>Modifier l'annonce</button>


									<button class="flat-vertical link-like mts popin-open trackable" data-info='{"event_name" : "ad_view::gerer_annonce::supprimer", "event_type" : "load", "event_s2" : "2"}' data-popin-type="general" data-popin-template="connexion" data-follow-url="//www2.leboncoin.fr/ai?ca=2_s&amp;id=1150678173&amp;cmd=delete"><i class="icon-delete icon-2x"></i>Supprimer l'annonce</button>



					</div>
				</div>
			</div>



<div class="apn-vp">
    <div id="vp1-l" class="teal-apn"></div>
    <div id="vp2-l" class="teal-apn"></div>
 	<div id="vp3-l" class="teal-apn"></div>
    <div id="vp4-l" class="teal-apn"></div>
    <div id="vp1-xl" class="teal-apn"></div>
    <div id="vp2-xl" class="teal-apn"></div>
</div>


<div class="apn-pv">
    <div id="pv2-l" class="teal-apn"></div>
    <div id="pv-xl" class="teal-apn"></div>
</div>


			<script>
				var apiKey = "54bb0281238b45a03f0ee695f73e704f";
			    var lat = "43.35849 ";
			    var lng = "-1.77608 ";
			    var source = $.trim("city ");
			    var zipcode = $.trim("64700 ");
			    var adreplyLink = "//www.leboncoin.fr/ar?ca=2_s&id=1150678173";
			    var city = $.trim("Hendaye ");
			    var category = $.trim("27 ");
			    // If IE7 and polygon view, hide carto link
			    if ( $('body').hasClass('ua_IE7') && (source == "city" || source == "zipcode")) {
			        $(".carto-link").hide();
			    }


			    //Save ad (Mes annonces)
			    jQuery(document).ready(function() {
                    var savead = new SaveAd(".leboncoin.fr");
                });

			</script>
		</div>
	</aside>
</section>`;
        const $ = cheerio.load(html);
        it('parse title', function(done) {
            var title = item.parseTitle($);
            title.should.equal('Renoir');
            done();
        });

        it('parse Seller', function(done) {
            var seller = item.parseSeller($);
            seller.should.equal('theodore');
            done();
        });

        it('parse Table data', function(done) {
            var data = item.parseTableData($);

            data.zip.should.be.exactly(64700);
            data.city.should.equal('Hendaye');
            done();
        });

        it('parse images', function(done) {
            var images = item.parseImages($);

            images.should.have.length(3);
            images[0].should.equal('//img5.leboncoin.fr/ad-large/1508c908164d3bb1f40522c72bfda4f9299bcad9.jpg');
            images[1].should.equal('//img3.leboncoin.fr/ad-large/abb57c98af5662587c913b6f0e11bc7ac1f5e0e8.jpg');
            images[2].should.equal('//img4.leboncoin.fr/ad-large/8a1cc0249241f2af90c63c256f7fdc9650121f36.jpg');

            done();
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
                    done()
                }, function (err) {
                    done(err);
                });
            }, function (err) {
                done(err);
            });
        });
    });

    describe('GetPhoneNumber', function() {
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
    });
});
