import bodyParser from "body-parser";
import express from "express";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";

const app = express();

const validarToken = (req, res, nex) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer  ")) {
      return res.json({ mensaje: "Solicitud sin token" });
    }
    const token = authHeader.split("  ")[1];
    const decode = jwt.verify(token, 'secret');
    nex();
  } catch (error) {
    return res.json({ 'mensaje': "Token invalido o Expiro" });
  }
};

const validarTokenRefresh = (req,res,nex) =>{
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer  ")) {
            return res.json({ mensaje: "Solicitud sin Refreshtoken" });
        }
        const token = authHeader.split("  ")[1];
        const decode = jwt.verify(token, 'secretrefreshToken');
        nex();
    } catch (error) {
        return res.json({ 'mensaje': "RefreshToken invalido" });
    }
}

app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true }));

//Rutas
/**Validamos el ingreso del usuario */
app.post("/login", async (req, res) => {
  const correo = req.body.correo;
  const contrasena = req.body.contrasena;
  const [rows] = await connection.query(
    "select *from usuarios where correo = ?",
    [correo]
  );
  console.log(rows[0].contrasena);

  const esValido = await bcrypt.compare(contrasena, rows[0].contrasena);
  if (esValido) {
    const token = generarToken();
    const refresToken = refreshToken();
    const dbRefreshtoken = await connection.query(
      "UPDATE usuarios SET refresToken = ? WHERE correo = ?",
      [refresToken, correo]
    );
    return res.json({
      mensaje: "Usuario Autenticado",
      token: token,
      refresToken: refresToken,
    });
  } else {
    const token = generarToken();
    const refresToken = refreshToken();
    return res.json({
      mensaje: "Usuario No Autenticado",
    });
  }
});

/**Registramos el usuario */
app.post("/registro", async (req, res) => {
  const nombre = req.body.nombre;
  const correo = req.body.correo;
  const contrasena = await bcrypt.hash(req.body.contrasena, 10);
  const respuesta = await connection.query(
    "INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)",
    [nombre, correo, contrasena]
  );
  console.log(respuesta);
  return res.json({ registro: "true" });
});

app.get("/privado", validarToken, (req, res) => {
  return res.json({ 'mensaje': "Ingresamos a ruta privada" });
});
app.post('/refrescar',validarTokenRefresh, (req,res)=>{
    return res.json({ 'mensaje': "Ingresamos a ruta refrescar" });
    
})





const connection = await mysql.createConnection({
  host: "localhost",
  user: "login",
  password: "Aprendiz2024",
  database: "node_login",
});

const generarToken = () => {
  return jwt.sign(
    {
      data: "foobar",
    },
    "secret",
    { expiresIn: "5m" }
  );
};

const refreshToken = () => {
  return jwt.sign(
    {
      data: "foobar",
    },
    "secretrefreshToken",
    { expiresIn: "7d" }
  );
};

app.listen(3000);
