const request = require('request');

const utils = require('./utils')

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
    return new Promise(
        function(resolve, reject) {
            if (!self.isConnected) {
                return reject("You are not connected");
            }
            request.get({
                uri: "https://api.leboncoin.fr/api/oauth/v1/logout",
                jar: utils.cookieJar,
                headers: utils.requestHeaders,
                gzip: true
            }, function (err) {
                if (err) {
                    return reject(err);
                }
                delete utils.requestHeaders.Authorization;
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
            request.post({
                uri: "https://api.leboncoin.fr/api/oauth/v1/token",
                form: {
                    "client_id": 'frontweb',
                    "grant_type": 'password',
                    "username": self.email,
                    "password": self.password
                },
                jar: utils.cookieJar,
                headers: utils.requestHeaders,
                gzip: true
            }, function (err, res, body) {
                if (err) {
                    return reject(err);
                }
                const isConnected = JSON.parse(body).access_token != null;
                self.setIsConnected(isConnected);
                if (isConnected) {
                    utils.requestHeaders.Authorization = 'Bearer ' + JSON.parse(body).access_token;
                    self.getData().then(function () {
                        resolve(self);
                    }, function (error) {
                        reject(error);
                    });
                } else {
                    reject("Invalid login or password!");
                }
            });
        }
    );
};

User.prototype.getData = function () {
    const self = this;
    const dataUrl = "https://api.leboncoin.fr/api/accounts/v1/accounts/me/personaldata";
    return new Promise(
        function(resolve, reject) {
            if (!self.isConnected) {
                return reject("You must be connected");
            }
            request.get({
                uri: dataUrl,
                jar: utils.cookieJar,
                headers: utils.requestHeaders,
                gzip: true
            }, function (err, res, body) {
                if (err) {
                    return reject(err);
                }
                body = JSON.parse(body).personalData
                
                self.setStreet(body.addresses);
                self.setUsername(body.pseudo);
                self.setPhone(body.birthDate);
                self.setBirthday(new Date(body.birthDate));
                self.setEmail(body.email);
                self.setLastname(body.firstname);
                self.setFirstname(body.lastname);
                self.setCategory(body.occupationalCategory);

                // self.setHobbies(data["Centres d'intérêt"]);
                // self.setCivility(data["Civilité"]);
                // self.setZip(parseInt(data["Code Postal"]));
                // self.setState(data["Département"]);
                // self.setRegion(data["Région"]);
                // self.setCity(data["Ville"]);

                resolve(self);
            });
        }
    );
};

module.exports.User = User;