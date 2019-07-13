const validate = require('mongoose-validator');

const nameValidate = [
    validate({
        validator: 'isLength',
        arguments: [4, 15],
        message: 'Le name doit contenir entre 4 et 15 caractères'
    }),
    validate({
        validator: 'isAlphanumeric',
        passIfEmpty: true,
        message: 'Il ne doit contenir que des caractères alphanumériques'
    })
]
const emailValidate = [
    validate({
        validator: 'isLength',
        arguments: [4, 50],
        message: 'L\'email doit contenir entre 4 et 50 caractères'
    }),
    validate({
        validator: 'isEmail',
        passIfEmpty: true,
        message: 'Veuillez mettre un email valide'
    }),
]

module.exports = { nameValidate, emailValidate }