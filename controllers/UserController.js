const _ = require('lodash')
const Users = require('../models/UsersModels');

module.exports = {

    //Cette méthode nous permet d'aller l'id soumis en paramètre dans la bdd et de savoir si il existe
    UserById: (req, res, next, id) => {
        Users.findById(id).exec((err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    error: 'Utilisateurs non trouvé'
                })
            }
            req.profile = user //On ajoute un objet profile avec les info user
            next()
        })
    },

    //Cette méthode permet de filtrer les actions aux personnes qui sont connecté et qui possède le même id dans le profile et celui dans le token
    hasauthorization: (req, res, next) => {
        const authorized = req.profile && req.auth && req.profile._id == req.auth._id
        if (!authorized) {
            return res.status(403).json({
                error: 'Vous n\'êtes pas autorisé à faire ceci!'
            })
        }
        next()
    },

    //Méthode nous permettant de récupérer tout les Utilisateurs
    getAllUsers: (req, res) => {
        Users.find()
            .select('name email')
            .then(users => {
                return res.status(200).json(
                    users
                )
            })
            .catch(err => {
                return res.status(404).json({
                    error: err.message
                })
            })
    },

    //On ne récupère qu'un seul utilisateur
    getOneUser: (req, res) => {
        req.profile.hashed_password = undefined
        return res.json(req.profile)
    },

    //On modifie le profil de l'utilisateurs
    updateUser: (req, res, next) => {
        let user = req.profile;
        user = _.extend(user, req.body) //On definit que user est une mutation qui prend en compte le req.profile et req.body
        user.updatedAt = Date.now() //On établit la valeur de updatedAt dans la BDD
        user.save((err) => {
            if (err) {
                return res.status(400).json({
                    error: 'Vous n\'êtes pas autorisé à faire ceci!'
                })
            }
            user.hashed_password = undefined
            res.json({ user })
        })
    },

    //Suppression définitive de l'user
    deleteUser: (req, res, next) => {
        let user = req.profile;
        user.remove((err, user) => {
            if (err) {
                return rs.status(400).json({
                    error: err
                })
            }
            user.hashed_password = undefined
            res.json({ message: 'Utilisateur supprimé' })
        })
    }
}