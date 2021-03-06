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
            .populate('comments.postedBy', '_id name')
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
            .populate('comments', 'text createdAt')
            .populate('comments.postedBy', '_id name')
            //Ici on sélectionne ce que l'on veut voir du post
            .select('title body createdAt likes')
            //On fait une demande de classement
            .sort({ createdAt: -1 })
            .then(posts => {
                res.status(200).json( posts )
            })
            .catch(err => {
                res.status(404).json({ error: err })
            })

    },

    //Cette méthode nous permet de récup la photo propre au post
    postPhoto: (req, res, next) => {
        res.set("Content-Type", req.post.photo.contenType)
        return res.send(req.post.photo.data)
    },

    //Cette méthode permet de récupérer les post selon l'i dde l'utilisateurs soumis dans l'url
    getPostByUser: (req, res) => {
        Post.find({ postedBy: req.profile._id })
            .populate('postedBy', '_id name')
            //Ici on sélectionne ce que l'on veut voir du post
            .select('title body createdAt likes')
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
    updatePost: (req, res, next) => {
        let form = new formidable.IncomingForm()
        form.keepExtensions = true
        form.parse(req, (err, fields, files) => {
            if (err) {
                return res.status(400).json({
                    error: 'Image ne peut être upload'
                })
            }
            //On sauvegarde le post
            let post = req.post
            post = _.extend(post, fields)//On definit que user est une mutation qui prend en compte le req.profile et ce qu'il y aura dans les champs de formulaire
            post.updatedAt = Date.now()//On établit la valeur de updatedAt dans la BDD

            if (files.photo) {
                post.photo.data = fs.readFileSync(files.photo.path)
                post.photo.contentType = files.photo.type
            }

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

    //Méthode pour récup un seul post
    getUniquePost: (req, res) => {
        return res.json(req.post)
    },

    //Méthode pour rajouter un like en bdd
    like: (req, res) => {
        //On cherche le post par son id puis on l'update
        Post.findByIdAndUpdate(
            req.body.postId,
            //On précise ce que l'on update et qu'on fait un rajout
            { $push: { likes: req.body.userId } },
            {new: true }
            //On exécute la requete
            ).exec((err, result) => {
                if (err) {
                    return res.status(400).json({
                        error: err
                    })
                } else {
                    return res.json(result);
                }
        })
    },

    //Méthode pour enlever le like de l'user
    unlike: (req, res) => {
        //On cherche le post par son id puis on l'update
        Post.findByIdAndUpdate(
            req.body.postId,
            //On précise ce que l'on update et que l'on supprime
            { $pull: { likes: req.body.userId } },
            {new: true }
            //On exécute la requête
        ).exec((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                })
            } else {
                return res.json(result);
            }
        })
    },

    //Méthode pour ajout un commentaire par rapport au post
    comment: (req,res) => {
        let comment = req.body.comment
        comment.postedBy = req.body.userId

        Post.findByIdAndUpdate(
            req.body.postId,
            { $push: { comments: comment }},
            {new: true}
        )
            .populate('comments.postedBy', '_id name')
            .populate('postedBy', '_id name')
            .exec((err, result) => {
                if (err) {
                    res.status(400).json({
                        error: err
                    })
                } else {
                    return res.json(result)
                }
            })
    },

    //Méthode pour supprimer le commentaire
    uncomment: (req,res) => {
        let comment = req.body.comment

        Post.findByIdAndUpdate(
            req.body.postId,
            { $pull: { comments: { _id: comment._id } }},
            {new: true}
        )
            .populate('comments.postedBy', '_id name')
            .populate('postedBy', '_id name')
            .exec((err, result) => {
                if (err) {
                    res.status(400).json({
                        error: err
                    })
                } else {
                    return res.json(result)
                }
            })
    },
}
