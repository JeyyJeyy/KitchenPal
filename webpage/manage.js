let ind = 0;
fetch("data.json")
    .then(function (response) {
        return response.json();
    })
    .then(function (products) {
        let placeholder = document.querySelector("#data-output");
        let out = "";
        for (let product of products) {
            let time = product.date.split('/');
            const date1 = new Date(time[2], time[1] - 1, time[0]);
            const date2 = Date.now();
            const diffTime = Math.abs(date2 - date1);
            let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 6) {
                if (diffDays == 0 || diffDays == 1) {
                    diffDays = 'aujourd\'hui';
                } else if (date1 <= date2) {
                    diffDays = 'depuis ' + diffDays + ' jours';
                } else {
                    diffDays = 'dans ' + diffDays + ' jours';
                }
            } else if (date1 <= date2) {
                diffDays = 'depuis ' + diffDays + ' jours';
            } else {
                diffDays = 'dans ' + diffDays + ' jours';
            }
            out += `
         <tr>
            <td style="font-size: 12px;"><a href="/product?id=${ind}"><img style='border-radius: 15px; height: 150px; width: 150px; object-fit: cover; max-width: 80%; max-height: 80%' src="${product.barcode}.jpg" onerror="this.onerror=null; this.src='no-product.png'"></a><br> ${product.barcode} </td>
            <td>${product.nom}</td>
            <td>${product.date}<br>${diffDays}</td>
            <td>${product.quantity}</td>
         </tr>
      `;
            ind++
        }
        placeholder.innerHTML = out;
    });