const request = require('request');

function makeCookieValue(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_~-';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports.cookieJar = request.jar();
module.exports.requestHeaders = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
    'Accept-Language': '*',
    'Accept': '*/*',
    'Accept-Encoding':  'gzip, deflate, br',
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'Content-Type': 'application/json',
    'Referer': "https://www.leboncoin.fr/recherche/",
    'Origin': 'https://www.leboncoin.fr',
    'Cookie': makeCookieValue(106)
}
