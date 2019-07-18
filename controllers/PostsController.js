const Post = require('../models/PostsModels');
const formidable = require('formidable');
const fs = require('fs');
const _ = require('lodash');


module.exports = {

    //Cette méthode nous permet de récuper les posts qui correspond à 'id en paramètre
    postById: (req, res, next, id) => {

        //On cherche par l'id du post
        Post.findById(id)

        //Ici on fait la relation avec notre User qui a créer le post et on demande à voir uniquement id et name
            .populate('postedBy', '_id name')
            .exec((err, post) => {
                if (err || !post) {
                    return res.status(400).json({
                        error: err
                    })
                }
                req.post = post
                next()
            })
    },

    //Cette méthode permet de récupérer tout les posts sans distinctions
    getPost: (req, res) => {
        const posts = Post.find()

        //On établit la relation avec l'user qui l'as créer
            .populate('postedBy', '_id name')
            //Ici on sélectionne ce que l'on veut voir du post
            .select('title body')
            .then(posts => {
                res.status(200).json( posts )
            })
            .catch(err => {
                res.status(404).json({ error: err })
            })

    },

    //Cette méthode permet de récupérer les post selon l'i dde l'utilisateurs soumis dans l'url
    getPostByUser: (req, res) => {
        Post.find({ postedBy: req.profile._id })
            .populate('postedBy', '_id name')
            //On décide de comment ils sont listé
            .sort('createdAt')
            .exec((err, posts) => {
                if (err) {
                    return res.status(400).json({
                        error: err
                    })
                }
                res.json(posts)
            })
    },

    //Cette méthode permet de créer un post
    createPost: (req, res) => {

        //On signale que les données rentré seront un nouveau formulaire entrant
        const form = new formidable.IncomingForm()
        //Lorsque l'on upload des fichiers on garde l'extension
        form.keepExtensions = true
        //On établi une analyse des champs du formulaire
        form.parse(req, (err, fields, files) => {
            if (err) {
                return res.status(400).json({
                    error: 'L\'image ne peut être upload'
                })
            }
            //On créer un nouveau post en précisant que ce sont avec les champs du formulaire
            let post = new Post(fields);
            //On explique que la variable postedBy sera celle du profil enregistrer et qui crée l'article
            post.postedBy = req.profile;
            //Si il y a un fichier existant pour la variable photo alors:
            if (files.photo) {
                post.photo.data = fs.readFileSync(files.photo.path)
                post.photo.contenType = files.photo.type
            }
            //Ensuite on sauvegarde notre post en vérifiant si y a pas d'erreurs
            post.save((err, result) => {
                if (err) {
                    if (err['errors']['title']) return res.status(400).json({error: err['errors']['title']['message']})
                    if (err['errors']['body']) return res.status(400).json({error: err['errors']['body']['message']})
                } else {
                    res.json({result})
                }
            })
        })
    },

    //Cette méthode permet de comparer les diiférents id entre celui qui est dans le token et celui qui est dans l'objet Post
    isPoster: (req, res, next) => {
        let isPoster = req.post && req.auth && req.post.postedBy._id == req.auth._id
        if (!isPoster){
            return res.status(403).json({
                error: 'L\'utilisateurs n\'est pas autorisé à faire ça'
            })
        }
        next()
    },

    //Cette méthode permet de modifier le post selon l'id soumis dans l'url
    updatePost: (req, res) => {
        let post = req.post
        post = _.extend(post, req.body)
        post.updatedAt = Date.now()
        post.save(err => {
            if (err) {
                return res.status(400).json({
                    error: err
                })
            }
            res.json( post )
        })
    },

    //Cette méthode permet de supprimé un post selon l'id soumis dans l'url
    deletePost: (req, res) => {
        let post = req.post
        post.remove((err, post) => {
            if (err) {
                return res.status(400).json({
                    error: err
                })
            }
            res.json({
                message: 'Le post a bien été supprimé'
            })
        })
    },
}
