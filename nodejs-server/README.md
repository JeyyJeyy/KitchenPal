<h1 align="center">
  <a><img src="https://next.ouranos.ovh/index.php/apps/files_sharing/publicpreview/njMYLHCeeKza3Zb?file=/&fileId=33308&x=1920&y=1080&a=true&etag=6351adead8e45519c4bfffb8c1e3b7d2" alt="Manage your stock of food"></a>
  KitchenPal - Gérer ses stocks
</h1>
<p align="center">
  <a>
    <img src="https://img.shields.io/badge/Statut-actif-red" alt="version">
  </a>
  <a>
     <img alt="nodejs" src="https://img.shields.io/badge/node.js-v20.11.0-green">
  </a>
  <a>
     <img src="https://img.shields.io/badge/Projet-v3.2.10-blue" alt="version">
  </a>
</p>

# Aperçu
Ce projet est un serveur de gestion de stocks de nourriture développé en Node.js. Il offre une solution simple et efficace pour gérer les inventaires alimentaires en utilisant des requêtes HTTP pour l'ajout et la suppression d'éléments. Les différentes fonctionnalités incluses sont les suivantes :
- Gestion des Stocks: Ajoutez et supprimez facilement des produits alimentaires de votre inventaire.
- Interface Web conviviale: Une interface web intuitive pour une gestion facile des stocks.
- Intégration avec OpenFoodFact: Obtenez des informations détaillées sur les produits alimentaires grâce à l'API OpenFoodFact, notamment les valeurs nutritionnelles et les informations sur les ingrédients.

Le serveur dispose d'une interface web (port 8080 par défaut) affichant les produits et leurs informations et permettant de les gérer sans utiliser de client dédié.<br>
Le seul paramètre à configurer se trouve dans le fichier index.js:
```js
app.listen(8080,"127.0.0.1"); //Ligne 10 : addresse et port
```