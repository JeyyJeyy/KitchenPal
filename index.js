var bodyParser = require('body-parser');
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const stock = require('./fonctions.js');
const app = express();
let times = 0;

console.clear();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('webpage'));
app.use(express.static('webpage/icons/'));
app.use(express.static('assets'));

(async () => {
    console.clear();
    let x = true;
    figlet.text('StockManager', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: undefined,
        whitespaceBreak: true
    }, function (err, data) {
        if (err) {
            console.log(col.red('Erreur au lancement...'));
            return;
        }
        console.log(gradient('white', 'cyan')(data) + col.cyan('\n\tStockManager v2.7.10 - Gérer ses stocks @JeyyJeyy'));
    });
    await delay(500);
})();

app.get('/', function (req, res) {
    res.redirect('/home');
})
app.get('/data.json', function (req, res) {
    res.sendFile('data.json', { root: '.' });
    times++
    console.log("\x1b[32m", "[" + process.uptime().toFixed(2) + ' LOAD] Requête de chargement reçue [' + times + 'x]');
})
app.get('/home', function (req, res) {
    res.sendFile('home.html', { root: './webpage/' });
})
app.get('/panel', function (req, res) {
    res.sendFile('panel.html', { root: './webpage/' });
})
app.get('/about', function (req, res) {
    res.sendFile('about.html', { root: './webpage/' });
})
app.get('/product', function (req, res) {
    var html = stock.buildHtml(req.query.id);
    res.end(html);
})

app.post('/posts', function (req, res, next) {
    console.log(req.body)
    fs.readFile('data.json', 'utf8', function readFileCallback(err, data) {
        let obj = JSON.parse(data);
        let num = Number(req.body.quantity);
        if (num == 0) {
            num = 1;
        }
        req.body.quantity = num;
        if (!req.body.date.includes('/')) {
            let day = req.body.date.slice(0, 2);
            let month = req.body.date.slice(2, 4);
            let year = req.body.date.slice(-4);
            req.body.date = day + '/' + month + '/' + year;
        }
        let datee = req.body.date.split('/');
        req.body.date = stock.date(datee);
        let index;
        if (req.body.command == 'add') {
            (async () => {
                delete req.body["command"];
                for (let dat of obj) {
                    if (dat.barcode == req.body.barcode && dat.date == req.body.date) {
                        index = obj.indexOf(dat);
                    }
                }
                if (index != null) {
                    obj[index].quantity += num;
                } else {
                    let address = `https://fr.openfoodfacts.org/api/v0/product/${req.body.barcode}.json`;
                    stock.downloading(address, req.body.barcode);
                    await axios.get(address)
                        .then(res => {
                            req.body["nom"] = res.data.product.product_name_fr;
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                    obj.push(req.body);
                }
                json = JSON.stringify(obj);
                fs.writeFile("data.json", json, (err) => {
                    if (err) console.log(err);
                });
                stock.ordonner();
                console.log("\x1b[36m", "[" + process.uptime().toFixed(2) + ' SAVE] Sauvegarde de ' + num + ' éléments dans data.json');
            })();
        } else if (req.body.command == 'del') {
            delete req.body["command"];
            stock.delet(req.body.barcode, num, req.body.date);
        }
    });
});

app.listen(8080, () => {
    console.log("\x1b[1m", 'Stock-Manager v2.7.10: [Serveur en écoute sur le port 8080]')
})

require('./startup.js');