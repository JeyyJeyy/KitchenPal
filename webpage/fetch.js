let auj = 0;
let long = 0;
let non = 0;
fetch("data.json")
    .then(function (response) {
        return response.json();
    })
    .then(function (products) {
        let placeholder = document.querySelector("#data-output");
        let out = "";
        for (let product of products) {
            let url;
            let dat = product.date.replace(/\//gi, '');
            let time = product.date.split('/');
            const date1 = new Date(time[2], time[1] - 1, time[0]);
            const date2 = Date.now();
            const diffTime = Math.abs(date2 - date1);
            let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays == 0 || diffDays == 1) {
                diffDays = 'aujourd\'hui';
                url = 'equal.png';
                auj++
            } else if (date1 <= date2) {
                diffDays = 'depuis ' + diffDays + ' jours';
                url = 'no.png';
                long++
            } else {
                diffDays = 'dans ' + diffDays + ' jours';
                url = 'ok.png';
                non++
            }
            let pic = product.barcode + '.jpg';
            if (!fs.existsSync(`./webpage/icons/${product.barcode}.jpg`)) {
                pic = "no-product.png";
            }
            out += `
         <tr>
            <td><img src='${url}'></td>
            <td style="font-size: 12px;"> <img style='border-radius: 15px; height: 150px; width: 150px; object-fit: contain;' src="${product.barcode}.jpg"> <br> ${product.barcode} </td>
            <td>${product.nom}</td>
            <td>${product.date}<br>${diffDays}</td>
            <td>${product.quantity}</td>
            <td><button onclick="added(${product.barcode},${dat})"><b>Ajouter</b></button><br><br><button onclick="delet(${product.barcode},${dat})"><b>Supprimer</b></button><br><br><button onclick="getinfos(${product.barcode})"><b>Infos</b></button></td>
         </tr>
      `;
        }
        placeholder.innerHTML = out;
        document.querySelector('[name="per"]').innerHTML = '<div name="outer" style="border: none; height:50px;margin:auto 0"><div class="middle" id="nova" style="border: none;height:30px;width:1000px"><div class="inner" id="nova" style="border: none;"><img style="width:50px;" src="ok.png"><b style="font-size:25px">' + non + ' valables</b></div><div class="inner" id="nova" style="border: none;"><img style="width:50px;" src="equal.png"><b style="font-size:25px">' + auj + ' limites</b></div><div class="inner" id="nova" style="border: none;"><img style="width:50px;" src="no.png"><b style="font-size:25px">' + long + ' dépassés</b></div></div>';
    });