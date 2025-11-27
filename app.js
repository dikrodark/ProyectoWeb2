const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const app = express();

// Configuración
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.set('view engine', 'ejs');

// Sesiones
app.use(session({
    secret: 'secreto123',
    resave: false,
    saveUninitialized: true
}));

// Conexión MySQL
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Nidi0301',
    database: 'ProyectoWeb2',
    port: 3306
});

db.connect(err => {
    if (err) console.error('Error en la conexión', err);
    else console.log('Conexión correcta a MySQL');
});

// Middleware para proteger rutas
function verificarLogin(req, res, next) {
    if (!req.session.usuario) {
        return res.redirect('/');
    }
    next();
}

//
// ==========================
//          LOGIN
// ==========================
//

// Mostrar login SIEMPRE enviando la variable error
app.get('/', (req, res) => {
    res.render('login', { error: null });
});

// Procesar login
app.post('/login', (req, res) => {
    const { correo, contraseña } = req.body;

    const consulta = "SELECT * FROM usuarios WHERE correo = ?";
    db.query(consulta, [correo], (err, results) => {
        if (err) {
            return res.render("login", { error: "Error interno del servidor." });
        }

        if (results.length === 0) {
            return res.render("login", { error: "Correo o contraseña incorrectos." });
        }

        const user = results[0];

        if (user.contraseña !== contraseña) {
            return res.render("login", { error: "Correo o contraseña incorrectos." });
        }

        // Login correcto
        req.session.usuario = user;
        res.redirect('/libros');
    });
});

// Cerrar sesión
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

//
// ==========================
//       CRUD LIBROS
// ==========================
//

// Mostrar tabla + edición en la misma vista
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

// Redirige a edición
app.get('/edit/:id', verificarLogin, (req, res) => {
    res.redirect(`/libros?editId=${req.params.id}`);
});

// Guardar cambios
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

//
// ==========================
//       CRUD USUARIOS
// ==========================
//

// Vista para agregar usuario
app.get('/usuarios/agregar', verificarLogin, (req, res) => {
    res.render('usuario');
});

// Guardar usuario
app.post('/usuarios/guardar', verificarLogin, (req, res) => {
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

// ==========================
//         SERVIDOR
// ==========================

const port = 3008;
app.listen(port, () => {
    console.log(`Servidor en http://localhost:${port}`);
});
