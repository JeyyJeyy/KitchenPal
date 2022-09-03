const fs = require('fs');
const stock = require('./fonctions.js');

fs.readFile('data.json', 'utf8', function readFileCallback(err, data) {
    let das = JSON.parse(data);
    let i = 0;
    das.forEach(function (value) {
        let address = `https://fr.openfoodfacts.org/api/v0/product/${value.barcode}.json`;
        stock.downloading(address, value.barcode);
        i++
    })
    console.log('[!] ' + i + ' produits rechargés')
});
