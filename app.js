const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('view engine', 'ejs');


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// Rutas
const db = require('./db/conexion');
const { router: authRouter, verificarLogin } = require('./rutas/login');
const usuariosRouter = require('./rutas/usuarios');

// Rutas
app.use('/', authRouter);
app.use('/usuarios', verificarLogin, usuariosRouter);



// Mostrar tabla
app.get('/libros', verificarLogin, (req, res) => {
    const { editId } = req.query;

    db.query("SELECT * FROM libros", (err, libros) => {
        if (err) throw err;

        if (editId) {
            const consultaId = "SELECT * FROM libros WHERE id = ?";
            db.query(consultaId, [editId], (err, result) => {
                if (err) throw err;
                res.render('index', { libros, editBook: result[0] });
            });
        } else {
            res.render('index', { libros, editBook: null });
        }
    });
});


// Agregar libro
app.post('/add', verificarLogin, (req, res) => {
    const { nombre, autor, editorial, precio } = req.body;
    db.query(
        "INSERT INTO libros (nombre, autor, editorial, precio) VALUES (?, ?, ?, ?)",
        [nombre, autor, editorial, precio],
        (err) => {
            if (err) throw err;
            res.redirect('/libros');
        }
    );
});


// Actualizar libro
app.get('/edit/:id', verificarLogin, (req, res) => {
    res.redirect(`/libros?editId=${req.params.id}`);
});


app.post('/update/:id', verificarLogin, (req, res) => {
    const { nombre, autor, editorial, precio } = req.body;
    db.query(
        "UPDATE libros SET nombre=?, autor=?, editorial=?, precio=? WHERE id=?",
        [nombre, autor, editorial, precio, req.params.id],
        (err) => {
            if (err) throw err;
            res.redirect('/libros');
        }
    );
});

// Eliminar libro
app.get('/delete/:id', verificarLogin, (req, res) => {
    db.query("DELETE FROM libros WHERE id=?", [req.params.id], (err) => {
        if (err) throw err;
        res.redirect('/libros');
    });
});


const PORT = process.env.PORT || 3008;
app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});
