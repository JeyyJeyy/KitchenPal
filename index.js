var bodyParser = require('body-parser');
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const app = express();

// Parses the body for POST, PUT, DELETE, etc.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.post('/posts', function (req, res, next) {
    fs.readFile('data.json', 'utf8', function readFileCallback(err, data) {
        let obj = [];
        obj = JSON.parse(data); //now it an object
        if (req.body.command == 'add') {
            obj.push(req.body);
            apicall(req.body.barcode);
            json = JSON.stringify(obj); //convert it back to json
            fs.writeFile("data.json", json, (err) => {
                if (err) console.log(err);
                console.log("Saved data to data.json");
            });
        } else if (req.body.command == 'del') {
            let id =
            delet(req.body.barcode);
        }
    });
});

function apicall(bar) {
    axios.get(`https://fr.openfoodfacts.org/api/v0/product/${bar}.json`)
        .then(res => {
            let name = res.data.product.product_name;
            let url = res.data.product.selected_images.front.display.fr;
            fs.readFile('api.json', 'utf8', function readFileCallback(err, data) {
                let das = [];
                das = JSON.parse(data); //now it an object
                das.push({ nom: name, lien: url });
                json = JSON.stringify(das); //convert it back to json
                fs.writeFile("api.json", json, (err) => {
                    if (err) console.log(err);
                    console.log("Saved data to api.json");
                });
            });
        })
        .catch(function (error) {
            console.log(error);
        });
}

function delet(bar) {
    axios.get(`https://fr.openfoodfacts.org/api/v0/product/${bar}.json`)
        .then(res => {
            let name = res.data.product.product_name;
            let url = res.data.product.selected_images.front.display.fr;
            fs.readFile('api.json', 'utf8', function readFileCallback(err, data) {
                let das = [];
                das = JSON.parse(data); //now it an object
                das.push({ nom: name, lien: url });
                json = JSON.stringify(das); //convert it back to json
                fs.writeFile("api.json", json, (err) => {
                    if (err) console.log(err);
                    console.log("Saved data to api.json");
                });
            });
        })
        .catch(function (error) {
            console.log(error);
        });
}

app.listen(8080, '192.168.1.249');
console.log('Serveur allumé sur le port 8080')