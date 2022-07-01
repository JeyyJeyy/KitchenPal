var bodyParser = require('body-parser');
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.post('/posts', function (req, res, next) {
    fs.readFile('data.json', 'utf8', function readFileCallback(err, data) {
        let obj = JSON.parse(data);
        let num = Number(req.body.quantity);
        if(num == 0){
            num = 1;
        }
        if (req.body.command == 'add') {
            delete req.body['quantity'];
            for (var i = 0; i < num; i++) {
                obj.push(req.body);
                apicall(req.body.barcode);
            }
            apicall(req.body.barcode, num);
            json = JSON.stringify(obj);
            fs.writeFile("data.json", json, (err) => {
                if (err) console.log(err);
            });
            console.log("Saved "+num+" elements to data.json");
        } else if (req.body.command == 'del') {
            delet(req.body.barcode, num);
        }
    });
});

function apicall(bar, num) {
    axios.get(`https://fr.openfoodfacts.org/api/v0/product/${bar}.json`)
        .then(res => {
            let name = res.data.product.product_name;
            let url = res.data.product.selected_images.front.display.fr;
            fs.readFile('api.json', 'utf8', function readFileCallback(err, data) {
                let das = JSON.parse(data);
                for (var i = 0; i < num; i++) {
                    das.push({ nom: name, lien: url, barcode: bar });
                }
                json = JSON.stringify(das);
                fs.writeFile("api.json", json, (err) => {
                    if (err) console.log(err);
                });
                console.log("Saved "+num+" elements to api.json");
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
            das.splice(index, 1);
        }
        json = JSON.stringify(das);
        fs.writeFile("data.json", json, (err) => {
            if (err) console.log(err);
        });
        console.log("Deleted "+num+" elements of data.json");
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
            das.splice(index, 1);
        }
        json = JSON.stringify(das);
        fs.writeFile("api.json", json, (err) => {
            if (err) console.log(err);
        });
        console.log("Deleted "+num+" elements of api.json");
    });
}

app.listen(8080, '192.168.1.249');
console.log('Serveur allumé sur le port 8080')