let auj = 0;
let long = 0;
let non = 0;
let ind = 0;
fetch("data.json")
    .then(function (response) {
        return response.json();
    })
    .then(function (products) {
        let placeholder = document.querySelector("#data-output");
        let out = "";
        for (let product of products) {
            let url;
            let time = product.date[0].split('/');
            const date1 = new Date(time[2], time[1] - 1, time[0], 12, 0, 0);
            const date2 = Date.now();
            const diffTime = Math.abs(date2 - date1);
            let diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 6) {
                if (diffDays == 0) {
                    diffDays = 'aujourd\'hui';
                } else if (date1 <= date2) {
                    diffDays = 'depuis ' + diffDays + ' jours';
                } else {
                    diffDays = 'dans ' + diffDays + ' jours';
                }
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
            out += `
         <tr>
            <td style="width: 10%;"><img style="width:50px" src='icons/${url}'></td>
            <td style="width: 20%;font-size: 12px;"><a href="/product?id=${ind}"><img style='border-radius: 15px; height: 150px; width: 150px; object-fit: cover; max-width: 80%; max-height: 80%' src="${product.barcode}.jpg" onerror="this.onerror=null; this.src='icons/no-product.png'"></a><br> ${product.barcode} </td>
            <td style="width: 30%;">${product.nom}</td>
            <td style="width: 15%;">${product.date[0]}<br>${diffDays}</td>
            <td style="width: 10%;">${product.quantity}</td>
            <td style="width: 15%;"><button onclick="delet(${product.barcode},'${product.date[0]}',1)"><b><i class="fa-solid fa-circle-minus"></i>   Effacer</b></button><br><br><button onclick="getinfos(${ind})"><b><i class="fa-solid fa-circle-info"></i>   Infos</b></button></td>
         </tr>
      `; //ajouter liste des dates possibles avant bouton suppr
            ind++
        }
        placeholder.innerHTML = out;
        //document.querySelector('[name="per"]').innerHTML = '<div name="outer" style="border: none; height:50px;margin:auto 0"><div class="middle" id="nova" style="border: none;height:30px;width:1000px"><div class="inner" id="nova" style="border: none;"><img style="width:50px;" src="icons/ok.png"><b style="font-size:25px">' + non + ' valables</b></div><div class="inner" id="nova" style="border: none;"><img style="width:50px;" src="icons/equal.png"><b style="font-size:25px">' + auj + ' limites</b></div><div class="inner" id="nova" style="border: none;"><img style="width:50px;" src="icons/no.png"><b style="font-size:25px">' + long + ' dépassés</b></div></div>';
    });