# leboncoin-api [![Build Status](https://travis-ci.org/tdurieux/leboncoin-api.svg?branch=master)](https://travis-ci.org/tdurieux/leboncoin-api)

```bash
npm install leboncoin-api
```

## Usage

```javascript
    const leboncoin = require('leboncoin-api');
    new leboncoin.Search()
        .setPage(1)
        .setQuery("Search term")
        .setFilter(leboncoin.FILTERS.PARTICULIER)
        .setCategory("locations")
        .setRegion("ile_de_france")
        .run(function (data) {
            console.log(data.page); // the current page
            console.log(data.nbResult); // the number of results for this search
            console.log(data.results); // the array of results
            data.results[0].getDetails(function (details) {
                console.log(details); // the item 0 with more data such as description, all images, author, ...
            }, function (err) {
                console.error(err);
            });
            data.results[0].getPhoneNumber(function (phoneNumer) {
                console.log(phoneNumer); // the phone number of the author if available
            }, function (err) {
                console.error(err); // if the phone number is not available or not parsable (image -> string) 
            });
        }, function (err) {
            console.error(err);
        });
```

## License MIT
