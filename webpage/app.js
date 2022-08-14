var dm = false;
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

function getinfos(bar, date) {
   location.href = 'product.html?id=' + bar + '&date=' + date;
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
   location.href = 'home.html';
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