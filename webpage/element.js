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
 
 function added(bar,date) {
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

 function gohome() {
   location.href = 'home.html';
}

function darkmode() {
   var element = document.body;
   element.classList.toggle("dark-mode");
}