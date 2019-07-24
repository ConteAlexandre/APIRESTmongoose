const _ = require('lodash')
const Users = require('../models/UsersModels');
const formidable = require('formidable');
const fs = require('fs');

module.exports = {

    //Cette méthode nous permet d'aller l'id soumis en paramètre dans la bdd et de savoir si il existe
    UserById: (req, res, next, id) => {
        Users.findById(id)
            .populate('following', '_id name')
            .populate('followers', '_id name')
            .exec((err, user) => {
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

    //Méthode pour mettre à jour l'user avec la photo
    updateUser: (req, res, next) => {
        let form = new formidable.IncomingForm()
        form.keepExtensions = true
        form.parse(req, (err, fields, files) => {
            if (err) {
                return res.status(400).json({
                    error: 'Image ne peut être upload'
                })
            }
            //On sauvegarde l'utilisateurs
            let user = req.profile
            user = _.extend(user, fields)//On definit que user est une mutation qui prend en compte le req.profile et ce qu'il y aura dans les champs de formulaire
            user.updatedAt = Date.now()//On établit la valeur de updatedAt dans la BDD

            if (files.photo) {
                user.photo.data = fs.readFileSync(files.photo.path)
                user.photo.contentType = files.photo.type
            }

            user.save((err, result) => {
                if (err) {
                    return res.status(400).json({
                        error: err
                    })
                }
                user.hashed_password = undefined
                res.json(user)
            })
        })
    },

    //Méthode pour aller cherche la photo qui correspond à l'user
    userPhoto: (req, res, next) => {
            res.set("Content-Type", req.profile.photo.contentType)
            return res.send(req.profile.photo.data)
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
    },

    //Méthode pour pouvoir follow un user
    addFollowing: (req, res, next ) => {
        Users.findByIdAndUpdate(req.body.userId,
            {$push: { following: req.body.followId}},
            (err, result) => {
            if (err) {
                return res.status(400).json({ error: err })
            }
            next()
        })
    },

    //Méthode permettant de voir qui nous follow
    addFollowers: (req, res ) => {
        Users.findByIdAndUpdate(req.body.followId,
            {$push: { followers: req.body.userId} },
            {new: true}
        )
            .populate('following', '_id name about')
            .populate('followers', '_id name about')
            .exec((err, result) => {
                if (err) {
                    return res.status(400).json({ error: err })
                }
                result.hashed_password = undefined
                res.json(result)
            })
    },

    //Méthode pour unfollow un user
    removeFollowing: (req, res, next ) => {
        Users.findByIdAndUpdate(req.body.userId,
            {$pull: { following: req.body.unfollowId}},
            (err, result) => {
            if (err) {
                return res.status(400).json({ error: err })
            }
            next()
        })
    },

    //Méthode qui nous supprimer les personnes qui nous suivent plus
    removeFollowers: (req, res ) => {
        Users.findByIdAndUpdate(req.body.unfollowId,
            {$pull: { followers: req.body.userId} },
            {new: true}
        )
            .populate('following', '_id name about')
            .populate('followers', '_id name about')
            .exec((err, result) => {
                if (err) {
                    return res.status(400).json({ error: err })
                }
                result.hashed_password = undefined
                res.json(result)
            })
    },

    //Méthode permettant de trouver les personnes que l'on ne suit pas encore
    findPeople: (req, res) => {
        let following = req.profile.following
        following.push(req.profile._id)
        Users.find({ _id: {$nin: following }}, (err, users) => {
            if (err) {
                return res.status(400).json({ error: err })
            }
            res.json(users)
        })
            .select("name")
    }
}