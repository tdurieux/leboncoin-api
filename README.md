# leboncoin-api [![Build Status](https://travis-ci.org/tdurieux/leboncoin-api.svg?branch=master)](https://travis-ci.org/tdurieux/leboncoin-api) [![Coverage Status](https://coveralls.io/repos/tdurieux/leboncoin-api/badge.svg?branch=master&service=github)](https://coveralls.io/github/tdurieux/leboncoin-api?branch=master)

[![NPM](https://nodei.co/npm/leboncoin-api.png)](https://nodei.co/npm/leboncoin-api/)

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
    .setRegion("ilgit se_de_france")
    .addSearchExtra("mrs", 250) // min rent
    .addSearchExtra("mre", 1250); // min rent

search.run().then(function (data) {
    console.log(data.page); // the current page
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
