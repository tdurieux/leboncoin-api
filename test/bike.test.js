const item = require("../lib/item.js");

describe('Bike', function() {
    it('Get the details of a motobike', function(done) {
        var input = new item.Item();
        input.details = {
            attributes : [
                { key : "regdate", value : "2018"},
                { key : "mileage",  value : "40000"},
                { key : "cubic_capacity",  value : "600"}
            ]
        };
        input.bike.should.have.property('regdate').and.be.exactly('2018');
        input.bike.should.have.property('mileage').and.be.exactly('40000');
        input.bike.should.have.property('cubic_capacity').and.be.exactly('600');
        done();
    });

    it('Get the details of a motobike with missing value', function(done) {
        var input = new item.Item();
            input.details = {
            attributes : [
                { key : "mileage",  value : "40000"},
                { key : "cubic_capacity",  value : "600"}
            ]
        };
        input.bike.should.have.property('regdate').and.be.exactly('');

        input.details = {
            attributes : [
                { key : "regdate", value : "2018"},
                { key : "cubic_capacity",  value : "600"}
            ]
        };
        input.bike.should.have.property('mileage').and.be.exactly('');

        input.details = {
            attributes : [
                { key : "regdate", value : "2018"},
                { key : "mileage",  value : "40000"}
            ]
        };
        input.bike.should.have.property('cubic_capacity').and.be.exactly('');
        done();
    });
});
