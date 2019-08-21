const request = require('request');
const url = require('url');
const utils = require('./utils')
const Bike = require('./bike.js');

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
    return "http://www.leboncoin.fr/" + category + "/" + this.id + ".htm/";
}


Item.prototype.getDetails = function () {
    var self = this;
    return new Promise(
    function(resolve, reject) {
        request.get({
            uri: "https://api.leboncoin.fr/finder/classified/" + self.id,
            jar: utils.cookieJar,
            headers: utils.requestHeaders,
            gzip: true
        }, function (err, res) {
            if(err) {
                return reject(err);
            }
            if (!res.body) {
                return reject(`Item ${self.id} not found`);
            }
            var entry = JSON.parse(res.body);

            var attributes = {};
        
            if (entry.attributes != null) {
                entry.attributes.forEach(attribute => {
                    attributes[attribute.key] = attribute.value;
                })
            }

            self.title = entry.subject;
            self.description = entry.body;
            self.category = entry.category_name;
            self.link = entry.url;
            self.images = entry.images.urls;
            self.location = entry.location;
            self.urgent = entry.options.urgent ? entry.options.urgent : false;
            self.price = entry.price ? entry.price[0] : 0;
            self.date = new Date(entry.first_publication_date);
            self.date_index = new Date(entry.index_date);
            self.updated = new Date(entry.index_date);
            self.owner = entry.owner;
            self.seller = entry.owner.name;
            self.attributes = attributes;
            self.has_phone = entry.has_phone;

            self.description = entry.body;

            resolve(self);
        });
    });
};

Object.defineProperty(Item.prototype, 'bike', { get : function() {
    return new Bike.Bike(this);
}});

Item.prototype.getPhoneNumber = function () {
    var self = this;
    return new Promise(
    function(resolve, reject) {
        if (self.has_phone == false) {
            reject('Phone number not found');
        }
        if (!!self.phoneNumber) {
            return resolve(self.phoneNumber);
        }
        request.post({
            url: 'https://api.leboncoin.fr/api/utils/phonenumber.json',
            jar: utils.cookieJar,
            headers: utils.requestHeaders,
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
