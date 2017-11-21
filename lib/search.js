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
Search.prototype.category = "annonces";
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

Search.prototype.setRegion = function(region) {
    if (!!region) {
        this.region = region;
    }
    return this;
};

Search.prototype.setDepartment = function(department) {
    if (!!department) {
        this.department = department;
    }
    return this;
};

Search.prototype.setLocation = function(location) {
    if (!!location) {
        this.location = location;
    }
    return this;
};

Search.prototype.setCategory = function(category) {
    if (!!category) {
        this.category = category;
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
    const protocol = "http";
    var region = this.region;
    if(region == null) {
        region = "ile_de_france/occasions"
    }
    const pathname = this.category + "/offres/" + region + ((this.department)? "/" + this.department :""); 
    const query = {
        "o": this.page,
        "q": this.query,
        "f": this.filter.value,
        "ur": this.urgencyOnly ? 1: 0,
        //"sp" = 1 if @options.sort_by_price
        "it": this.titleOnly ? 1: 0,
        "location": this.location
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
            body = iconv.decode(body, 'iso-8859-1');
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