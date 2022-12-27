const https = require('https');
var Stream = require('stream').Transform;
const fs = require('fs');

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

function buildHtml(num) {
    let data = fs.readFileSync('data.json', 'utf8');
    let das = JSON.parse(data);
    let id, dat;
    let file = `<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="stylesheet" href="styles.css"><link rel="icon" href="icon.ico" /><title>Stock-Manager</title></head>` +
        `<body><br><label style="margin-left: 10px; width: 90px; height: 30px; font-size: 14px;"><input name="mode" type="checkbox" id="check" onclick="darkmode()"> Dark mode   <i class="fa-solid fa-circle-half-stroke"></i></label><div id="except" style="display: inline; position: absolute; right: 10px; top: 10px"><button style="width:85px;" onclick="window.location.href='/home';"><i class="fa-solid fa-house"></i>  Accueil</button>&nbsp;&nbsp;<button style="width:150px;" onclick="window.location.href='/panel';"><i class="fa-solid fa-gear"></i>   Gérer les produits</button>&nbsp;&nbsp;<button style="width:115px;" onclick="window.location.href='/about';"><i class="fa-solid fa-circle-info"></i>   Informations</button></div><br><center><a href="/home.html"><img width="100" height="100" src="icon.ico"></a><h1>Stock Manager v2.7.10</h1></center><br>`;
    try {
        dat = das[num].date;
        id = das[num].barcode;
    } catch {
        file += '<center><h2>Produit inconnu</h2><br><button onclick="gohome()"><b><i class="fa-solid fa-rotate-left"></i>   Retour</b></button></center><center style="position: fixed;bottom: 0;right: 0;left: 0"><p style="margin: 10px">Made with <span style="color: #FF0000;">&hearts;</span> by JeyyJeyy</p></center><script src="https://kit.fontawesome.com/48b85ccf71.js" crossorigin="anonymous"></script><script src="app.js"></script></body></html>';
        return file;
    }
    if (id != null) {
        let produit = fs.readFileSync(`./products/${id}.json`);
        let produit2 = JSON.parse(produit);
        let prod = produit2.product;
        let ing_text = prod.ingredients_text_fr;
        let time = das[num].date.split('/');
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
        }
        file += '<center style="overflow-x:auto;"><table>' +
            '<thead><tr><th>Consommable</th><th>Image</th><th>Nom du produit</th>' +
            '<th>Date limite</th><th>Quantité</th><th>Commande</th></tr><tr>' +
            '<td><img src=' + url + '></td>' +
            '<td style="font-size: 12px;"><img style="border-radius: 15px; height: 150px; width: 150px; object-fit: cover; max-width: 80%; max-height: 80%"" src="' + das[num].barcode + '.jpg" onerror="this.onerror=null; this.src=`no-product.png`"> <br> ' + das[num].barcode + ' </td>' +
            '<td>' + prod.product_name_fr + '</td>' +
            '<td>' + das[num].date + '<br>' + diffDays + '</td>' +
            '<td>' + das[num].quantity + '</td>' +
            '<td><button onclick="added(' + id + ',' + dat + ',' + 1 + ')"><b><i class="fa-solid fa-circle-plus"></i>   Ajouter</b></button><br><br><button onclick="delet(' + id + ',' + dat + ',1)"><b><i class="fa-solid fa-circle-minus"></i>   Effacer</b></button><br><br><button onclick="gohome()"><b><i class="fa-solid fa-rotate-left"></i>   Retour</b></button></td>' +
            '</tr></thead><tbody id="data-output"></tbody></table></center><br>' +
            '<center style="overflow-x:auto;"><div id="boxed" name="outer" class="centered"><label style="display: block; margin: auto;"><h4 align="left">Scores du produit: </h4></label><div class="middle"><div class="inner" style="border: none;"><svg width="110" height="110"><circle stroke="white" stroke-width="5" cx="55" cy="55" r="52" fill="' + scoreurl + '" /><text x="50%" y="43%" text-anchor="middle" font-weight="bold" fill="white" font-size="50px" font-family="Arial" dy=".3em">' + produit2["yuka-score"] + '</text><text x="50%" y="75%" text-anchor="middle" font-weight="bold" fill="white" font-size="25px" font-family="Arial" dy=".3em">/100</text></svg><br><b>Stock-Score </b><i style="margin-top:3px" class="fa-solid fa-circle-question" id="tooltip"><span class="tooltiptext" style="font-style: normal;">Note personnelle</span></i></div><div class="inner" style="border: none;"><img style="width:200px;" src="nutriscore-' + prod.nutriscore_grade + '.svg"><br><b>Nutri-score </b><i style="margin-top:3px" class="fa-solid fa-circle-question" id="tooltip"><span class="tooltiptext" style="font-style: normal;">Qualité nutritionnelle</span></i></div><div class="inner" style="border: none;"><img style="width:200px;margin:auto" src="ecoscore-' + prod.ecoscore_grade + '.svg"><br><b>Eco-score </b><i style="margin-top:3px" class="fa-solid fa-circle-question" id="tooltip"><span class="tooltiptext" style="font-style: normal;">Impact environnemental</span></i></div><div class="inner" style="border: none;"><img src="nova-group-' + prod.nova_groups + '.svg"><br><b>Nova-score </b><i style="margin-top:3px" class="fa-solid fa-circle-question" id="tooltip"><span class="tooltiptext" style="font-style: normal;">Degré de transformation des aliments</span></i></div></div></center>' +
            '</div><br><center style="overflow-x:auto;"><div id="boxed" name="product" class="centered"><label style="display: block; margin: auto; margin-bottom:10px" align="left"><h4 style="display: inline" align="left">Ingrédients du produit: </h4>(' + prod.additives_n + ' additifs)</label><p align="left" style="margin:auto; margin-left:10px; margin-bottom:8px">' + ing_text + '</p>' +
            '</div></center><br><br><center><p style="margin: 10px">Made with <span style="color: #FF0000;">&hearts;</span> by JeyyJeyy</p></center><script src="app.js"></script><script src="https://kit.fontawesome.com/48b85ccf71.js" crossorigin="anonymous"></script></body></html>';
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

module.exports = { delet, yuka, ordonner, buildHtml, downloading, date };