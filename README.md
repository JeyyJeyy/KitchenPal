<h1 align="center">
  <br>
  <a><img src="https://next.ouranos.ovh/index.php/apps/files_sharing/publicpreview/njMYLHCeeKza3Zb?file=/&fileId=33308&x=1920&y=1080&a=true&etag=6351adead8e45519c4bfffb8c1e3b7d2" alt="Manage your stock of food"></a>
  <br>
  KitchenPal - Gérer ses stocks
  <br>
</h1>

<h4 align="center">Serveur du programme de gestion de stock</h4>

<p align="center">
  <a>
    <img src="https://img.shields.io/badge/Statut-actif-red" alt="version">
  </a>
  <a>
     <img alt="nodejs" src="https://img.shields.io/badge/node.js-v16.16.0-green">
  </a>
  <a>
     <img src="https://img.shields.io/badge/Projet-v3.1.16-blue" alt="version">
  </a>
</p>

# Aperçu

Ce programme lié avec le programme côté client permet de gérer ses stocks. Le serveur dispose d'une interface web (port 8080) affichant les produits et leurs informations et permettant de les gérer sans utiliser le client. Retrouvez la partie client: [StockManager - client side](https://github.com/JeyyJeyy/StockManager-client)<br>
Le seul paramètre à configurer se trouve dans le fichier index.js:
```js
app.listen(8080,"127.0.0.1"); //Ligne 10 : addresse et port
```