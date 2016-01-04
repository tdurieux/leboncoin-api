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
Search.prototype.searchExtras = {};

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
    return url.format({
        hostname: hostname,
        protocol: protocol,
        pathname: pathname,
        query: query
    });
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

var parseDate = function (dates) {
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
}
Search.prototype.run = function() {
    var url = this.getUrl();
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
            body = iconv.decode(body, 'iso-8859-1');
            const opts = {
                normalizeWhitespace: true,
                decodeEntities: true
            };
            const $ = cheerio.load(body, opts);
            const output = [];
            $('.list-lbc > a').each(function (index, entry) {
                const dates = [];
                $(entry).find('.date div').each(function (index, entry) {
                    dates.push(cleanString($(entry).html()));
                });
                const images = []
                $(entry).find('.image img').each(function (idex, elem) {
                    images.push($(elem).attr('src').replace('thumbs', 'images'));
                })
                output.push(new item.Item({
                    title: $(entry).attr('title'),
                    category: cleanString($(entry).find('.category').text()),
                    link: $(entry).attr('href'),
                    images: images,
                    location: cleanString($(entry).find('.placement').text()),
                    urgent: $(entry).find('.urgent').length > 0,
                    price: parseFloat(cleanString($(entry).find('.price').text().replace(/ /g, ''))),
                    date: parseDate(dates)
                }));
            });
            resolve(output);
        });
    });
}

module.exports.Search = Search;