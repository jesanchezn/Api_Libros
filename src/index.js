const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
// Middleware de cors y json
app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGODB_URI

try {
    mongoose.connect(mongoUri);
    console.log("Conectado a MongoDB")
} catch (error) {
    console.log("Error de conexion", error)
}

const libroSchema = new mongoose.Schema({
    titulo: String,
    autor: String,
})

const Libro = mongoose.model("Libro", libroSchema);

app.use((req, res, next) => {
    const authToken = req.headers["authorization"];
    // En un escenario real, compararía este token con una base de datos o algún otro sistema de autenticación.
    if (authToken === "Bearer miTokenSecreto123") {
      next(); // Si la autenticación es correcta, permitimos que la solicitud continúe
    } else {
      res.status(401).send("Acceso no autorizado");
    }
  });

//Rutas

//Ruta para crear un nuevo libro
app.post("/libros", async (req, res) => {
    const libro = new Libro({
        titulo: req.body.titulo,
        autor: req.body.autor,
    });

    try {
        await libro.save();
        res.json(libro);
    } catch (error) {
        res.status(500).send("Error al guardar libro");
    }
});

//Ruta para pedir todos los libros
app.get("/libros", async (req, res) => {
    try {
        const libros = await Libro.find();
        res.json(libros)
    } catch (error) {
        res.status(500).send("Error al obtener libros")
    }
});

//Ruta para obtener un libro por su ID
app.get("/libros/:id", async (req, res) => {
    try {
        let id = req.params.id;
        const libro = await Libro.findById(id);

        if (libro) {
            res.json(libro);
        } else {
            res.status(404).send("Libro no encontrado")
        }
    } catch (error) {
        res.status(500).send("Error al buscar el libro", error)
    }
})

  //Ruta para actualizar un libro por su ID
  app.put("/libros/:id", async (req, res) => {
    try {
      const libro = await Libro.findByIdAndUpdate(
        req.params.id,
        {
          titulo: req.body.titulo,
          autor: req.body.autor,
        },
        { new: true } // Esta opción hará que se devuelva el documento actualizado
      );

      if (libro) {
        res.json(libro);
      } else {
        res.status(404).send("Libro no encontrado");
      }
    } catch (error) {
      res.status(500).send("Error al actualizar el libro");
    }
  });

//Ruta para eliminar libros
app.delete("/libros/:id", async (req, res) => {
    try {
      const libro = await Libro.findByIdAndRemove(req.params.id);
      if (libro) {
        res.status(204).send();
      } else {
        res.status(404).send("Libro no encontrado");
      }
    } catch (error) {
      res.status(500).send("Error al eliminar el libro");
    }
  });

app.listen(3000, () => {
    console.log("Servidor ejecutandose en http://localhost:3000/")
});