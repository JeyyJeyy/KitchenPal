var bodyParser = require('body-parser');
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const app = express();
let times = 0;

console.clear();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('webpage'));
app.use(express.static('webpage/icons/'));

app.get('/', function (req, res) {
    res.redirect('/home.html');
})
app.get('/data.json', function (req, res) {
    res.sendFile('data.json', { root: '.' });
    console.log("\x1b[32m", "[" + process.uptime().toFixed(2) + ' LOAD] Webpage has been loaded [' + times + ' times]');
    times++
})
app.get('/product.html', function (req, res) {
    var html = buildHtml(req.query.id, req.query.date);
    res.end(html);
})

app.post('/posts', function (req, res, next) {
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
        req.body.date = date(datee);
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
                    obj[index].quantity = obj[index].quantity + num;
                } else {
                    await axios.get(`https://fr.openfoodfacts.org/api/v0/product/${req.body.barcode}.json`)
                        .then(res => {
                            let name = res.data.product.product_name_fr;
                            let url = res.data.product.selected_images.front.display.fr;
                            req.body["nom"] = name;
                            req.body["lien"] = url;
                            console.log(req.body);
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                    console.log(req.body)
                    obj.push(req.body);
                }
                json = JSON.stringify(obj);
                fs.writeFile("data.json", json, (err) => {
                    if (err) console.log(err);
                });
                console.log("\x1b[36m", "[" + process.uptime().toFixed(2) + ' SAVE] Saved ' + num + ' elements to data.json');
            })();
        } else if (req.body.command == 'del') {
            delete req.body["command"];
            delet(req.body.barcode, num, req.body.date);
        }
    });
});

function delet(bar, num, date) {
    fs.readFile('data.json', 'utf8', function readFileCallback(err, data) {
        let das = JSON.parse(data);
        let index;
        let x = 0;
        let y;
        das.forEach(function (value) {
            if (value.barcode == bar && value.date == date) {
                index = das.indexOf(value);
                if (x == 0 && index != null) {
                    if (num >= das[index].quantity) {
                        y = das[index].quantity;
                        das.splice(index, 1);
                    } else {
                        das[index].quantity = das[index].quantity - num;
                        y = num;
                    }
                    x++
                }
            }
        })
        json = JSON.stringify(das);
        fs.writeFile("data.json", json, (err) => {
            if (err) console.log(err);
        });
        console.log("\x1b[31m", "[" + process.uptime().toFixed(2) + " DEL] Deleted " + y + " elements of data.json");
    });
}

app.listen(8080, 'localhost', () => {
    console.log("\x1b[1m", 'Stock-Manager v1.4.14: [Serveur allumé sur le port 8080]')
})

function date(date) {
    if (!date[2]) {
        date[2] = date[1];
        date[1] = date[0];
        date[0] = '30';
    }
    if (date[0].length == 1) {
        date[0] = '0' + date[0];
    }
    if (date[1].length == 1) {
        date[1] = '0' + date[1];
    }
    if (date[2].length == 2) {
        date[2] = '20' + date[2];
    }
    return date[0] + '/' + date[1] + '/' + date[2];
}

function buildHtml(id, dat) {
    let data = fs.readFileSync('data.json', 'utf8');
    let das = JSON.parse(data);
    let date2 = dat.slice(0, 2) + '/' + dat.slice(2, 4) + '/' + dat.slice(4, 8);
    let index;
    let file = '<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="stylesheet" href="styles.css"><link rel="icon" href="icon.ico" /><title>Stock-Manager</title></head>' +
    '<body><br><label><input name="mode" type="checkbox" style="width: 20px; height: 20px;" onclick="darkmode()">  Dark mode</label><br><center><a href="/home.html"><img width="100" height="100" src="icon.ico"></a><h1>Stock Manager v1.4.14</h1></center><br>';
    let x = 0;
    das.forEach(function (value) {
        if (value.barcode == id && value.date == date2) {
            index = das.indexOf(value);
            if (x == 0 && index != null) {
                x++
                let time = das[index].date.split('/');
                const date1 = Date.parse(time[1] + ' ' + time[0] + ' ' + time[2])
                const date2 = Date.now();
                const diffTime = Math.abs(date2 - date1);
                let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays == 0 || diffDays == 1) {
                    diffDays = 'aujourd\'hui';
                    url = 'equal.png';
                } else if (date1 <= date2) {
                    diffDays = 'depuis ' + diffDays + ' jours';
                    url = 'no.png';
                } else {
                    diffDays = 'dans ' + diffDays + ' jours';
                    url = 'ok.png';
                }
                file += '<center><div style="overflow-x:auto;"><table>' +
                    '<thead>' +
                    '<tr>' +
                    '<th>Consommable</th>' +
                    '<th>Image</th>' +
                    '<th>Nom du produit</th>' +
                    '<th>Date limite</th>' +
                    '<th>Quantité</th>' +
                    '<th>Commande</th>' +
                    '</tr>' +
                    '<tr>' +
                    '<td><img src=' + url + '></td>' +
                    '<td style="font-size: 12px;"> <img style="border-radius: 15px; height: 150px; width: 150px; object-fit: contain;" src=' + das[index].lien + '> <br> ' + das[index].barcode + ' </td>' +
                    '<td style="font-size: 16px;">' + das[index].nom + '</td>' +
                    '<td style="font-size: 16px;">' + das[index].date + '<br>' + diffDays + '</td>' +
                    '<td style="font-size: 16px;">' + das[index].quantity + '</td>' +
                    '<td><button style="width: 90px; height: 30px; color:#555555; font-size: 16px; border-radius: 5px; border: 1px solid" onclick="added(' + id + ',' + dat + ')"><b>Ajouter</b></button><br><br><button style="width: 90px; height: 30px; color:#555555; font-size: 16px; border-radius: 5px; border: 1px solid" onclick="delet(' + id + ',' + dat + ')"><b>Supprimer</b></button><br><br><button style="width: 90px; height: 30px; color:#555555; font-size: 16px; border-radius: 5px; border: 1px solid" onclick="gohome()"><b>Retour</b></button></td>' +
                    '</tr>' +
                    '</thead>' +
                    '<tbody id="data-output">' +
                    '</tbody>' +
                    '</table></div></center>' +
                    '<script src="app.js"></script>' +
                    '</body>' +
                    '</html>';
            }
        }
    })
    if (index == null) {
        file += '<center><h2>Produit inconnu</h2>';
    }
    return file;
};