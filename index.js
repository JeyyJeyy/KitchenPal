var bodyParser = require('body-parser');
const express = require('express');
const axios = require('axios');
const col = require('chalk');
const fs = require('fs');
const https = require('https');
var Stream = require('stream').Transform;
const figlet = require('figlet');
const gradient = require('gradient-string');
const app = express();
app.listen(8080,"127.0.0.1");
//ramener page d'accueil si delete qd quantité = 1 => le serveur envoit pas la quantité restante car att pas la variable

console.clear();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('webpage'));
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
            console.log(err)
            console.log(col.red('Erreur au lancement...'));
            return;
        }
        console.log(gradient('white', 'cyan')(data) + col.cyan('\n\tStockManager v3.1.16 - Gérer ses stocks @JeyyJeyy\n'));
    });
})();

fs.readFile('data.json', 'utf8', function readFileCallback(err, data) {
    let das = JSON.parse(data);
    let i = 0;
    let bars = [];
    das.forEach(function (value) {
        let address = `https://fr.openfoodfacts.org/api/v0/product/${value.barcode}.json`;
        downloading(address, value.barcode);
        bars.push(value.barcode);
        i++
    })
    console.log("\x1b[32m", '[!] ' + i + ' produits rechargés')
    fs.readdir("./assets/", function (err, files) {
        files.forEach(function (file, index) {
            let f = file.slice(0, -5);
            if(!bars.includes(f.slice(0, -5)) && f != "additives" && file.endsWith('json')){
                fs.unlinkSync('./assets/'+file);
                fs.unlinkSync('./assets/'+f+'.jpg');
            }
        })
    })
});

app.get('/', function (req, res) {
    res.redirect('/home.html');
})
app.get('/data.json', function (req, res) {
    res.sendFile('data.json', { root: '.' });
    console.log("\x1b[32m", "[" + process.uptime().toFixed(2) + ' LOAD] Requête de chargement reçue');
})
app.get('/product', function (req, res) {
    var html = buildHtml(req.query.id);
    res.end(html);
})

app.post('/posts', function (req, res, next) {
    fs.readFile('data.json', 'utf8', function readFileCallback(err, data) {
        let obj = JSON.parse(data);
        let num = parseInt(req.body.quantity);
        let index;
        if (req.body.command == 'add') {
            (async () => {
                for (let dat of obj) {
                    if (dat.barcode == req.body.barcode) {
                        index = obj.indexOf(dat);
                    }
                }
                if (index != null) {
                    obj[index].quantity += num;
                    obj[index].date= obj[index].date.concat(req.body.date);
                    obj[index].date.sort(function (a, b) {
                        let date1 = a.split('/');
                        let date2 = b.split('/');
                        let d1 = new Date(date1[2], date1[1] - 1, date1[0]);
                        let d2 = new Date(date2[2], date2[1] - 1, date2[0]);
                        if (d1 > d2) return 1;
                        if (d1 < d2) return -1;
                        return 0;
                    });
                } else {
                    req.body.quantity = num;
                    let address = `https://fr.openfoodfacts.org/api/v0/product/${req.body.barcode}.json`;
                    downloading(address, req.body.barcode);
                    await axios.get(address)
                        .then(res => {
                            req.body["nom"] = res.data.product.product_name_fr + " - " + res.data.product.quantity;
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                    obj.push(req.body);
                }
                json = JSON.stringify(obj);
                fs.writeFileSync("data.json", json);
                ordonner();
                console.log("\x1b[36m", "[" + process.uptime().toFixed(2) + ' SAVE] Sauvegarde de ' + num + ' éléments dans data.json');
                res.send('done');
            })();
        } else if (req.body.command == 'del') {
            res.send(delet(req.body.barcode, num, req.body.date));
        }
    });
});

function delet(bar, num, date) {
    fs.readFile('data.json', 'utf8', function readFileCallback(err, data) {
        let das = JSON.parse(data);
        let index, finalvalue;
        das.forEach(function (value) {
            if (value.barcode == bar) {
                index = das.indexOf(value);
            }
        })
        finalvalue = das[index].quantity - num;
        if (index != null) {
            if (num >= das[index].quantity) {
                das.splice(index, 1);
            } else {
                das[index].quantity -= num;
                date.forEach(function (value) {
                    das[index].date.splice(das[index].date.indexOf(value),1);
                })
            }
        }
        json = JSON.stringify(das);
        fs.writeFile("data.json", json, (err) => {
            if (err) console.log(err);
        });
        console.log("\x1b[31m", "[" + process.uptime().toFixed(2) + " DEL] Deleted " + num + " elements of data.json");
        return finalvalue;
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
                fs.writeFile(`./assets/${bar}.json`, body, (err) => {
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
                }
            } catch (err) {
                console.log(err);
            };
        });
    })
}

function buildHtml(num) {
    let data = fs.readFileSync('data.json', 'utf8');
    let das = JSON.parse(data);
    let id, dat;
    let file = `<!DOCTYPE html>
    <html lang="fr">
    
    <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <link rel="stylesheet" href="styles.css">
       <link rel="icon" href="icons/icon.ico" />
       <title>StockManager</title>
    </head>
    
    <body class="fadein">
       <div
          style="display: flex; align-items: center; border: none; margin-top: 50px; width: auto;justify-content: center;">
          <a href="/home.html"><img src="icons/icon.ico" style="margin-right: 10px;height: 50pt;width: 50pt;"></a>
          <a href="/home.html"></a>
          <h1 style="font-size: 50pt;">StockManager</h1></a>
       </div>
       <div id="except" style="display: inline; position: absolute; right: 10px; top: 10px; border: none; width: auto;">
          <button style="width:auto;" onclick="window.location.href='/home.html';"><span style="padding:20px"><i
                   style="margin:3px" class="fa-solid fa-house"></i> Accueil </span></button>&nbsp;
          <button style="width:auto;" onclick="window.location.href='/panel.html';"><span style="padding:20px"><i
                   style="margin:3px" class="fa-solid fa-gear"></i> Ajouter un produit </span></button>&nbsp;
          <button style="width:auto;" onclick="darkmode()"><span style="padding:10px"><i
                   class="fa-solid fa-circle-half-stroke"></i></span></button>
       </div>`;
    try {
        dat = das[num].date[0];
        id = das[num].barcode;
    } catch {
        file += '<center><h2>Produit inconnu</h2><br><button onclick="window.location.href=`/home.html`;"><b><i class="fa-solid fa-rotate-left"></i>   Retour</b></button></center><center style="position: fixed;bottom: 0;right: 0;left: 0"><p style="margin: 10px">Made with <span style="color: #FF0000;">&hearts;</span> by JeyyJeyy</p></center><script src="48b85ccf71.js" crossorigin="anonymous"></script><script src="app.js"></script></body></html>';
        return file;
    }
    if (id != null) {
        let produit = fs.readFileSync(`./assets/${id}.json`);
        let produit2 = JSON.parse(produit);
        let prod = produit2.product;
        let ing_text = prod.ingredients_text_fr;
        let time = das[num].date[0].split('/');
        const date1 = new Date(time[2], time[1] - 1, time[0], 12, 0, 0);
        const date2 = Date.now();
        const diffTime = Math.abs(date2 - date1);
        let diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays == 0) {
            diffDays = 'aujourd\'hui';
            url = 'equal.png';
        } else if (date1 <= date2) {
            diffDays = 'depuis ' + diffDays + ' jours';
            url = 'no.png';
        } else {
            diffDays = 'dans ' + diffDays + ' jours';
            url = 'ok.png';
        }
        ing_text = ing_text.replace(/_/gi, '').replace(/¹/gi, '');
        if (!ing_text) {
            ing_text = "Aucun ingrédient dans la base de donnée pour ce produit.";
            prod.additives_n = "0";
        }
        if (!prod.nova_groups) {
            prod.nova_groups = "unknown";
        }
        let scoreurl;
        if (produit2["yuka-score"] <= 20) {
            scoreurl = "#C93A20";
        } else if (produit2["yuka-score"] <= 40) {
            scoreurl = "#DC8131";
        } else if (produit2["yuka-score"] <= 60) {
            scoreurl = "#EAC026";
        } else if (produit2["yuka-score"] <= 80) {
            scoreurl = "#46C47B";
        } else if (produit2["yuka-score"] == "?") {
            scoreurl = "#B3B3B3";
        } else {
            scoreurl = "#2F8955";
        }
        if (!prod.nutriscore_grade) {
            prod.nutriscore_grade = "unknown";
        } //ajouter list select pour dates avant bouton suppr
        file += '<center style="overflow-x:auto;"><table>' +
            '<thead><tr><th style="width: 10%;">Status</th><th style="width: 20%;">Image</th><th>Nom produit</th>' +
            '<th style="width: 15%;">Péremption</th><th style="width: 10%;">Quantité</th><th style="width: 15%;">Gestion</th></tr><tr>' +
            '<td style="width: 10%;"><img style="width: 75px;" src=icons/' + url + '></td>' +
            '<td style="width: 20%;font-size: 12px;"><img style="border-radius: 15px; height: 150px; width: 150px; object-fit: cover; max-width: 80%; max-height: 80%"" src="' + das[num].barcode + '.jpg" onerror="this.onerror=null; this.src=`icons/no-product.png`"> <br> ' + das[num].barcode + ' </td>' +
            '<td>' + prod.product_name_fr + '</td>' +
            '<td style="width: 15%;">' + das[num].date[0] + '<br>' + diffDays + '</td>' +
            '<td style="width: 10%;">' + das[num].quantity + '</td>' +
            '<td style="width: 15%;"><button onclick="delet(' + id + ',`' + dat + '`,1)"><b><i class="fa-solid fa-circle-minus"></i>   Effacer</b></button><br><br><button onclick="window.location.href=`/home.html`;"><b><i class="fa-solid fa-rotate-left"></i>   Retour</b></button></td>' +
            '</tr></thead><tbody id="data-output"></tbody></table></center><br>' +
            '<center style="overflow-x:auto;"><div id="boxed" name="outer" class="centered"><label style="display: block; margin: auto;"><h4 align="left">Notes du produit : </h4></label><div class="middle"><div class="inner" style="width: 25%;border: none;"><svg width="110" height="110"><circle stroke="white" stroke-width="5" cx="55" cy="55" r="52" fill="' + scoreurl + '" /><text x="50%" y="43%" text-anchor="middle" font-weight="bold" fill="white" font-size="50px" font-family="Arial" dy=".3em">' + produit2["yuka-score"] + '</text><text x="50%" y="75%" text-anchor="middle" font-weight="bold" fill="white" font-size="25px" font-family="Arial" dy=".3em">/100</text></svg><br><b>Stock-Score </b><i style="margin-top:3px" class="fa-solid fa-circle-question" id="tooltip"><span class="tooltiptext" style="font-style: normal;">Note personnelle</span></i></div><div class="inner" style="width: 25%;border: none;"><img style="width:200px;" src="icons/nutriscore-' + prod.nutriscore_grade + '.svg"><br><b>Nutri-score </b><i style="margin-top:3px" class="fa-solid fa-circle-question" id="tooltip"><span class="tooltiptext" style="font-style: normal;">Qualité nutritionnelle</span></i></div><div class="inner" style="width: 25%;border: none;"><img style="width:200px;margin:auto" src="icons/ecoscore-' + prod.ecoscore_grade + '.svg"><br><b>Eco-score </b><i style="margin-top:3px" class="fa-solid fa-circle-question" id="tooltip"><span class="tooltiptext" style="font-style: normal;">Impact environnemental</span></i></div><div class="inner" style="width: 25%;border: none;"><img src="icons/nova-group-' + prod.nova_groups + '.svg"><br><b>Nova-score </b><i style="margin-top:3px" class="fa-solid fa-circle-question" id="tooltip"><span class="tooltiptext" style="font-style: normal;">Degré de transformation des aliments</span></i></div></div></center>' +
            '</div><br><center style="overflow-x:auto;"><div id="boxed" name="product" class="centered"><label style="display: block; margin: auto; margin-bottom:10px" align="left"><h4 align="left">Ingrédients du produit : (' + prod.additives_n + ' additifs)</h4></label><p align="left" style="margin:auto; margin-left:10px; margin-bottom:8px">' + ing_text + '</p>' +
            '</div></center><br><br><center><p style="margin: 10px">Made with <span style="color: #FF0000;">&hearts;</span> by JeyyJeyy</p></center><script src="app.js"></script><script src="48b85ccf71.js" crossorigin="anonymous"></script></body></html>';
    }
    return file;
};

function ordonner() { //solution = sort localement les dates dans chaque items puis prendre date[0] pour sort globalement
    fs.readFile('data.json', 'utf8', function readFileCallback(err, data) {
        let obj = JSON.parse(data);
        obj.sort(function (a, b) {
            let date1 = a.date[0].split('/');
            let date2 = b.date[0].split('/');
            let d1 = new Date(date1[2], date1[1] - 1, date1[0]);
            let d2 = new Date(date2[2], date2[1] - 1, date2[0]);
            if (d1 > d2) return 1;
            if (d1 < d2) return -1;
            return 0;
        });
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
    if (nutri || nutri == 0) {
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
                score = 5;
            }
        } else if (prod._keywords.includes('additif') || prod._keywords.includes('animaux') || prod._keywords.includes('substitut') || prod._keywords.includes('complement')) {
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
                score = 5;
            } else {
                neg = 2 * (nutri - 11);
                score = (15 - neg) * 0.6;
            }
        }
    } else {
        return "?";
    }
    if (prod._keywords.includes('bio') || prod._keywords.includes('biologique') || prod.labels.includes('Bio') || prod.labels.includes('bio')) {
        score += 10;
    }
    if (prod.additives_n >= 5) {
        score += 3;
    } else {
        score += 6 * (5 - prod.additives_n);
    }
    return Math.round(score);
}
