const AllHtmlEntities = require('html-entities').AllHtmlEntities;
const entities = new AllHtmlEntities();

var cleanString = function(input) {
    console.log(input);
    var output;
    output = input.replace(/[\n\t\ ]+/g, ' ')
                    .replace('&nbsp;', ' ')
                    .replace('&euro;', 'E')
                    .replace(/<script.*?>.*?<\/script>/gim, '')
                    .replace(/<[^>]*>/g, '').trim();
    console.log(output);
    output = entities.decode(output);
    console.log(output);
    return output;
};

module.exports.cleanString = cleanString;