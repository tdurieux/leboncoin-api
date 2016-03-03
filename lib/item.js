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

var parseTitle = function ($) {
    return cleanString($('.adview_header > h1').text().trim());
};

var parseDescription = function ($) {
    var value = $(".properties_description .value").html();
    if (!value) {
        value = $("#Description").html()
    }
    return cleanString(value);
};

var parseSeller = function ($) {
    return cleanString($(".mbs > .title").html().trim());
};

var parseTableData = function ($) {
    var output = {};
    $('.properties > .line').each(function (index, row) {
        var key = $(row).find('.property').text().toLowerCase().replace(":", "").trim();
        var value = cleanString($(row).find('.value').text());
        if(key && value) {
            if(key.indexOf("prix") != -1) {
                value = parseFloat(value.replace(/ /g, ''));
                key = "price";
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
    var images = [];
    $(".thumbnails .item_imagePic > img").each(function (index, elem) {
        images.push($(elem).attr('src').replace("thumbs",'images'));
    });

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
            const opts = {
                normalizeWhitespace: true,
                decodeEntities: true
            };
            const $ = cheerio.load(body, opts);

            const meta = parseMeta($);

            self.title = parseTitle($);
            
            self.seller = parseSeller($);

            const data = parseTableData($);
            for(var i in data) {
                if(!data.hasOwnProperty(i)) {
                    continue;
                }
                self[i] = data[i];
            }
            
            const imagesCopy = self.images;
            self.images = parseImages($);

            if(self.images.length == 0) {
                self.images = imagesCopy;
                if(self.images.length == 0) {
                    self.images.push(self.image);
                }
            }
            delete self.image;

            self.description = parseDescription($);

            resolve(self);
        });
    });
};

var parsePhoneNumberImage = function (phoneNumberAddress) {
    return new Promise(
    function(resolve, reject) {
        pixelGif.parse(phoneNumberAddress).then(function(images){
            const image = images[0];
            // the pixel representation of each number
            var numbers = [];
            // the current number
            var currentNumber = [];
            // the current x position in the number
            var iCurrent = 0;

            // identify black pixels
            for (var i = 0; i < image.width; i++) {
                var empty = true;
                for (var j = 0; j < image.height; j++) {
                    var index = i*4 + j * image.width * 4;
                    var value = image.data[index];
                    var transparent = image.data[index + 3];
                    var isBlack = (value <= 90 && transparent > 150);
                    if(empty) {
                        empty = !isBlack;
                    }
                    if(!currentNumber[iCurrent]) {
                        currentNumber[iCurrent] = []
                    }
                    currentNumber[iCurrent][j] = isBlack;
                }
                if(empty) {
                    if(currentNumber.length > 3) {
                        numbers.push(currentNumber);
                    }
                    currentNumber = [];
                    iCurrent = 0;
                } else {
                    iCurrent++;
                }
            }

            var finalNumber = "";
            // map each matrix to a number
            for (var k = 0; k < numbers.length; k++) {
                // the coordinates of black pixels
                var id = [];
                for (var i = 0; i < numbers[k].length; i++) {
                    for (var j = 0; j < numbers[k][i].length; j++) {
                        if(numbers[k][i][j]) {
                            id.push({x: i, y: j});
                        }
                    }
                }
                var foundTotal = false;
                for (var i = 0; i < numberIds.length; i++) {
                    var numberId = numberIds[i];
                    var found = true;
                    if(id.length != numberId.length) {
                        continue;
                    }
                    for (var j = 0; j < numberId.length; j++) {
                        var coordinate = numberId[j];
                        if(!numbers[k][coordinate.x][coordinate.y]) {
                            found = false;
                            break; 
                        }
                    }
                    if(found) {
                        finalNumber += "" + i;
                        foundTotal = true;
                        break;
                    }
                }
                if(!foundTotal) {
                    return reject(id);
                }
            }
            resolve(finalNumber);
        }, reject);
    });
}

var getPhoneNumberAddress = function (id) {
    var url = "http://www2.leboncoin.fr/ajapi/get/phone?list_id=" + id;
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
            if(!phoneImage) {
                return reject("Cannot retrieve the phone number URI. You may exceed your API quota.");
            }
            resolve(phoneImage);
        });
    });
}

Item.prototype.getPhoneNumber = function () {
    var self = this;
    return new Promise(
    function(resolve, reject) {
        if (!!self.phoneNumber) {
            return resolve(self.phoneNumber);
        }
        getPhoneNumberAddress(self.id).then(function (url) {
            if(!url.startsWith("http")) {
                url = "http:" + url;
            }
            parsePhoneNumberImage(url).then(function (phoneNumber) {
                self.phoneNumber = phoneNumber;
                return resolve(self.phoneNumber);
            }, reject);
        }, reject);
    });
};

module.exports.Item = Item;
module.exports.parseMeta = parseMeta;
module.exports.parseImages = parseImages;
module.exports.parseDescription = parseDescription;
module.exports.parseTableData = parseTableData;
module.exports.parseTitle = parseTitle;
module.exports.parseSeller = parseSeller;

module.exports.parsePhoneNumberImage = parsePhoneNumberImage;







var numberIds = [
[ { x: 1, y: 0 },
  { x: 2, y: 0 },
  { x: 3, y: 0 },
  { x: 1, y: 1 },
  { x: 4, y: 1 },
  { x: 0, y: 2 },
  { x: 5, y: 2 },
  { x: 0, y: 3 },
  { x: 5, y: 3 },
  { x: 0, y: 4 },
  { x: 5, y: 4 },
  { x: 0, y: 5 },
  { x: 5, y: 5 },
  { x: 0, y: 6 },
  { x: 5, y: 6 },
  { x: 1, y: 7 },
  { x: 4, y: 7 },
  { x: 1, y: 8 },
  { x: 2, y: 8 },
  { x: 3, y: 8 } ], // 0
  [ { x: 2, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 2, y: 2 },
    { x: 2, y: 3 },
    { x: 2, y: 4 },
    { x: 2, y: 5 },
    { x: 2, y: 6 },
    { x: 2, y: 7 },
    { x: 0, y: 8 },
    { x: 1, y: 8 },
    { x: 2, y: 8 },
    { x: 3, y: 8 },
    { x: 4, y: 8 } ], // 1
  [ { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 3, y: 0 },
    { x: 4, y: 0 },
    { x: 5, y: 1 },
    { x: 5, y: 2 },
    { x: 5, y: 3 },
    { x: 4, y: 4 },
    { x: 3, y: 5 },
    { x: 2, y: 6 },
    { x: 1, y: 7 },
    { x: 0, y: 8 },
    { x: 1, y: 8 },
    { x: 2, y: 8 },
    { x: 3, y: 8 },
    { x: 4, y: 8 },
    { x: 5, y: 8 } ], // 2
  [ { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 3, y: 0 },
    { x: 4, y: 1 },
    { x: 4, y: 2 },
    { x: 2, y: 3 },
    { x: 3, y: 3 },
    { x: 4, y: 5 },
    { x: 4, y: 6 },
    { x: 3, y: 7 },
    { x: 0, y: 8 },
    { x: 1, y: 8 },
    { x: 2, y: 8 } ], // 3
  [ { x: 4, y: 0 },
    { x: 3, y: 1 },
    { x: 4, y: 1 },
    { x: 2, y: 2 },
    { x: 4, y: 2 },
    { x: 1, y: 3 },
    { x: 4, y: 3 },
    { x: 0, y: 4 },
    { x: 4, y: 4 },
    { x: 0, y: 5 },
    { x: 1, y: 5 },
    { x: 2, y: 5 },
    { x: 3, y: 5 },
    { x: 4, y: 5 },
    { x: 5, y: 5 },
    { x: 4, y: 6 },
    { x: 4, y: 7 },
    { x: 4, y: 8 } ], // 4
  [ { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 3, y: 0 },
    { x: 4, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: 2 },
    { x: 0, y: 3 },
    { x: 1, y: 3 },
    { x: 2, y: 3 },
    { x: 3, y: 3 },
    { x: 3, y: 4 },
    { x: 4, y: 4 },
    { x: 4, y: 5 },
    { x: 4, y: 6 },
    { x: 3, y: 7 },
    { x: 0, y: 8 },
    { x: 1, y: 8 },
    { x: 2, y: 8 } ], // 5
  [ { x: 2, y: 0 },
    { x: 3, y: 0 },
    { x: 4, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 2 },
    { x: 0, y: 3 },
    { x: 1, y: 3 },
    { x: 2, y: 3 },
    { x: 3, y: 3 },
    { x: 4, y: 3 },
    { x: 0, y: 4 },
    { x: 4, y: 4 },
    { x: 5, y: 4 },
    { x: 0, y: 5 },
    { x: 5, y: 5 },
    { x: 0, y: 6 },
    { x: 5, y: 6 },
    { x: 1, y: 7 },
    { x: 4, y: 7 },
    { x: 2, y: 8 },
    { x: 3, y: 8 } ], // 6
  [ { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 3, y: 0 },
    { x: 4, y: 0 },
    { x: 5, y: 0 },
    { x: 5, y: 1 },
    { x: 4, y: 2 },
    { x: 4, y: 3 },
    { x: 3, y: 4 },
    { x: 3, y: 5 },
    { x: 2, y: 6 },
    { x: 2, y: 7 },
    { x: 1, y: 8 } ], // 7
  [ { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 3, y: 0 },
    { x: 4, y: 0 },
    { x: 0, y: 1 },
    { x: 5, y: 1 },
    { x: 0, y: 2 },
    { x: 5, y: 2 },
    { x: 0, y: 3 },
    { x: 1, y: 3 },
    { x: 4, y: 3 },
    { x: 1, y: 4 },
    { x: 3, y: 4 },
    { x: 4, y: 4 },
    { x: 0, y: 5 },
    { x: 5, y: 5 },
    { x: 0, y: 6 },
    { x: 5, y: 6 },
    { x: 0, y: 7 },
    { x: 5, y: 7 },
    { x: 1, y: 8 },
    { x: 2, y: 8 },
    { x: 3, y: 8 } ], // 8
  [ { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 3, y: 0 },
    { x: 0, y: 1 },
    { x: 4, y: 1 },
    { x: 0, y: 2 },
    { x: 5, y: 2 },
    { x: 0, y: 3 },
    { x: 5, y: 3 },
    { x: 0, y: 4 },
    { x: 5, y: 4 },
    { x: 1, y: 5 },
    { x: 2, y: 5 },
    { x: 3, y: 5 },
    { x: 4, y: 5 },
    { x: 5, y: 5 },
    { x: 4, y: 7 },
    { x: 1, y: 8 },
    { x: 2, y: 8 } ], // 9
];
