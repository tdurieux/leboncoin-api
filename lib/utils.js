const Session = require('./session').Session;

module.exports.defaultSession = new Session();

module.exports.requestHeaders = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
    'Accept-Language': '*',
    'Accept': '*/*',
    'Accept-Encoding':  'gzip, deflate, br',
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'Content-Type': 'application/json',
    'Referer': "https://www.leboncoin.fr/recherche/",
    'Origin': 'https://www.leboncoin.fr'
};
module.exports.getParisGMT = function() {
    var d = new Date();
    var s = d.toLocaleString(undefined, { timeZone: "Europe/Paris", timeZoneName: "short" });
    return s.slice(-5)
};
