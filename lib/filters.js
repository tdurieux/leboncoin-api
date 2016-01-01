const Filter = function (value) {
    this.value = value;
}
module.exports.Filter = Filter;
module.exports.ALL = new Filter("a");
module.exports.PARTICULIER = new Filter("p");
module.exports.PROFESSIONNELS = new Filter("c");

const FILTERS = {
    "ALL": module.exports.ALL,
    "PARTICULIER": module.exports.PARTICULIER,
    "PROFESSIONNELS": module.exports.PROFESSIONNELS
};

module.exports.FILTERS = FILTERS;