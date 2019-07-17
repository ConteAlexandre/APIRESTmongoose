//On utilise le package express pour définir des routes qui sont propres à l'utilisateur
const express = require('express');
//On fait appel a notre countroller pour utiliser les bonnes méthodes sur les différentes routes
const  Auth  = require('../controllers/AuthController');
const User = require('../controllers/UserController');
const  { requireSignin }  = require('../controllers/AuthController');


//On utilise ici une méthode du package
const router = express.Router();

//Les routes en get
router.get('/users/', User.getAllUsers); //Route pour récupérer tout les utilisateurs
router.get('/profile/:userId/', requireSignin, User.getOneUser); //Route donnant le profil d'un seul utilisateur
router.get('/signout/', Auth.signout); //Route pour se déconnecter en vidant les cookies
router.get('/user/photo/:userId', User.userPhoto)

//Les routes en POST
router.post('/signup/', Auth.signup); //Route pour s'inscrire
router.post('/signin/', Auth.signin); //route pour se connecter

//Les routes en PUT
router.put('/user/edit/:userId/', requireSignin, User.hasauthorization, User.updateUser); //Modif le profil de l'utilisateur
router.put('/user/follow', requireSignin, User.addFollowing, User.addFollowers)
router.put('/user/unfollow', requireSignin, User.removeFollowing, User.removeFollowers)

//Les routes en DELETE
router.delete('/user/delete/:userId', requireSignin, User.deleteUser); //Supprimer définitivement un utilisateur

//Les paramètres prédifinis sur les routes
router.param('userId', User.UserById);



module.exports = router
