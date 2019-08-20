# leboncoin-api [![Build Status](https://travis-ci.org/tdurieux/leboncoin-api.svg?branch=master)](https://travis-ci.org/tdurieux/leboncoin-api) [![Coverage Status](https://coveralls.io/repos/tdurieux/leboncoin-api/badge.svg?branch=master&service=github)](https://coveralls.io/github/tdurieux/leboncoin-api?branch=master)

[![NPM](https://nodei.co/npm/leboncoin-api.png)](https://nodei.co/npm/leboncoin-api/)



**/!\ leboncoin.fr is using DataDome to protect his API from library likes this one, it is library is not reliable in production anymore /!\\**

## Documentation

The documentation of the library is available here: https://durieux.me/projects/leboncoin.html.

## Install

```bash
npm install leboncoin-api
```

## Features

* Search on leboncoin.fr with all functionality available leboncoin.fr
* Get the detailed page of an item
* Get the phone number of the seller (convert the image to string) **/!\ This API have an unknown usage limit**

## Usage

```javascript
const leboncoin = require('leboncoin-api');
var search = new leboncoin.Search()
    .setPage(1)
    .setQuery("renove")
    .setFilter(leboncoin.FILTERS.PARTICULIER)
    .setCategory("locations")
    .setRegion("ile_de_france")
    .setDepartment("yvelines")
    .setLocation([
                 {"zipcode": "78100"},
                 {"zipcode": "78000"},
                 ])
//Search around you with latitude and longitude of your position and a radius in meters. Doing so you don't need to set Region, Department and Location
//Exemple for 30km around Lyon
//.setArea({"lat": 45.7679705, "lng": 4.8637901999999995, "radius": 30000})

    //Add sort, two kind date or price and two ways asc or desc
    //Exemple for a sort by date asc (older the first)
    //.setSort({sort_by:"date",sort_order:"asc"})

    .addSearchExtra("price", {min: 1500, max: 2000}) // will add a range of price
    .addSearchExtra('furnished', ["1", "Non meublé"]); // will add enums for Meublé and Non meublé

// Please check into categories & sub categories constants to know which are the sub categories to add into "addSearchExtra"

search.run().then(function (data) {
    console.log(data.page); // the current page
    console.log(data.pages); // the number of pages
    console.log(data.nbResult); // the number of results for this search
    console.log(data.results); // the array of results
    data.results[0].getDetails().then(function (details) {
        console.log(details); // the item 0 with more data such as description, all images, author, ...
    }, function (err) {
        console.error(err);
    });
    data.results[0].getPhoneNumber().then(function (phoneNumer) {
        console.log(phoneNumer); // the phone number of the author if available
    }, function (err) {
        console.error(err); // if the phone number is not available or not parsable (image -> string) 
    });
}, function (err) {
    console.error(err);
});
```

## License MIT
