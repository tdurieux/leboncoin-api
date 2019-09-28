/* 
 * Create ad.bike.cubic_capacity, ad.bike.mileage and ad.bike.regdate
 * Make them with getters which get requested value finding it into object
 * returned by getDetails.
 */

var Bike = function(ad) {
    // store reference to ad.
    this.ad = ad;
}

/**
 * getter return '' if requested value is not defined.
 */
function _makeGetter(name) {
    Object.defineProperty(Bike.prototype, name, { get : function() {
        var v = this.ad.attributes[name];
        return v == undefined ? "" : v;
    }});
}

_makeGetter('cubic_capacity');
_makeGetter('mileage');
_makeGetter('regdate');

module.exports.Bike = Bike;
