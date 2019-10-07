//Package qui nous permet de confgurer notre modèle
const mongoose = require('mongoose');
//Constante nous permettant de faire la relation dans la variable postedBy
const { ObjectId } = mongoose.Schema
//NOs costantes de validations des variables
const { titleValidate, bodyValidate } = require('../Validator/PostsValidate')

//Création du modèle
const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: "Title is required",
        validate: titleValidate
    },
    body: {
        type: String,
        required: "Body is required",
        validate: bodyValidate
    },
    photo: {
        data: Buffer,
        contenType: String
    },
    postedBy: {
        type: ObjectId,
        ref: 'Users'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: Date,
    likes: [{ type: ObjectId, ref: 'Users' }],
    comments: [
        {
            text: String,
            createdAt: {type: Date, default: Date.now},
            postedBy: {type: ObjectId, ref: 'Users'}
        }
    ]
});

module.exports = mongoose.model("Posts", postSchema)