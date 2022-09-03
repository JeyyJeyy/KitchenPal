const fs = require('fs');
const stock = require('./fonctions.js');

fs.readFile('data.json', 'utf8', function readFileCallback(err, data) {
    let das = JSON.parse(data);
    let i = 0;
    let x = 0;
    let bars = [];
    das.forEach(function (value) {
        let address = `https://fr.openfoodfacts.org/api/v0/product/${value.barcode}.json`;
        stock.downloading(address, value.barcode);
        bars.push(value.barcode);
        i++
    })
    console.log('[!] ' + i + ' produits rechargés')
    fs.readdir("./products/", function (err, files) {
        files.forEach(function (file, index) {
            let f = file.slice(0, -5);
            if(!bars.includes(f) && f != "additives"){
                fs.unlinkSync('./products/'+file);
                fs.unlinkSync('./assets/'+f+'.jpg');
                x++
            }
        })
        console.log('[!] ' + x + ' produits supprimés')
    })
});