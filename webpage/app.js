fetch("api.json")
   .then(function (response) {
      return response.json();
   })
   .then(function (products) {
      let placeholder = document.querySelector("#data-output");
      let out = "";
      for (let product of products) {
         let date = product.date.replace(/\//gi,'_');
         out += `
         <tr>
            <td> <img width="150" height="150" src='${product.lien}'> </td>
            <td>${product.nom}</td>
            <td>${product.barcode}</td>
            <td>${product.date}</td>
            <td>${product.quantity}</td>
            <td><button onclick="delet(${product.barcode},${date})">Supprimer x1</button></td>
         </tr>
      `;
      }
      placeholder.innerHTML = out;
   });

function delet(bar,date) {
   const response = fetch('/posts', {
      method: 'POST',
      body: JSON.stringify({
         command: "del",
         barcode: bar,
         quantity: 1,
         date: date.toString()
      }),
      headers: {
         "Content-type": "application/json; charset=UTF-8"
      }
   })
   location.reload();
}