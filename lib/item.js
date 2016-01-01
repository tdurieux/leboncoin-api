const cheerio = require('cheerio');
const request = require('request');
const url = require('url');
const pixelGif= require('pixel-gif');

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

Item.prototype.getDetails = function () {
    var url = this.link;
    var self = this;
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
            $('meta').each(function (idex, elem) {
                const key = $(elem).attr('itemprop');
                const value = $(elem).attr('content');
                if(key && value) {
                    self[key] = value;
                }
            });
            self.title = $('#ad_subject').text().trim();
            $('.lbcParams table tr').each(function (index, row) {
                var key = $(row).find('th').text().replace(':', ' ').toLowerCase().trim();
                var value = $(row).find('td').text().trim();
                if(key && value) {
                    if(key.trim() == "prix") {
                        value = parseFloat(value.replace(/ /g, ''));
                        key = "price";
                    } else if(key.trim() == "code postal") {
                        key = "zip"
                        value = parseInt(value);
                    } else if(key.trim() == "ville") {
                        key = "city"
                    }
                    self[key] = value;
                }
            });

            self.date = new Date($('.upload_by').text()
                        .replace(self.seller, '')
                        .replace("- Mise en ligne le", '')
                        .replace("à ", '')
                        .replace(".", '')
                        .trim());
            self.description = $(".AdviewContent > .content").html().trim();
            self.images = [];
            $("#thumbs_carousel span").each(function (index, elem) {
                self.images.push($(elem).css('background-image').split("'")[1]
                    .replace("thumbs",'images'));
            });
            if(self.images.length > 0) {
                delete self.image;
            }
            resolve(self);
        });
    });
};

Item.prototype.getPhoneNumber = function () {
    var url = "http://www2.leboncoin.fr/ajapi/get/phone?list_id=" + this.id;
    var self = this;
    return new Promise(
    function(resolve, reject) {
        request.get({
            uri: url,
            gzip: true,
            json: true
        }, function (err, res, body) {
            if(err) {
                return reject(err);
            }
            var phoneImage = body.phoneUrl;
            console.log(body)
            if(!phoneImage) {
                return resolve(null);
            }
            pixelGif.parse(phoneImage).then(function(images){
                const image = images[0];
                console.log(image.width * image.height);
                console.log(image.data.length);
                var line = "";
                for (var i = 0; i < image.data.length; i += 3) {
                    if(i / 3 % image.width == 0 ) {
                        console.log(line);
                        line = '';
                    }
                    var value = image.data[i];
                    if(value == 0) {
                        line += "·"
                    } else {
                        line += " ";
                    }
                };
                console.log(line);
            });
            resolve('');
        });
    });
};
module.exports.Item = Item;