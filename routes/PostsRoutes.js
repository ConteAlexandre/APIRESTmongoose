//On utilise le package express pour définir des routes qui sont propres à l'utilisateur
const express = require('express');


//On fait appel a notre countroller pour utiliser les bonnes méthodes sur les différentes routes
const  Post  = require('../controllers/PostsController');
const  { requireSignin }  = require('../controllers/AuthController');
const User = require('../controllers/UserController');



//On utilise ici une méthode du package
const router = express.Router();

//Les routes en get
router.get('/posts/', Post.getPost);//On récupère tout les posts
router.get('/posts/by/:userId', requireSignin, Post.getPostByUser); //Récupéré les post selon l'id de l'utilisateurs
router.get('/post/photo/:postId', Post.postPhoto);//Récupe de la photo du post

//Les routes en POST
router.post('/post/create/:userId', requireSignin, Post.createPost);//Création d'un post

//Les routes en PUT
router.put('/post/edit/:postId', requireSignin, Post.updatePost); //Modif le Post

//Les routes en DELETE
router.delete('/post/delete/:postId', requireSignin, Post.isPoster, Post.deletePost)


//Les paramètres prédifinis sur les routes
router.param('userId', User.UserById);
router.param('postId', Post.postById);

module.exports = router
