# API REST avec mongoose

Voici une petite API REST qui fonctionne avec une base de donnée MongoDB donc du NOSql

## Prérequis

Avoir installer nodejs et avoir créer une base de donnée mongo

## Explications

Elle est déjà avec un objet Users:
 - name
 - email
 - photo
 - about
 - hashed_password
 - createdAt
 - updatedAt
 
Egalement avec un objet Posts:
 - title
 - body
 - photo
 - postedBy
 - createdAt
 - updatedAt

Ces deux objets sont en relation Posts dépend de Users.


## Installation

Pour récupérer et faire fonctionner cette API il faut :
 - faire un git clone 
 
 - ensuite faire npm install pour pouvoir installer tout les composants node
 
 - se créer un fichier .env en mettant comme paramètre :
    ````
     - l'URI de votre Base de Donnée : MONGO_URI=
     - votre port sur le quel vous souhaitez faire écouter l'API : PORT=
     - un token secret : JWT_SECRET=
 - une fois les trois premières étapes reliées, vous pouvez lancer votre API en tapant dans une console: 
    ````
    - npm run dev
## Outils principaux

 * [NodeJs](https://nodejs.org/en/) : Framework js
 * [Mongoose](https://mongoosejs.com/docs/guide.html) : Package de communication pour la base de donnée
 * [Express](http://expressjs.com/) : Package pour faire des requêtes http

## Conclusion
    
Voila pour les explications, si vous avez des problèmes n'hésitez 
pas à m'envoyer un mail j'y répondrais assez rapidement normalement.

A vous de vous amusez maintenant et si vous avez des propositions hésitez pas, 
je rappel ce n'est qu'un début il pourra y avoir des améliorations.
