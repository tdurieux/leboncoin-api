const cheerio = require('cheerio');
const request = require('request');
const url = require('url');
const pixelGif= require('pixel-gif');
const iconv = require('iconv-lite');

const cleanString = require('./utils').cleanString;

const Item = function (options) {
    if (!(this instanceof Item)) 
        return new Item(options);

    options = options || { };

    for (var i in options) {
        if(!options.hasOwnProperty(i)) {
            continue;
        }
        this[i] = options[i];
    }
    if(this.link) {
        const pathname = url.parse(this.link).pathname;
        this.id = parseInt(pathname.split('/').reverse()[0].split('.htm')[0])
    }
    return this;
};

Item.prototype.getUrl = function () {
    if(this.link) {
        if(!this.link.startsWith("http")) {
            return "http:" + this.link;
        }
        return this.link;
    }
    var category = this.category;
    if(!category) {
        category = "cat";
    }
    return "http://www.leboncoin.fr/" + category + "/" + this.id + ".htm?ca=17_s";
}


var parseTableData = function ($) {
    var output = {};
    $('.properties > .line').each(function (index, row) {
        var key = $(row).find('.property').text().toLowerCase().replace(":", "").trim();
        var value = cleanString($(row).find('.value').text());
        if(key && value) {
            if(key.indexOf("prix") != -1) {
                value = parseFloat(value.replace(/ /g, ''));
                key = "price";
            } else if(key == "loyer mensuel") {
                value = parseFloat(value.replace(/ /g, ''));
                key = "rent";
            } else if(key == "ville") {
                const splitted = value.split(" ", value.lastIndexOf(" ") - 1);
                key = "zip"
                value = parseInt(splitted[1]);
                output[key] = value;

                key = "city";
                value = splitted[0];
            } else if(key == "référence") {
                key = "reference"
            } else if(key == "surface") {
                value = parseInt(value.replace(/ /g, ''));
            } else if(key == "ges") {
                value = value[0];
            } else if(key == 'classe énergie') {
                value = value[0];
            } else if(key == 'pièces') {
                key = 'rooms'
                value = parseInt(value);
            } else if(key == 'frais d\'agence inclus') {
                key = 'agencyFees';
            }
            if (value == 'Oui') {
                value = true;
            } else if (value == 'Non') {
                value = false;
            }
            output[key] = value;
        }
    });
    return output;
};

var parseImages = function ($) {
    const images = [];
    const carouselScript = $(".adview_main > script").eq(1).text();
    const imageRegex = /images\[[0-9]+\] *= *"([^"]+)";/g;
    var result;
    var index = -1;
    while(result = imageRegex.exec(carouselScript)){
       images.push(result[1]);
    }

    if(images.length == 0) {
        images.push($(".item_image.big > img").attr('src'));
    }
    return images;
};

var parseMeta = function ($) {
    var output = {};
    $('meta').each(function (idex, elem) {
        const key = $(elem).attr('itemprop');
        const value = $(elem).attr('content');
        if(key && value) {
            output[key] = value;
        }
    });
    return output;
};

Item.prototype.getDetails = function () {
    var url = this.getUrl();
    var self = this;
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
            var scriptStart = body.indexOf('window.FLUX_STATE = ');
            var scriptEnd = body.indexOf('</script>', scriptStart);
            var details = JSON.parse(body.substring(scriptStart, scriptEnd).replace("window.FLUX_STATE = ", ""));
            const opts = {
                normalizeWhitespace: true,
                decodeEntities: true
            };
            const $ = cheerio.load(body, opts);

            const meta = parseMeta($);

            self.title = details.adview.subject;
            
            self.seller = details.adview.owner.name;

            const data = parseTableData($);
            for(var i in data) {
                if(!data.hasOwnProperty(i)) {
                    continue;
                }
                self[i] = data[i];
            }
           
            self.images = details.adview.images.urls_large; 
            /*const imagesCopy = self.images;
           

            if(self.images.length == 0) {
                self.images = imagesCopy;
                if(self.images.length == 0) {
                    self.images.push(self.image);
                }
            }
            delete self.image;*/

            self.description = details.adview.body;
            self.details = details.adview;

            resolve(self);
        });
    });
};

Item.prototype.getPhoneNumber = function () {
    var self = this;
    return new Promise(
    function(resolve, reject) {
        if (!!self.phoneNumber) {
            return resolve(self.phoneNumber);
        }
        request.post({
            url: 'https://api.leboncoin.fr/api/utils/phonenumber.json',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.8,fr;q=0.6',
                'Referer': "https://www.leboncoin.fr/locations/" + self.id + "htm?ca=12_s",
                'Origin': 'https://www.leboncoin.fr'
            },
            gzip: true
        }, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return reject(err);
            }
            var data = JSON.parse(body);
            if (data.utils.status == 'OK') {
                self.phoneNumber = data.utils.phonenumber;
                return resolve(self.phoneNumber);
            } else {
                reject('Phone number not found');
            }
        }).form({
            'list_id': self.id,
            'app_id': 'leboncoin_web_utils',
            'key': '54bb0281238b45a03f0ee695f73e704f',
            'text': '1'
        });
    });
};

module.exports.Item = Item;
module.exports.parseMeta = parseMeta;
module.exports.parseImages = parseImages;
module.exports.parseTableData = parseTableData;
