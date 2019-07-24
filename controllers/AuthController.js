//En appelant dotenv, on peut utiliser nos configuration établi dans le fichier .env
require('dotenv').config()
//On fait appel à notre modèle pour ensuite appliquer les requêtes SQL
const Users = require('../models/UsersModels');
//Package qui va nous permettre de gérer un token lors de la connexion
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const _ = require("lodash");
const { sendEmail } = require("../helpers");

module.exports= {

    //Méthode pour s'inscrire
    signup: async (req, res) => {

        //On vérifie si l'email n'existe pas déjà
        const userExist = await Users.findOne({email: req.body.email})
        if (userExist) return res.status(403).json({
            error: 'Email est déjà existant'
        })

        //Si l'email n'existe pas, alors on lance la création d'un nouveau User
        const user = await new Users(req.body)
        //On lance la sauvegarde des données
        user.save()
            .then(user => {
                res.status(200).json({message: 'Vous voici inscrit! Veuillez vous connecter'})
            })
            .catch(err => {
                if (err['errors']['name']) return res.status(401).json({error: err['errors']['name']['message']})
                if (err['errors']['email']) return res.status(401).json({error: err['errors']['email']['message']})
                if (err['errors']['hashed_password']) return res.status(401).json({error: err['errors']['hashed_password']['message']})
            })
    },

    //Méthode permettant de se connecter
    signin: async (req, res) => {

        //On établi une généralité pour éviter de répéter req.body
        const {email, password} = req.body

        //On cherche notre User par son email
        Users.findOne({email}, (err, user) => {

            //Si il y a une erreur ou utilisateur non trouvé
            if (err || !user) {
                res.status(401).json({error: 'Email non trouvé'})
            } else

            //Si le mot de passe ne correspond pas à celui en bdd
            if (user.authenticate(password)) {

                //Générons un token lors de la connexion et enregistrons certaines données de l'user
                const token = jwt.sign({_id: user._id, name: user.name}, process.env.JWT_SECRET)

                //On sauvegarde le token dans un cookie avec une durée et un nom
                res.cookie('t', token, {expire: new Date() + 9999})

                //On retourne l'utilisateur avec le token
                const {_id, email, name, createdAt} = user
                res.json({token, user: {_id, name, email, createdAt}})

            } else {
                res.status(401).json({error: 'Le mot de passe est incorrect'})
            }
        })
    },

    //Méthode de déconnexion
    signout: async (req, res) => {

        //On nettoie les cookies existant sur la session et dont le nom est t
        await res.clearCookie('t')
        return res.json({message: 'Vous êtes déconnecté'})
    },

    //Ceci va nous permettre de sire qu'un token est obligatoire pour faire l'action
    requireSignin: expressJwt({
        secret: process.env.JWT_SECRET,
        //Ici on va dire que les propriétés de l'user dans le token sont contenu dans auth
        userProperty: "auth"
    }),

    //Méthode d'envoie de mail pour le mot de passe oublié et générer le jeton
    forgotPassword: (req, res) => {
        if (!req.body) return res.status(400).json({ message: "No request body" });
        if (!req.body.email)
            return res.status(400).json({ message: "No Email in request body" });

        console.log("forgot password finding user with that email");
        const { email } = req.body;
        console.log("signin req.body", email);
        // On recherche si l'email est existant
        Users.findOne({ email }, (err, user) => {
            // si non ou pas d'user
            if (err || !user)
                return res.status("401").json({
                    error: "L'adresse mail n'existe pas!"
                });

            // Si on l'as trouvé alors on génère le jeton avec l'id de l'user et le token secret
            const token = jwt.sign(
                { _id: user._id, iss: "NODEAPI" },
                process.env.JWT_SECRET
            );

            // Ensuite on envoie le mail
            const emailData = {
                from: "noreply@node-react.com",
                to: email,
                subject: "Reset de votre mot de passe",
                text: `Please use the following link to reset your password: http://localhost:3000/reset-password/${token}`,
                html: `<p>Cliquer sur le lien suivant pour accéder à la réinitialisation du mot de passe:</p> 
                        <p><a href="http://localhost:3000/reset-password/${token}">http://localhost:3000/reset-password/${token}</a></p>`
            };

            //Ici on passe à l'enregistrement du jeton dans la base de donnée pour l'utilisateurs qui en a fait la demande
            return user.updateOne({ resetPasswordLink: token }, (err, success) => {
                if (err) {
                    return res.json({ message: err });
                } else {
                    sendEmail(emailData);
                    return res.status(200).json({
                        message: `Le mail a été envoyé à ${email}. Veuillez suivre les instructions pour reset le mot de passe.`
                    });
                }
            });
        });
    },

    //Méthode pour faire le nouveau password
    resetPassword: (req, res) => {
        const { resetPasswordLink, newPassword } = req.body;

        //On recherche notre utilisateurs alors le jeton qui a a été enregistré précédement
        Users.findOne({ resetPasswordLink }, (err, user) => {
            // si non trouvé
            if (err || !user)
                return res.status("401").json({
                    error: "Lien invalide!"
                });

            const updatedFields = {
                password: newPassword,
                resetPasswordLink: ""
            };

            //On signale ici que notre user est ce qu'il est de base plus les nouveaux champs
            user = _.extend(user, updatedFields);
            user.updatedAt = Date.now();

            //Ici on sauvegarde notre nouveau mot de passe et on remet à blanc notre propriété pour le jeton
            user.save((err, result) => {
                if (err) {
                    return res.status(400).json({
                        error: err
                    });
                }
                res.json({
                    message: `Bravo, maintenant tu peux te connecter.`
                });
            });
        });
    },
}
