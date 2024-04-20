var dm = false;

function delet(bar, date, nb) {
   fetch('/posts', {
      method: 'POST',
      body: JSON.stringify({
         command: "del",
         barcode: bar,
         quantity: nb,
         date: [date]
      }),
      headers: {
         "Content-type": "application/json; charset=UTF-8"
      }
   }).then(function (response) {
      if (parseInt(response) == 0) {
         location.href = 'home.html';
      } else {
         location.reload();
      }
   });
}

function added(bar, date, nb) {
   fetch('/posts', {
      method: 'POST',
      body: JSON.stringify({
         command: "add",
         barcode: bar,
         quantity: nb,
         date: [date]
      }),
      headers: {
         "Content-type": "application/json; charset=UTF-8"
      }
   }).then(() => {
      location.reload();
   })
}

function getinfos(id) {
   location.href = 'product?id=' + id;
}

function darkmode() {
   var element = document.body;
   element.classList.toggle("dark-mode");
   if (dm == true) {
      dm = false;
   } else {
      dm = true;
   }
   toggleModes(dm)
}

function toggleModes(bool) {
   if (new Number(bool) == 0) {
      localStorage.setItem("isDarkMode", "0")
   } else if (new Number(bool) == 1) {
      localStorage.setItem("isDarkMode", "1")
   } else {
      localStorage.setItem("isDarkMode", "1")
   }
}

if (localStorage.getItem("isDarkMode") == null) {
   toggleModes(dm)
}

if (localStorage.getItem("isDarkMode") == "1" && dm != true) {
   darkmode();
} else if (localStorage.getItem("isDarkMode") == "0" && dm != false) {
   darkmode();
}

function search() {
   var input, filter, table, tr, td, i, txtValue;
   input = document.getElementById("input");
   filter = input.value.toUpperCase();
   table = document.getElementById("data-output");
   tr = table.getElementsByTagName("tr");
   for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[2];
      if (td) {
         txtValue = td.textContent || td.innerText;
         if (txtValue.toUpperCase().indexOf(filter) > -1) {
            tr[i].style.display = "";
         } else {
            tr[i].style.display = "none";
         }
      }
   }
}

function submit() {
   let dat = document.getElementById("date").value;
   let quant = document.getElementById("quantity").value;
   let bar = document.getElementById("barcode").value;
   if (!bar || !dat || parseInt(quant) < 1 || !quant || bar.length < 6) {
      alert("Veuillez entrer des valeurs valides.")
   } else {
      var date = dat.split('-');
      dat = date[2] + '/' + date[1] + '/' + date[0];
      added(bar, dat, quant);
   }
}

document.getElementsByClassName('fadein')[0].classList.add('loaded')