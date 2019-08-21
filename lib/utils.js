const request = require('request');
module.exports.cookieJar = request.jar();
module.exports.requestHeaders = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
    'Accept-Language': '*',
    'Accept': '*/*',
    'Accept-Encoding':  'gzip, deflate, br',
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'Content-Type': 'application/json',
    'Referer': "https://www.leboncoin.fr/recherche/",
    'Origin': 'https://www.leboncoin.fr'
}