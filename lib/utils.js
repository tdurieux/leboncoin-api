const AllHtmlEntities = require('html-entities').AllHtmlEntities;
const entities = new AllHtmlEntities();

var cleanString = function(input) {
    var output;
    output = input.replace(/[\n\t\ ]+/g, ' ')
                    .replace('&nbsp;', ' ')
                    .replace('&euro;', 'E')
                    .replace(/<script.*?>.*?<\/script>/gim, '')
                    .replace(/<[^>]*>/g, '').trim();
    output = entities.decode(output);
    return output;
};

module.exports.cleanString = cleanString;