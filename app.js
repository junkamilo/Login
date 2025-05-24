import bodyParser from 'body-parser';
import express from 'express'
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

const app = express();

app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true }));

app.post('/login', async (req, res) => {
    const correo = req.body.correo;
    const contrasena = await bcrypt.hash(req.body.contrasena,10);
    const [rows] = await connection.query("select *from usuarios where correo = ?", [correo]);
    console.log(rows[0].contrasena);

    const esValido = await bcrypt.compare(contrasena, rows[0].contrasena);
    if (esValido) {
        console.log('autenticado');
        
    } else {
        console.log('no autenticado');
        
    }           
  return res.json({'hola': 'mundo'});
});

app.post('/registro', async (req, res) => {
    const nombre = req.body.nombre;
    const correo = req.body.correo;
    const contrasena = await bcrypt.hash(req.body.contrasena,10);
    const respuesta = await connection.query('INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)', [nombre, correo, contrasena]);

    console.log(respuesta);
    return res.json({'registro': 'true'});

});

const connection = await mysql.createConnection({
    host: "localhost",
    user: "login",
    password: "Aprendiz2024",
    database: "node_login"
});

app.listen(3000);
