const cheerio = require('cheerio');
const request = require('request');
const url = require('url');
const iconv = require('iconv-lite');

const filters = require('./filters');
const item = require('./item');
const cleanString = require('./utils').cleanString;

const Search = function (options) {
    if (!(this instanceof Search)) 
        return new Search(options);

    this.searchExtras = {};
    
    options = options || { };

    this.setQuery(options.query);
    this.setFilter(options.filter);
    this.setCategory(options.category);
    this.setShouldbe(options.shouldbe);
    this.setUrgencyOnly(options.urgencyOnly);
    this.setTitleOnly(options.titleOnly);
    this.setRegion(options.region);
    this.setDepartment(options.department);
    this.setLocation(options.location);
    this.setPage(options.page);
    if(options.searchExtras && options.searchExtras instanceof Object) {
        for (var i in options.searchExtras) {
            if(!options.searchExtras.hasOwnProperty(i)) {
                continue;
            }
            this.addSearchExtra(i, options.searchExtras[i]);
        }
    }
    return this;
};

Search.prototype.query = null;
Search.prototype.filter = filters.ALL;
Search.prototype.category = null;
Search.prototype.shouldbe = "";
Search.prototype.urgencyOnly = false;
Search.prototype.titleOnly = false;
Search.prototype.region = null;
Search.prototype.department = null;
Search.prototype.location = null;
Search.prototype.page = 1;

Search.prototype.setQuery = function(query) {
    if (!!query) {
        this.query = query;
    }
    return this;
};

Search.prototype.setFilter = function(filter) {
    if (filter instanceof filters.Filter) {
        this.filter = filter;
    }
    return this;
};

Search.prototype.setShouldbe = function(shouldbe) {
    if (!!shouldbe) {
        this.shouldbe = shouldbe;
    }
    return this;
};

Search.prototype.setUrgencyOnly = function(urgencyOnly) {
    if (urgencyOnly == true || urgencyOnly == false) {
        this.urgencyOnly = urgencyOnly;
    }
    return this;
};

Search.prototype.setTitleOnly = function(titleOnly) {
    if (titleOnly == true || titleOnly == false) {
        this.titleOnly = titleOnly;
    }
    return this;
};
const regionIds = {"alsace":"1","aquitaine":"2","auvergne":"3","basse_normandie":"4","bourgogne":"5","bretagne":"6","centre":"7","champagne_ardenne":"8","corse":"9","franche_comte":"10","haute_normandie":"11","ile_de_france":"12","languedoc_roussillon":"13","limousin":"14","lorraine":"15","midi_pyrenees":"16","nord_pas_de_calais":"17","pays_de_la_loire":"18","picardie":"19","poitou_charentes":"20","provence_alpes_cote_d_azur":"21","rhone_alpes":"22","guadeloupe":"23","martinique":"24","guyane":"25","reunion":"26"};
Search.prototype.setRegion = function(region) {
    if (!!region) {
        if (isNaN(region)) {
            for (let label in regionIds) {
                if (label.indexOf(region) !== -1) {
                    this.region = regionIds[label];
                    break;
                }
            }
        } else {
            this.region = region;
        }
    }
    return this;
};
const departmentIds = {"ain":"1","aisne":"2","allier":"3","alpes_de_haute_provence":"4","hautes_alpes":"5","alpes_maritimes":"6","ardeche":"7","ardennes":"8","ariege":"9","aube":"10","aude":"11","aveyron":"12","bouches_du_rhone":"13","calvados":"14","cantal":"15","charente":"16","charente_maritime":"17","cher":"18","correze":"19","cote_d_or":"21","cotes_d_armor":"22","creuse":"23","dordogne":"24","doubs":"25","drome":"26","eure":"27","eure_et_loir":"28","finistere":"29","gard":"30","haute_garonne":"31","gers":"32","gironde":"33","herault":"34","ille_et_vilaine":"35","indre":"36","indre_et_loire":"37","isere":"38","jura":"39","landes":"40","loir_et_cher":"41","loire":"42","haute_loire":"43","loire_atlantique":"44","loiret":"45","lot":"46","lot_et_garonne":"47","lozere":"48","maine_et_loire":"49","manche":"50","marne":"51","haute_marne":"52","mayenne":"53","meurthe_et_moselle":"54","meuse":"55","morbihan":"56","moselle":"57","nievre":"58","nord":"59","oise":"60","orne":"61","pas_de_calais":"62","puy_de_dome":"63","pyrenees_atlantiques":"64","hautes_pyrenees":"65","pyrenees_orientales":"66","bas_rhin":"67","haut_rhin":"68","rhone":"69","haute_saone":"70","saone_et_loire":"71","sarthe":"72","savoie":"73","haute_savoie":"74","paris":"75","seine_maritime":"76","seine_et_marne":"77","yvelines":"78","deux_sevres":"79","somme":"80","tarn":"81","tarn_et_garonne":"82","var":"83","vaucluse":"84","vendee":"85","vienne":"86","haute_vienne":"87","vosges":"88","yonne":"89","territoire_de_belfort":"90","essonne":"91","hauts_de_seine":"92","seine_saint_denis":"93","val_de_marne":"94","val_d_oise":"95"};
Search.prototype.setDepartment = function(department) {
    if (!!department) {
        if (isNaN(department)) {
            for (let label in departmentIds) {
                if (label.indexOf(department) !== -1) {
                    this.department = departmentIds[label];
                    break;
                }
            }
        } else {
            this.department = department;
        }
    }
    return this;
};

Search.prototype.setLocation = function(location) {
    if (!!location) {
        this.location = location;
    }
    return this;
};
const categoryIds = {"_emploi_":"71","offres_d_emploi":"33","_vehicules_":"1","voitures":"2","motos":"3","caravaning":"4","utilitaires":"5","equipement_auto":"6","equipement_moto":"44","equipement_caravaning":"50","nautisme":"7","equipement_nautisme":"51","_immobilier_":"8","ventes_immobilieres":"9","locations":"10","colocations":"11","bureaux_commerces":"13","_vacances_":"66","locations_gites":"12","chambres_d_hotes":"67","campings":"68","hotels":"69","hebergements_insolites":"70","_multimedia_":"14","informatique":"15","consoles_jeux_video":"43","image_son":"16","telephonie":"17","_loisirs_":"24","dvd_films":"25","cd_musique":"26","livres":"27","animaux":"28","velos":"55","sports_hobbies":"29","instruments_de_musique":"30","collection":"40","jeux_jouets":"41","vins_gastronomie":"48","_materiel_professionnel_":"56","materiel_agricole":"57","transport_manutention":"58","btp_chantier_gros_oeuvre":"59","outillage_materiaux_2nd_oeuvre":"60","equipements_industriels":"32","restauration_hotellerie":"61","fournitures_de_bureau":"62","commerces_marches":"63","materiel_medical":"64","_services_":"31","prestations_de_services":"34","billetterie":"35","evenements":"49","cours_particuliers":"36","covoiturage":"65","_maison_":"18","ameublement":"19","electromenager":"20","arts_de_la_table":"45","decoration":"39","linge_de_maison":"46","bricolage":"21","jardinage":"52","vetements":"22","chaussures":"53","accessoires_bagagerie":"47","montres_bijoux":"42","equipement_bebe":"23","vetements_bebe":"54","__":"37","autres":"38"};
Search.prototype.setCategory = function(category) {
    if (!!category) {
        if (isNaN(category)) {
            for (let label in categoryIds) {
                if (label.indexOf(category) !== -1) {
                    this.category = categoryIds[label];
                    break;
                }
            }
        } else {
            this.category = category;
        }
    }
    return this;
};

Search.prototype.setPage = function(page) {
    if (parseInt(page) == page) {
        this.page = page;
    }
    return this;
};

/**
 * Add a search extra element (specific to category)
 * @param {String} key   The name of search extra
 * @param {String} value The value of search extra
 */
Search.prototype.addSearchExtra = function (key, value) {
    if (!!key && !!value) {
        this.searchExtras[key] = value;
    }    
    return this;
}

Search.prototype.getUrl = function() {
    const hostname = "www.leboncoin.fr";
    const protocol = "https";
    const pathname = "/recherche/";
    const query = {
        "page": this.page,
        "text": this.query,
        "owner_type": this.filter.value,
        "urgent": this.urgencyOnly ? 1: null,
        "category": this.category ? this.category : null,
        "region": this.region ? this.region : this.department ? this.department : null,
        //cities
        //"sort" = 'price' if @options.sort_by_price
        "search_in": this.titleOnly ? 'subject': null,
        //"location": this.location
    };

    // adds search extras to the query
    for(var i in this.searchExtras) {
        if(!this.searchExtras.hasOwnProperty(i)) {
            continue;
        }
        query[i] = this.searchExtras[i];
    }

    // remove null value
    for(var i in query) {
        if(query[i] == null) {
            delete query[i];
        }
    }
    const escapeOld = require('querystring').escape;
    require('querystring').escape = function (value) {
        return encodeURIComponent(value).replace(/%20/g, '+');
    };
    output = url.format({
        hostname: hostname,
        protocol: protocol,
        pathname: pathname,
        query: query
    });
    require('querystring').escape = escapeOld;
    return output;
};

const frenchMonth = {
    'jan': 0,
    'fév': 1,
    'mar': 2,
    'avr': 3,
    'mai': 4,
    'juin': 5,
    'jui': 6,
    'aôut': 7,
    'sep': 8,
    'oct': 9,
    'nov': 10,
    'déc': 11,
};


var parseNbResult = function ($) {
    return parseInt($('.tabsHeader .active .tabsSwitchNumbers').text().replace(/ /g, ''));
};

var convertStringDateToDate = function (dateString) {
    const dates = dateString.trim().split(", ");
    const date = new Date();
    
    if(dates[0] == 'Aujourd\'hui') {
    } else if(dates[0] == 'Hier') {
        date.setDate(date.getDate() - 1);
    } else {
        date.setDate(date.getDate() - 2);
        for(var i in frenchMonth) {
            if(dates[0].indexOf(i) != -1) {
                date.setMonth(frenchMonth[i]);
                break;
            }
        }
        date.setDate(parseInt(dates[0]));
    }
    var time = dates[1].split(":");
    date.setHours(parseInt(time[0]));
    date.setMinutes(parseInt(time[1]));
    date.setSeconds(0);
    return date;
};

var parseDate = function ($) {
    return convertStringDateToDate($.find('.item_absolute > .item_supp').text().replace("Urgent", ""))
};

var parseImages = function ($) {
    const images = [];
    var elems = $.find('.item_imagePic span');
    elems.each(function (index) {
        var elem = elems.eq(index);
        images.push(elem.attr('data-imgsrc').replace('thumbs', 'images'));
    });
    return images;
};

var parseTitle = function ($) {
    return $.attr('title');
};

var parseCategory = function ($) {
    return cleanString($.find('.item_infos > .item_supp').eq(0).text().replace("(pro)", ""))
};

var parseLink = function ($) {
    return $.attr('href')
};

var parseLocation = function ($) {
    return cleanString($.find('.item_infos > .item_supp').eq(1).text())
};

var parseIsUrgent = function ($) {
    return $.find('.emergency').length > 0
};

var parsePrice = function ($) {
    return parseInt(cleanString($.find('.item_price').text().replace(/ /g, '')))
};

var parseData = function (data) {
    var output = [];

    for (var i in data) {
        var entry = data[i];

        output.push(new item.Item({
            title: entry.subject,
            description: entry.body,
            category: entry.category_name,
            link: entry.url,
            images: entry.images.urls,
            location: entry.location,
            urgent: entry.urgent?entry.urgent:false,
            price: entry.price? entry.price[0]: 0,
            date: entry.first_publication_date,
            owner: entry.owner
        }));
    };

    return output;
};

var parseEntries = function ($) {
    var output = [];

    $('.mainList a.list_item').each(function (index, entry) {
        var $entry = $(entry);
        var title = parseTitle($entry);
        var date = parseDate($entry);
        var images = parseImages($entry);
        var category = parseCategory($entry);
        var link = parseLink($entry);
        var location = parseLocation($entry);
        var urgent = parseIsUrgent($entry);
        var price = parsePrice($entry);

        output.push(new item.Item({
            title: title,
            category: category,
            link: link,
            images: images,
            location: location,
            urgent: urgent,
            price: price,
            date: date
        }));
    });

    return output;
};

Search.prototype.run = function(url) {
    var self = this;
    if (url == null) {
        url = this.getUrl();
    }
    return new Promise(
    function(resolve, reject) {
        request.get({
            uri: url,
            encoding: null,
            gzip: true
        }, function (err, res, body) {
            if(err) {
                return reject(err);
            }
            // decode the encoding
            body = iconv.decode(body, 'utf-8');
            var scriptStart = body.indexOf('window.FLUX_STATE = ');
            if (scriptStart !== -1) {
                var scriptEnd = body.indexOf('</script>', scriptStart);
                var details = JSON.parse(body.substring(scriptStart, scriptEnd).replace("window.FLUX_STATE = ", ""));
                
                
                const output = {
                    page: self.page,
                    nbResult: details.adSearch.data.total_all,
                    results: parseData(details.adSearch.data.ads)
                };
                resolve(output);
            } else {
                const opts = {
                    normalizeWhitespace: true,
                    decodeEntities: true
                };
                // load the html page in cheerio
                const $ = cheerio.load(body, opts);

                const output = {
                    page: self.page,
                    nbResult: parseNbResult($),
                    results: parseEntries($)
                };
                resolve(output);
            }
        });
    });
}

module.exports.Search = Search;

module.exports.convertStringDateToDate = convertStringDateToDate;
module.exports.parseDate = parseDate;
module.exports.parseNbResult = parseNbResult;
module.exports.parseImages = parseImages;
module.exports.parseTitle = parseTitle;
module.exports.parseLocation = parseLocation;
module.exports.parseIsUrgent = parseIsUrgent;
module.exports.parsePrice = parsePrice;
module.exports.parseEntries = parseEntries;
