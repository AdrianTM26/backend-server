var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');

app.post('/', (req, res) => {

    var body = req.body;
    // (err, usuarioDB) Recibe error y una respuesta 
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email', //Borrar del mensaje la palabra EMAIL
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password', //Borrar del mensaje la palabra PASSWORD
                errors: err
            });
        }

        // Crear un token!

        usuarioDB.password = ':)'; //Sirve para no mostrar la contraseña, solo mostrará ":)"

        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //14400 equivalen a 4Horas


        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });
    })

})


module.exports = app;