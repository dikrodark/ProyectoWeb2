const express = require('express');
const router = express.Router();
const db = require('../db/conexion');


function verificarLogin(req, res, next) {
    if (!req.session.usuario) {
        return res.redirect('/');
    }
    next();
}

// Login
router.get('/', (req, res) => {
    res.render('login', { error: null });
});

router.post('/login', (req, res) => {
    const { correo, contraseña } = req.body;

    const consulta = "SELECT * FROM usuarios WHERE correo = ?";
    db.query(consulta, [correo], (err, results) => {
        if (err) return res.render("login", { error: "Error interno del servidor." });

        if (results.length === 0) {
            return res.render("login", { error: "Correo o contraseña incorrectos." });
        }

        const user = results[0];

        if (user.contraseña !== contraseña) {
            return res.render("login", { error: "Correo o contraseña incorrectos." });
        }

        req.session.usuario = user;
        res.redirect('/libros');
    });
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = { router, verificarLogin };
