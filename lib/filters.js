const Filter = function (value) {
    this.value = value;
}
module.exports.Filter = Filter;
module.exports.ALL = new Filter("a");
module.exports.PARTICULIER = new Filter("private");
module.exports.PROFESSIONNELS = new Filter("pro");

const FILTERS = {
    "ALL": module.exports.ALL,
    "PARTICULIER": module.exports.PARTICULIER,
    "PROFESSIONNELS": module.exports.PROFESSIONNELS
};

module.exports.FILTERS = FILTERS;
