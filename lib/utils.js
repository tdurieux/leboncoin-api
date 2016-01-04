const XmlEntities = require('html-entities').XmlEntities;
const entities = new XmlEntities();

var cleanString = function(input) {
    var output;
    output = input.replace('&nbsp;', ' ')
                    .replace('&euro;', 'E')
                    .replace(/<script.*?>.*?<\/script>/gim, '')
                    .replace(/<\/?br\/?>/gim, "\n")
                    .replace(/<[^>]*>/g, '')
                    .replace(/\n/g, "<br>").trim();
    output = entities.decode(output);
    return output;
};

module.exports.cleanString = cleanString;