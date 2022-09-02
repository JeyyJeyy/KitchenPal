var bodyParser = require('body-parser');
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const https = require('https');
var Stream = require('stream').Transform;

const app = express();
let times = 0;

console.clear();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('webpage'));
app.use(express.static('webpage/icons/'));
app.use(express.static('assets'));

fs.readFile('data.json', 'utf8', function readFileCallback(err, data) {
    let das = JSON.parse(data);
    das.forEach(function (value) {
        let address = `https://fr.openfoodfacts.org/api/v0/product/${value.barcode}.json`;
        downloading(address, value.barcode);
        console.log(value.barcode + ' fichiers téléchargés')
    })
});

app.get('/', function (req, res) {
    res.redirect('/home');
})
app.get('/data.json', function (req, res) {
    res.sendFile('data.json', { root: '.' });
    times++
    console.log("\x1b[32m", "[" + process.uptime().toFixed(2) + ' LOAD] Webpage has been loaded [' + times + ' times]');
})
app.get('/home', function (req, res) {
    res.sendFile('home.html', { root: './webpage/' });
})
app.get('/product', function (req, res) {
    (async () => {
        var html = await buildHtml(req.query.id);
        res.end(html);
    })();
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
                    obj[index].quantity += num;
                } else {
                    let address = `https://fr.openfoodfacts.org/api/v0/product/${req.body.barcode}.json`;
                    downloading(address, req.body.barcode);
                    await axios.get(address)
                        .then(res => {
                            let name = res.data.product.product_name_fr;
                            req.body["nom"] = name;
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
                ordonner();
                console.log("\x1b[36m", "[" + process.uptime().toFixed(2) + ' SAVE] Saved ' + num + ' elements to data.json');
            })();
        } else if (req.body.command == 'del') {
            delete req.body["command"];
            delet(req.body.barcode, num, req.body.date);
        }
    });
});

app.listen(8080, '10.0.0.160', () => {
    console.log("\x1b[1m", 'Stock-Manager v2.0.0: [Server enabled on port 8080]')
})



function delet(bar, num, date) {
    fs.readFile('data.json', 'utf8', function readFileCallback(err, data) {
        let das = JSON.parse(data);
        let index;
        das.forEach(function (value) {
            if (value.barcode == bar && value.date == date) {
                index = das.indexOf(value);
            }
        })
        if (index != null) {
            if (num >= das[index].quantity) {
                das.splice(index, 1);
            } else {
                das[index].quantity -= num;
            }
        }
        json = JSON.stringify(das);
        fs.writeFile("data.json", json, (err) => {
            if (err) console.log(err);
        });
        console.log("\x1b[31m", "[" + process.uptime().toFixed(2) + " DEL] Deleted " + num + " elements of data.json");
    });
}

function downloading(file, bar) {
    let body = "";
    let obj;
    https.get(file, (res) => {
        res.on("data", (chunk) => {
            body += chunk;
        });
        res.on("end", () => {
            try {
                obj = JSON.parse(body);
                obj["yuka-score"] = yuka(obj.product);
                body = JSON.stringify(obj);
                fs.writeFile(`./products/${bar}.json`, body, (err) => {
                    if (err) console.log(err);
                });
                if (!fs.existsSync(`./assets/${bar}.jpg`)) {
                    let img = obj.product.selected_images.front.display.fr;
                    https.get(img, (res) => {
                        var data = new Stream();
                        res.on('data', function (chunk) {
                            data.push(chunk);
                        });
                        res.on('end', function () {
                            fs.writeFileSync(`./assets/${bar}.jpg`, data.read());
                        });
                    })
                    console.log("\x1b[36m", "[" + process.uptime().toFixed(2) + ' SAVE] Saved product asset');
                }
            } catch (err) {
                console.log(err);
            };
        });
    })
}

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

function buildHtml(id) {
    let data = fs.readFileSync('data.json', 'utf8');
    let das = JSON.parse(data);
    let index, dat;
    let file = '<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="stylesheet" href="styles.css"><link rel="icon" href="icon.ico" /><title>Stock-Manager</title></head>' +
        '<body><br><label><input name="mode" type="checkbox" style="width: 20px; height: 20px;" onclick="darkmode()">  Dark mode</label><br><center><a href="/home.html"><img width="100" height="100" src="icon.ico"></a><h1>Stock Manager v2.0.0</h1></center><br>';
    das.forEach(function (value) {
        if (value.barcode == id) {
            index = das.indexOf(value);
            dat = das[index].date;
        }
    })
    if (index != null) {
        let produit = fs.readFileSync(`./products/${id}.json`);
        let produit2 = JSON.parse(produit);
        console.log(produit2)
        let prod = produit2.product;
        let ing_text = prod.ingredients_text_fr;
        let time = das[index].date.split('/');
        const date1 = new Date(time[2], time[1] - 1, time[0]);
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
        ing_text = ing_text.replace(/_/gi, '');
        if (!ing_text) {
            ing_text = "Aucun ingrédient dans la base de donnée pour ce produit.";
            prod.additives_n = "0";
        }
        if (!prod.nova_groups) {
            prod.nova_groups = "unknown";
        }
        let scoreurl;
        if (produit2["yuka-score"] <= 25) {
            scoreurl = "bordred.png";
        } else if (produit2["yuka-score"] <= 50) {
            scoreurl = "bordor.png";
        } else if (produit2["yuka-score"] <= 75) {
            scoreurl = "bordgr.png";
        } else {
            scoreurl = "bordgr2.png";
        }
        if (!prod.nutriscore_grade) {
            prod.nutriscore_grade = "unknown";
        }
        file += '<center style="overflow-x:auto;"><table>' +
            '<thead><tr><th>Consommable</th><th>Image</th><th>Nom du produit</th>' +
            '<th>Date limite</th><th>Quantité</th><th>Commande</th></tr><tr>' +
            '<td><img src=' + url + '></td>' +
            '<td style="font-size: 12px;"> <img style="border-radius: 15px; height: 150px; width: 150px; object-fit: contain;" src="' + das[index].barcode + '.jpg" onerror="this.onerror=null; this.src=`no-product.png`"> <br> ' + das[index].barcode + ' </td>' +
            '<td>' + das[index].nom + '</td>' +
            '<td>' + das[index].date + '<br>' + diffDays + '</td>' +
            '<td>' + das[index].quantity + '</td>' +
            '<td><button onclick="added(' + id + ',' + dat + ')"><b>Ajouter</b></button><br><br><button onclick="delet(' + id + ',' + dat + ')"><b>Supprimer</b></button><br><br><button onclick="gohome()"><b>Retour</b></button></td>' +
            '</tr></thead><tbody id="data-output"></tbody></table></center><br>' +
            '<center style="overflow-x:auto;"><div name="outer" class="centered"><label style="display: block; margin: auto;"><h4 align="left">Scores du produit: </h4></label><div class="middle"><div class="inner" style="border: none;"><img style="width:200px;" src="' + scoreurl + '"><br><b>Score</b><br>Note personnelle</div><div class="inner" style="border: none;"><img style="width:200px;" src="nutriscore-' + prod.nutriscore_grade + '.svg"><br><b>Nutri-score</b><br>Qualité nutritionnelle</div><div class="inner" style="border: none;"><img style="width:200px;margin:auto" src="ecoscore-' + prod.ecoscore_grade + '.svg"><br><b>Eco-score</b><br>Impact environnemental</div><div class="inner" style="border: none;"><img src="nova-group-' + prod.nova_groups + '.svg"><br><b>Nova-score</b><br>Degré de transformation des aliments</div></div></center>' +
            '</div><br><center style="overflow-x:auto;"><div name="product" class="centered"><label style="display: block; margin: auto;" align="left"><h4 style="display: inline" align="left">Ingrédients du produit: </h4>(' + prod.additives_n + ' additifs)</label><p align="left">' + ing_text + '</p>' +
            '</div></center><br><br><center><p style="margin: 10px">Made with <span style="color: #FF0000;">&hearts;</span> by JeyyJeyy</p></center><script src="app.js"></script></body></html>';
    } else {
        file += '<center><h2>Produit inconnu</h2><br><button onclick="gohome()"><b>Retour</b></button></center><center style="position: fixed;bottom: 0;right: 0;left: 0"><p style="margin: 10px">Made with <span style="color: #FF0000;">&hearts;</span> by JeyyJeyy</p></center><script src="app.js"></script></body></html>';
    }
    return file;
};

function ordonner() {
    fs.readFile('data.json', 'utf8', function readFileCallback(err, data) {
        let obj = JSON.parse(data);
        obj.sort(function (a, b) {
            let date1 = a.date.split('/');
            let date2 = b.date.split('/');
            let d1 = new Date(date1[2], date1[1] - 1, date1[0]);
            let d2 = new Date(date2[2], date2[1] - 1, date2[0]);
            if (d1 > d2) return 1;
            if (d1 < d2) return -1;
            return 0;
        });
        console.log(obj);
        json = JSON.stringify(obj);
        fs.writeFile("data.json", json, (err) => {
            if (err) console.log(err);
        });
    });
}

function yuka(prod) {
    let score;
    let neg = 0;
    let nutri = prod.nutriscore_score;
    if (nutri) {
        if (prod.nutriscore_data.is_beverage == 1) {
            if (nutri <= 1) {
                switch (nutri) {
                    case -4:
                        score = 80
                    case -3:
                        score = 77
                    case -2:
                        score = 74
                    case -1:
                        score = 71
                    case 0:
                        score = 68
                    case 1:
                        score = 65
                }
                score *= 0.6;
            } else if (nutri <= 5) {
                neg = 8 * (nutri - 2);
                score = (57 - neg) * 0.6;
            } else if (nutri <= 9) {
                neg = 4 * (nutri - 6);
                score = (15 - neg) * 0.6;
            } else {
                score = 0;
            }
        } else if (prod._keywords.includes('proteine') || prod._keywords.includes('additif') || prod._keywords.includes('animaux') || prod._keywords.includes('substitut') || prod._keywords.includes('complement')) {
            return "?";
        } else {
            if (nutri <= -1) {
                if (nutri == -1) {
                    score = 90 * 0.6;
                } else {
                    score = 100 * 0.6;
                }
            } else if (nutri <= 11) {
                neg = 5 * nutri;
                score = (80 - neg) * 0.6;
            } else if (nutri >= 19) {
                score = 0;
            } else {
                neg = 2 * (nutri - 11);
                score = (15 - neg) * 0.6;
            }
        }
    } else {
        return "?";
    }
    if (prod.nova_group && prod.nova_group >= 2) {
        score += 10;
    }
    if (prod.additives_n) {
        if (prod.additives_n >= 5) {
            score += 0;
        } else {
            score += 6 * (5 - prod.additives_n);
        }
    }
    return Math.round(score);
}