const cheerio = require('cheerio');
const request = require('request');
const url = require('url');

const filters = require('./filters');
const item = require('./item');

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
        this.filter = filter.value;
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
        "f": this.filter,
        "ur": this.urgencyOnly ? 1: 0,
        //"sp" = 1 if @options.sort_by_price
        "it": this.titleOnly ? 1: 0,
        "location": this.location
    };
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

var cleanString = function(input) {
    var output;
    output = input.replace(/[\n\t\ ]+/g, ' ')
                    .replace('&nbsp;', ' ')
                    .replace('&euro;', 'E')
                    .replace(/<script.*?>.*?<\/script>/gim, '')
                    .replace(/<[^>]*>/g, '').trim();
    return output;
};
const month = new Array();
month[0] = "January";
month[1] = "February";
month[2] = "March";
month[3] = "April";
month[4] = "May";
month[5] = "June";
month[6] = "July";
month[7] = "August";
month[8] = "September";
month[9] = "October";
month[10] = "November";
month[11] = "December";

var parseDate = function (dates) {
    if(dates[0] == 'Aujourd\'hui') {
        const date = new Date();
        dates[0] = date.getDate() + " " + month[date.getMonth()] + " " + date.getFullYear();
    } else if(dates[0] == 'Hier') {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        dates[0] = date.getDate() + " " + month[date.getMonth()] + " " + date.getFullYear();
    }
    return new Date(dates[0] + " " + dates[1]);
}
Search.prototype.run = function() {
    var url = this.getUrl();
    return new Promise(
    function(resolve, reject) {
        request.get({
            uri: url,
            gzip: true
        }, function (err, res, body) {
            if(err) {
                return reject(err);
            }
            const opts = {
                normalizeWhitespace: true,
                decodeEntities: true
            };
            const $ = cheerio.load(body, opts);
            const output = [];
            $('.list-lbc > a').each(function (index, entry) {
                const dates = [];
                $(entry).find('.date div').each(function (index, entry) {
                    dates.push(cleanString($(entry).text()));
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