//En appelant dotenv, on peut utiliser nos configuration établi dans le fichier .env
require('dotenv').config()
//On fait appel à notre modèle pour ensuite appliquer les requêtes SQL
const Users = require('../models/UsersModels');
//Package qui va nous permettre de gérer un token lors de la connexion
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');

module.exports= {

    //Méthode pour s'inscrire
    signup: async (req, res) => {

        //On vérifie si l'email n'existe pas déjà
        const userExist = await Users.findOne({ email: req.body.email })
        if (userExist) return res.status(403).json({
            error: 'Email est déjà existant'
        })

        //Si l'email n'existe pas, alors on lance la création d'un nouveau User
        const user = await new Users(req.body)
        //On lance la sauvegarde des données
        user.save()
            .then(user => {
                res.status(200).json({ message: 'Vous voici inscrit! Veuillez vous connecter' })
            })
            .catch(err => {
                if (err['errors']['name']) return res.status(401).json({ error: err['errors']['name']['message']})
                if (err['errors']['email']) return res.status(401).json({ error: err['errors']['email']['message']})
                if (err['errors']['hashed_password']) return res.status(401).json({ error: err['errors']['hashed_password']['message']})
            })
    },

    //Méthode permettant de se connecter
    signin: async (req, res) => {

        //On établi une généralité pour éviter de répéter req.body
        const { email, password } = req.body

        //On cherche notre User par son email
        Users.findOne({email}, (err, user) => {

            //Si il y a une erreur ou utilisateur non trouvé
            if (err || !user) {
                res.status(401).json({ error: 'Email non trouvé'})
            } else

            //Si le mot de passe ne correspond pas à celui en bdd
            if (user.authenticate(password)) {

                //Générons un token lors de la connexion et enregistrons certaines données de l'user
                const token = jwt.sign({ _id: user._id, name: user.name }, process.env.JWT_SECRET)

                //On sauvegarde le token dans un cookie avec une durée et un nom
                res.cookie('t', token, {expire: new Date() + 9999 })

                //On retourne l'utilisateur avec le token
                const {_id, email, name } = user
                res.json({ token, user: { _id, name, email }})

            } else {
                res.status(401).json({ error: 'Le mot de passe est incorrect'})
            }
        })
    },

    //Méthode de déconnexion
    signout: async (req, res) => {

        //On nettoie les cookies existant sur la session et dont le nom est t
        await res.clearCookie('t')
        return res.json({ message: 'Vous êtes déconnecté' })
    },

    //Ceci va nous permettre de sire qu'un token est obligatoire pour faire l'action
    requireSignin: expressJwt({
        secret: process.env.JWT_SECRET,
        //Ici on va dire que les propriétés de l'user dans le token sont contenu dans auth
        userProperty: "auth"
        })
}
