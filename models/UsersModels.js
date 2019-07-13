//Le package qui permet de configurer notre modèle
const mongoose = require('mongoose');
//Package qui permet d'encrypter le mot de passe
const bcrypt = require('bcryptjs');
//Nos constantes qui permet de faire une validation des champs
const { nameValidate, emailValidate } = require('../Validator/UsersValidate')

//Nous construisons notre modèle Users
const usersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Le nom est requis'],
        validate: nameValidate,
    },
    email: {
        type: String,
        required: [true, 'L\'email est requis'],
        validate: emailValidate
    },
    hashed_password: {
        type: String,
        required: [true, 'Avec un mot de passe c\'est mieux quand même!']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: Date
})

//On créer un nom virtual que l'on devra remettre pour le champs a chaque fois
usersSchema.virtual('password')
    //Nous configurons le fait d'encrypter la valeur du champs
    .set(function(clean_password) {
        this._password = clean_password;
        //On fait appel à la méthode d'encryptage
        this.hashed_password = this.encryptPassword(clean_password);
    })
    //Voici ce que ça nosu retourne quand on veut récupérer le mot de passe
    .get(function() {
        return this._password;
    });

usersSchema.methods = {

    //On fait la verification
    authenticate: function (plainPassword) {
        return bcrypt.compareSync(plainPassword, this.hashed_password);
    },

    //On encrypt le mot de passe
    encryptPassword: function (password) {
        if (!password)
            return '';

        return bcrypt.hashSync(password, 10);
    }
}


module.exports = mongoose.model("Users", usersSchema)