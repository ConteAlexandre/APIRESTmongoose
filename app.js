//Package qui nours permet de créer nos routes sur l'API
const express = require('express');

//PAckage lambda
const morgan = require('morgan');

//Package orm de mongodb
const mongoose = require('mongoose');

//Package permettant de lire du json
const bodyParser = require('body-parser');

//Package pour gérer les cookies
const  cookieParser = require('cookie-parser');

const cors = require('cors')

//Package permettant de fonctionne avec le fichier .env
const dotenv = require('dotenv');
dotenv.config();

//DB parametrage de la connexion
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true})
    .then(() => console.log('CONNECTED'))

mongoose.connection.on('error', err => {
    console.log(`CONNECTION FAILED ${err.message}`)
})

//On utlise ici le package
const app = express();


//On fait en sorte que notre API utilise les différents package
app.use(morgan('dev'))
app.use(bodyParser.json());
app.use(cookieParser())
app.use(cors())
//On fait appel à nos routes
app.use('/', require('./routes/PostsRoutes'));
app.use('/', require('./routes/UsersRoutes'));

//Message d'erreur disant qu'on est pas autoriser à la route et à placer impérativement apres nos routes de l'API
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ error: 'Vous n\'êtes pas autorisé'});
    }
});

//On définit le port d'écoute avec le .env
const port = process.env.PORT;

//On fait fonctionner notre api sur le port et un message pour dire que l'on est conencter sur ce port
app.listen(port, () => {
    console.log(`L'API écoute sur le port : ${port}`)
})