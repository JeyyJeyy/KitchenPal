var dm = false;
var checkbox = document.querySelector('input[name="mode"]');

function delet(bar, date) {
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

function added(bar, date) {
   const response = fetch('/posts', {
      method: 'POST',
      body: JSON.stringify({
         command: "add",
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

function getinfos(bar) {
   location.href = 'product?id=' + bar;
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

function gohome() {
   location.href = 'home';
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
   checkbox.checked = true;
} else if (localStorage.getItem("isDarkMode") == "0" && dm != false) {
   darkmode();
   checkbox.checked = false;
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