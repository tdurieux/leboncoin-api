const cheerio = require('cheerio');
const request = require('request');
const url = require('url');
const iconv = require('iconv-lite');

const filters = require('./filters');
const item = require('./item');
const cleanString = require('./utils').cleanString;

const User = function (options) {
    if (!(this instanceof User))
        return new User(options);

    options = options || { };
    this.setUsername(options.username);
    this.setEmail(options.email);
    this.setPassword(options.password);
    this.setIsConnected(false);
    this.setLastname(options.lastname);
    this.setFirstname(options.firstname);
    this.setCategory(options.category);
    this.setCity(options.city);
    this.setStreet(options.street);
    this.setZip(options.zip);
    this.setCity(options.city);
    this.setState(options.state);
    this.setRegion(options.region);
    this.setPhone(options.phone);
};

User.prototype.isConnected = false;

User.prototype.setEmail = function(email) {
    if (!!email) {
        this.email = email;
    }
    return this;
};

User.prototype.setStreet = function(street) {
    if (!!street) {
        this.street = street;
    }
    return this;
};

User.prototype.setCity = function(city) {
    if (!!city) {
        this.city = city;
    }
    return this;
};

User.prototype.setState = function(state) {
    if (!!state) {
        this.state = state;
    }
    return this;
};

User.prototype.setRegion = function(region) {
    if (!!region) {
        this.region = region;
    }
    return this;
};

User.prototype.setZip = function(zip) {
    if (!!zip) {
        this.zip = zip;
    }
    return this;
};

User.prototype.setBirthday = function(birthday) {
    if (!!birthday) {
        this.birthday = birthday;
    }
    return this;
};

User.prototype.setPhone = function(phone) {
    if (!!phone) {
        this.phone = phone;
    }
    return this;
};

User.prototype.setCivility = function(civility) {
    if (!!civility) {
        this.civility = civility;
    }
    return this;
};

User.prototype.setHobbies = function(hobbies) {
    if (!!hobbies) {
        this.hobbies = hobbies;
    }
    return this;
};

User.prototype.setCategory = function(category) {
    if (!!category) {
        this.category = category;
    }
    return this;
};

User.prototype.setLastname = function(lastname) {
    if (!!lastname) {
        this.lastname = lastname;
    }
    return this;
};

User.prototype.setFirstname = function(firstname) {
    if (!!firstname) {
        this.firstname = firstname;
    }
    return this;
};

User.prototype.setUsername = function(username) {
    if (!!username) {
        this.username = username;
    }
    return this;
};

User.prototype.setPassword = function(password) {
    if (!!password) {
        this.password = password;
    }
    return this;
};

User.prototype.setIsConnected = function (isConnected) {
    if (isConnected == true || isConnected == false) {
        this.isConnected = isConnected;
    }
    return this;
};

User.prototype.logout = function () {
    const self = this;
    const logoutUrl = "https://compteperso.leboncoin.fr/store/logout/0?ca=12_s";
    return new Promise(
        function(resolve, reject) {
            if (!self.isConnected) {
                return reject("You are not connected");
            }
            request.get({
                uri: logoutUrl,
                encoding: null,
                gzip: true
            }, function (err) {
                if (err) {
                    return reject(err);
                }
                self.setIsConnected(false);
                resolve(this);
            });
        }
    );
};

User.prototype.login = function () {
    const self = this;
    const loginUrl = "https://compteperso.leboncoin.fr/store/verify_login/0";
    return new Promise(
        function(resolve, reject) {
            if (self.email == null || self.password == null) {
                return reject("You need to provide the password and the email");
            }
            self.cookie = request.jar();
            request.get({
                uri: "https://compteperso.leboncoin.fr/account/index.html?ca=12_s",
                jar: self.cookie,
                encoding: null,
                gzip: true
            }, function (err) {
                if (err) {
                    return reject(err);
                }
                request.post({
                    uri: loginUrl,
                    form: {
                        "st_username": self.email,
                        "st_passwd": self.password
                    },
                    jar: self.cookie,
                    encoding: null,
                    gzip: true
                }, function (err, res, body) {
                    if (err) {
                        return reject(err);
                    }
                    const isConnected = res.headers.location == "/store/main/0";
                    self.setIsConnected(isConnected);
                    if (isConnected) {
                        self.getData().then(function () {
                            resolve(self);
                        }, function (error) {
                            reject(error);
                        });
                    } else {
                        reject("Error during the login");
                    }
                });
            });
        }
    );
};

User.prototype.getData = function () {
    const self = this;
    const dataUrl = "https://compteperso.leboncoin.fr/account/my-data.html";
    return new Promise(
        function(resolve, reject) {
            if (!self.isConnected) {
                return reject("You must be connected");
            }
            request.get({
                uri: dataUrl,
                jar: self.cookie,
                encoding: null,
                gzip: true
            }, function (err, res, body) {
                if (err) {
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
                const data = {};
                var currentData = null;
                $('.my-data div').each(function (index, elem) {
                    const content = $(elem).text().replace(" : ", "");
                    if (elem.attribs.class.indexOf("key") != -1) {
                        if (currentData != null) {
                            data[currentData.key] = currentData.value;
                        }
                        currentData = {};
                        currentData.key = content;
                    } else if (elem.attribs.class.indexOf("value") == 0) {
                        if (content.indexOf("Aucun") != 0) {
                            currentData.value = content;
                        } else {
                            currentData.value = null;
                        }
                    }
                });
                data[currentData.key] = currentData.value;
                self.setStreet(data["Adresse"]);
                self.setCategory(data["Catégorie Socioprofessionnelle"]);
                self.setHobbies(data["Centres d'intérêt"]);
                self.setCivility(data["Civilité"]);
                self.setZip(parseInt(data["Code Postal"]));
                self.setBirthday(data["Date de naissance"]);
                self.setState(data["Département"]);
                self.setEmail(data["E-mail"]);
                self.setLastname(data["Nom"]);
                self.setFirstname(data["Prénom"]);
                self.setUsername(data["Pseudonyme"]);
                self.setRegion(data["Région"]);
                self.setPhone(data["Téléphone"]);
                self.setCity(data["Ville"]);


                resolve(self);
            });
        }
    );
};

module.exports.User = User;