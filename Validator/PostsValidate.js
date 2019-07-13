const validate = require('mongoose-validator');

const titleValidate = [
    validate({
        validator: 'isLength',
        arguments: [4, 12],
        message: 'Le titre doit contenir entre {ARGS[0]} et {ARGS[1]} caractères!'
    }),
]

const bodyValidate = [
    validate({
        validator: 'isLength',
        arguments: [10, 2000],
        message: 'Le body doit contenir entre {ARGS[0]} et {ARGS[1]} caractères!'
    }),
]

module.exports = { bodyValidate, titleValidate }