var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// ==========================================================
// Busqueda por colección
// ==========================================================

app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {

        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;

        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;

        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son: usuarios, hospitales y medicos',
                err: { message: 'Tipo de tabla/coleccion no válida' }
            });
    }

    promesa.then(data => {
        res.status(400).json({
            ok: true,
            [tabla]: data

        });
    });
});



// ==========================================================
// Busqueda general
// ==========================================================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
        buscarHospitales(busqueda, regex), // Posicion 0
        buscarMedicos(busqueda, regex), // Posicion 1
        buscarUsuarios(busqueda, regex) // Posicion 2
    ]).then(respuesta => {

        res.status(200).json({
            ok: true,
            hospitales: respuesta[0],
            medicos: respuesta[1],
            usuarios: respuesta[2]
        });

    })

});


function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            // .populate('medico')
            .exec((err, hospitales) => {

                if (err) {

                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {

                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuario) => {

                if (err) {
                    reject('Error al cargar Usuarios', err);
                } else {
                    resolve(usuario);
                }

            })
    });
}

module.exports = app;