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
app.get("/icon.ico", (req, res) => {
    res.sendFile('icon.ico', { root: './webpage/icons/' });
    console.log("\x1b[32m", "[" + process.uptime().toFixed(2) + ' LOAD] Icon.ICO has been loaded');
});
app.get("/ok.png", (req, res) => {
    res.sendFile('ok.png', { root: './webpage/icons/' });
    console.log("\x1b[32m", "[" + process.uptime().toFixed(2) + ' LOAD] Icon.ICO has been loaded');
});
app.get("/no.png", (req, res) => {
    res.sendFile('no.png', { root: './webpage/icons/' });
    console.log("\x1b[32m", "[" + process.uptime().toFixed(2) + ' LOAD] Icon.ICO has been loaded');
});
app.get("/equal.png", (req, res) => {
    res.sendFile('equal.png', { root: './webpage/icons/' });
    console.log("\x1b[32m", "[" + process.uptime().toFixed(2) + ' LOAD] Icon.ICO has been loaded');
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
            for (let dat of obj) {
                if (dat.barcode == req.body.barcode && dat.date == req.body.date) {
                    index = obj.indexOf(dat);
                }
            }
            if (index != null) {
                obj[index].quantity = obj[index].quantity + num;
            } else {
                obj.push(req.body);
            }
            apicall(req.body.barcode, num, req.body.date);
            json = JSON.stringify(obj);
            fs.writeFile("data.json", json, (err) => {
                if (err) console.log(err);
            });
            console.log("\x1b[36m", "[" + process.uptime().toFixed(2) + ' SAVE] Saved ' + num + ' elements to data.json');
            console.log("\x1b[36m", "[" + process.uptime().toFixed(2) + ' SAVE] Saved ' + num + ' elements to api.json');
        } else if (req.body.command == 'del') {
            delet(req.body.barcode, num, req.body.date);
        }
    });
});

function apicall(bar, num, date) {
    axios.get(`https://fr.openfoodfacts.org/api/v0/product/${bar}.json`)
        .then(res => {
            let index;
            let name = res.data.product.product_name_fr;
            let url = res.data.product.selected_images.front.display.fr;
            fs.readFile('api.json', 'utf8', function readFileCallback(err, data) {
                let das = JSON.parse(data);
                for (let dat of das) {
                    if (dat.barcode == bar && dat.date == date) {
                        index = das.indexOf(dat);
                    }
                }
                if (index != null) {
                    das[index].quantity = das[index].quantity + num;
                } else {
                    das.push({ nom: name, lien: url, barcode: bar, quantity: num, date: date });
                }
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
        console.log("\x1b[31m", "[" + process.uptime().toFixed(2) + " DEL] Deleted " + y + " elements of api.json");
    });
    fs.readFile('api.json', 'utf8', function readFileCallback(err, data) {
        let das = JSON.parse(data);
        let index;
        let x = 0;
        das.forEach(function (value) {
            if (value.barcode == bar && value.date == date) {
                index = das.indexOf(value);
                if (x == 0 && index != null) {
                    if (num >= das[index].quantity) {
                        das.splice(index, 1);
                    } else {
                        das[index].quantity = das[index].quantity - num;
                    }
                    x++
                }
            }
        })
        json = JSON.stringify(das);
        fs.writeFile("api.json", json, (err) => {
            if (err) console.log(err);
        });
    });
}

app.listen(8080, '192.168.1.249');
console.log("\x1b[1m", 'Stock-Manager v1.2.0: [Serveur allumé sur le port 8080]')

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