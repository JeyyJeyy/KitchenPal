var bodyParser = require('body-parser');
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const app = express();


console.clear();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.sendFile('index.html', { root: './webpage/' });
    console.log("\x1b[32m", "[" + process.uptime().toFixed(2) + ' LOAD] Webpage has been loaded');
});
app.get("/app.js", (req, res) => {
    res.sendFile('app.js', { root: './webpage/' });
    console.log("\x1b[32m", "[" + process.uptime().toFixed(2) + ' LOAD] App.JS has been loaded');
});
app.get("/api.json", (req, res) => {
    res.sendFile('api.json', { root: './' });
    console.log("\x1b[32m", "[" + process.uptime().toFixed(2) + ' LOAD] Api.JSON has been loaded');
});
app.get("/styles.css", (req, res) => {
    res.sendFile('styles.css', { root: './webpage/' });
    console.log("\x1b[32m", "[" + process.uptime().toFixed(2) + ' LOAD] Styles.CSS has been loaded');
});
app.post('/posts', function (req, res, next) {
    fs.readFile('data.json', 'utf8', function readFileCallback(err, data) {
        let obj = JSON.parse(data);
        let num = Number(req.body.quantity);
        if (num == 0) {
            num = 1;
        }
        req.body.quantity = num;
        let datee = req.body.date.split('/');
        req.body.date = date(datee);
        if (req.body.command == 'add') {
            obj.push(req.body);
            apicall(req.body.barcode, num, req.body.date);
            json = JSON.stringify(obj);
            fs.writeFile("data.json", json, (err) => {
                if (err) console.log(err);
            });
            console.log("\x1b[36m", "[" + process.uptime().toFixed(2) + ' SAVE] Saved element to data.json');
            console.log("\x1b[36m", "[" + process.uptime().toFixed(2) + ' SAVE] Saved element to api.json');
        } else if (req.body.command == 'del') {
            delet(req.body.barcode, num);
        }
    });
});

function apicall(bar, num, date) {
    axios.get(`https://fr.openfoodfacts.org/api/v0/product/${bar}.json`)
        .then(res => {
            let name = res.data.product.product_name_fr;
            let url = res.data.product.selected_images.front.display.fr;
            fs.readFile('api.json', 'utf8', function readFileCallback(err, data) {
                let das = JSON.parse(data);
                das.push({ nom: name, lien: url, barcode: bar, quantity: num, date: date });
                json = JSON.stringify(das);
                fs.writeFile("api.json", json, (err) => {
                    if (err) console.log(err);
                });
            });
        })
        .catch(function (error) {
            console.log(error);
        });
}

function delet(bar, num) {
    fs.readFile('data.json', 'utf8', function readFileCallback(err, data) {
        let das = JSON.parse(data);
        let index;
        for (var i = 0; i < num; i++) {
            das.forEach(function (value) {
                if (value.barcode == bar) {
                    index = das.indexOf(value);
                }
            })
            das[index].quantity = das[index].quantity - 1;
        }
        json = JSON.stringify(das);
        fs.writeFile("data.json", json, (err) => {
            if (err) console.log(err);
        });
        console.log("\x1b[31m", "[" + process.uptime().toFixed(2) + " DEL] Deleted " + num + " elements of data.json");
        console.log("\x1b[31m", "[" + process.uptime().toFixed(2) + " DEL] Deleted " + num + " elements of api.json");
    });
    fs.readFile('api.json', 'utf8', function readFileCallback(err, data) {
        let das = JSON.parse(data);
        let index;
        for (var i = 0; i < num; i++) {
            das.forEach(function (value) {
                if (value.barcode == bar) {
                    index = das.indexOf(value);
                }
            })
            das[index].quantity = das[index].quantity - 1;
        }
        json = JSON.stringify(das);
        fs.writeFile("api.json", json, (err) => {
            if (err) console.log(err);
        });
    });
}

app.listen(8080, '192.168.1.249');
console.log("\x1b[1m", 'Stock-Manager: [Serveur allumé sur le port 8080]')

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