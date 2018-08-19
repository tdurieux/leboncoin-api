const cheerio = require('cheerio');
const request = require('request');
const url = require('url');
const iconv = require('iconv-lite');

const filters = require('./filters');
const item = require('./item');
const cleanString = require('./utils').cleanString;
const isNullOrUndefined = require('./utils').isNullOrUndefined;

const http = require("https");
const _ = require("lodash");

const Search = function (options) {
    if (!(this instanceof Search))
        return new Search(options);

    this.searchExtras = {};

    options = options || {};

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
    this.setLimit(options.limit);
    if (options.searchExtras && options.searchExtras instanceof Object) {
        for (var i in options.searchExtras) {
            if (!options.searchExtras.hasOwnProperty(i)) {
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
Search.prototype.limit = 35;

Search.prototype.setQuery = function (query) {
    if (!!query) {
        this.query = query;
    }
    return this;
};

Search.prototype.setFilter = function (filter) {
    if (filter instanceof filters.Filter) {
        this.filter = filter;
    }
    return this;
};

Search.prototype.setShouldbe = function (shouldbe) {
    if (!!shouldbe) {
        this.shouldbe = shouldbe;
    }
    return this;
};

Search.prototype.setUrgencyOnly = function (urgencyOnly) {
    if (urgencyOnly == true || urgencyOnly == false) {
        this.urgencyOnly = urgencyOnly;
    }
    return this;
};

Search.prototype.setTitleOnly = function (titleOnly) {
    if (titleOnly == true || titleOnly == false) {
        this.titleOnly = titleOnly;
    }
    return this;
};

const regions = require('./../const/regions.json');
Search.prototype.setRegion = function (region) {
    if (!!region) {
        if (isNaN(region)) {

            var filteredRegion = _(regions)
                .filter(r => r.channel === region)
                .value()[0];
                
            if (filteredRegion) {
                this.region = filteredRegion.id;
            }

        } else {
            this.region = region;
        }
    }
    return this;
};
const departments = require('./../const/departments.json');
Search.prototype.setDepartment = function (department) {
    if (!!department) {
        if (isNaN(department)) {
            var filteredDepartments = _(departments)
                .filter(r => r.channel === department)
                .value()[0];
                
            if (filteredDepartments) {
                this.department = filteredDepartments.id;
            }
        } else {
            this.department = department;
        }
    }
    return this;
};

Search.prototype.setLocation = function (location) {
    if (!!location) {
        this.location = location;
    }
    return this;
};

const categories = require('./../const/categories.json');
Search.prototype.setCategory = function (category) {
    if (!!category) {
        if (isNaN(category)) {

            var filteredCategory = _(categories)
            .map(cat => cat.subcategories)
            .flatten()
            .filter(cat => cat.channel === category)
            .value()[0];
            
            if (filteredCategory) {
                this.category = filteredCategory.id;
            }

        } else {
            this.category = category;
        }
    }
    return this;
};

Search.prototype.setPage = function (page) {
    if (parseInt(page) == page) {
        this.page = page;
    }
    return this;
};

Search.prototype.setLimit = function (limit) {
    if (parseInt(limit) == limit) {
        this.limit = limit;
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

Search.prototype.setCubicCapacity = function (value) {
    this.addSearchExtra('cubic_capacity', value);
    return this;
}

Search.prototype.setRegDate = function (value) {
    this.addSearchExtra('regdate', value);
    return this;
}

Search.prototype.setMileAge = function (value) {
    this.addSearchExtra('mileage', value);
    return this;
}

/** sample:
 * 
 * {"filters":{"category":{"id":"2"},
 *  "enums":{"ad_type":["offer"],"brand":["Bmw"],"fuel":["1"],"gearbox":["1"],"model":["Serie 1"]},
 *  "keywords":{},"location":{"region":"12"},
 *  "ranges":{"mileage":{"min":20000,"max":60000},"price":{"min":250,"max":47500}}},"limit":35,"limit_alu":3,"offset":35}
 * 
 */
Search.prototype.getUrlOptions = function () {
    return {
        "method": "POST",
        "hostname": "api.leboncoin.fr",
        "port": null,
        "path": "/finder/search",
        "headers": {
            "origin": "https://www.leboncoin.fr",
            "api_key": "ba0c2dad52b3ec",
            "content-type": "text/plain;charset=UTF-8",
            "accept": "*/*",
            "referer": "https://www.leboncoin.fr/annonces/offres/ile_de_france/",
        }
    }
}

var getIdsForLabels = (search, currentCategoryId, key) => {
    search = search.map(searchLabel => {
        if (typeof searchLabel == 'string' && isNaN(parseInt(searchLabel))) {
            var searchId = _(subcategories[currentCategoryId][key].values).filter(value => value.label == searchLabel).value();
            searchLabel = searchId[0].value;
        }
        return searchLabel;
    });
    return search;
}

const subcategories = require('./../const/subcategories.json');
var getSubCategoriesRanges = (currentCategoryId, searchExtras) => {
    var ranges = {};

    // console.info('Parsing sub categories');

    _(searchExtras).forEach((search, key) => {
        if (currentCategoryId) {
            if (_(Object.keys(subcategories[currentCategoryId])).includes(key)) {
                // console.log(key, 'is a part of sub categories');
                if (typeof search === 'object' && !search.length) {
                    // console.log('Sub category found is considered as a range');
                    ranges[key] = search;
                }
            }
        }
    });

    // console.info('End of Parsing sub categories');
    return ranges;
}

const getSubCategoriesExtras = (currentCategoryId, searchExtras) => {
    var enums = { "ad_type": ["offer"] };

    // console.info('Parsing sub categories');

    _(searchExtras).forEach((search, key) => {
        if (currentCategoryId) {
            if (_(Object.keys(subcategories[currentCategoryId])).includes(key)) {
                // console.log(key, 'is a part of sub categories');
                if (search.length) {
                    // console.log('Sub category found is considered as an enum');

                    // If search is a label, Get id of search label into related sub category
                    search = getIdsForLabels(search, currentCategoryId, key);

                    enums[key] = search;                                   
                }
            }
        }
    });

    // console.info('End of Parsing sub categories');
    return enums;
};

const getLocation = (region, department, city_zipcodes) => {
    var location = {};

    if (region) {
        location.region = region;
    }

    if (department) {
        location.department = department;
    }

    if (city_zipcodes) {
        location.city_zipcodes = city_zipcodes;
    }

    return location;
}

const getKeywords = (keywords, titleOnly) => {
    var result = (keywords) ? {text: keywords} : {};
    if (titleOnly) {
        result.type = 'subject';
    }
    return result;
}

Search.prototype.getBodyParams = function () {
    return {
        "limit": this.limit,
        "filters": {
            "category": { "id": this.category },
            "enums": getSubCategoriesExtras(this.category, this.searchExtras),
            "location": getLocation(this.region, this.department, this.location),
            "keywords": getKeywords(this.query, this.titleOnly),
            "ranges": getSubCategoriesRanges(this.category, this.searchExtras)
        },
        "offset": (this.page -1) * 35
    }
};

const parseNbResult = function (results) {
    return results.length;
};

const parseData = function (data) {
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
            urgent: entry.urgent ? entry.urgent : false,
            price: entry.price ? entry.price[0] : 0,
            date: entry.first_publication_date,
            owner: entry.owner
        }));
    };

    return output;
};

Search.prototype.run = function (options, bodyParams) {
    var self = this;
    options = (options) ? options : this.getUrlOptions();
    bodyParams = (bodyParams) ? bodyParams : this.getBodyParams();
    return new Promise(
        function (resolve, reject) {
            // console.log(JSON.stringify(bodyParams));
            req = http.request(options, function (resp) {
                var chunks = [];

                resp.on("data", function (chunk) {
                    chunks.push(chunk);
                });

                resp.on("end", function () {
                    if (chunks.length == 0) {
                        var output = {
                            page: self.page,
                            pages: undefined,
                            nbResult: undefined,
                            results: undefined
                        }
                        resolve(output);
                    } else {
                        var body = Buffer.concat(chunks);
                        var jsonResult = JSON.parse(body.toString());
                        var output = {
                            page: self.page,
                            pages: Math.ceil(jsonResult.total / 35),
                            nbResult: parseNbResult(jsonResult.ads),
                            results: parseData(jsonResult.ads)
                        }
                        resolve(output);
                    }

                });
            });

            req.write(JSON.stringify(bodyParams));
            req.end();
        });
}

module.exports.Search = Search;
