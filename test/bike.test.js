const search = require("../lib/search.js");
const item = require("../lib/item.js");

describe('Bike', function() {

    it('Get the details of a motobike', function(done) {
        var input = new item.Item();
        input.attributes = {
                regdate: "2018",
                mileage: "40000",
                cubic_capacity: "600"
        };
        input.bike.should.have.property('regdate').and.be.exactly('2018');
        input.bike.should.have.property('mileage').and.be.exactly('40000');
        input.bike.should.have.property('cubic_capacity').and.be.exactly('600');
        done();
    });

    it('Get the details of a motobike with missing value', function(done) {
        var input = new item.Item();
            input.attributes = {
                mileage: "40000",
                cubic_capacity: "600"
            };
        input.bike.should.have.property('regdate').and.be.exactly('');

        input.attributes = {
            regdate: "2018",
            cubic_capacity: "600"
        };
        input.bike.should.have.property('mileage').and.be.exactly('');

        input.attributes = {
            regdate : "2018",
            mileage: "40000"
        };
        input.bike.should.have.property('cubic_capacity').and.be.exactly('');
        done();
    });

    this.timeout(500000);
    it('check reponse format', function(done) {
        /* make a real call to server
         * getDetails should returns :
         * {
         *    attributes: {
         *      regdate: "2008",
         *      mileage: "2015",
         *      cubic_capacity: "600"
         *    }
         * }
         */
        new search.Search()
        .setCategory("motos")
        .run().then(function (data) {
            data.results[0].getDetails().then(function (data) {
                data.should.have.property('attributes');
                data.attributes.should.have.property('regdate');
                data.attributes.should.have.property('mileage');
                data.attributes.should.have.property('cubic_capacity');
            }, function (err) {
                done(err);
            });
        }, function (err) {
            done(err);
        });

        done();
    });

});
