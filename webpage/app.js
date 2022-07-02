fetch("api.json")
.then(function(response){
   return response.json();
})
.then(function(products){
   let placeholder = document.querySelector("#data-output");
   let out = "";
   for(let product of products){
      out += `
         <tr>
            <td> <img width="100" height="120" src='${product.lien}'> </td>
            <td>${product.nom}</td>
            <td>${product.barcode}</td>
         </tr>
      `;
   }
 
   placeholder.innerHTML = out;
});