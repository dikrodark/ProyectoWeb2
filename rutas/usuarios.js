const express = require('express');
const router = express.Router();
const db = require('../db/conexion');


router.get('/agregar', (req, res) => {
    res.render('usuario');
});

router.post('/guardar', (req, res) => {
    const { nombre, correo, contrasena } = req.body;

    db.query(
        "INSERT INTO usuarios (nombre, correo, contraseña) VALUES (?, ?, ?)",
        [nombre, correo, contrasena],
        (err) => {
            if (err) throw err;
            res.redirect('/libros');
        }
    );
});

module.exports = router;
