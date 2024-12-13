const express = require('express');
const crypto = require('node:crypto'); // Utilizamos el módulo crypto para generar hashes
const cors = require('cors');
const movies = require('./movies.json');
const { validateMovie, validateParcialMovie } = require('./schemas/movies');


const app = express();
app.use(express.json()); // usar el middleware de express para parsear JSON
app.disable('x-powered-by'); //Desactiva la cabecera 'X-Powered-By' que por defecto se agrega a todas las respuestas

app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:1234',
      'https://movies.com',
      'https://midu.dev'
    ]

    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
}))

app.get('/movies', (req, res) => {
  //cuando la peticion no es del mismo origin
  // http://localhost:1234 -> http://localhost:1234


  const { genre } = req.query; // Extraemos el género de la query
  if (genre) {
    const mivieFilter = movies.filter((movie) =>
      movie.genre.some((gen) => gen.toLowerCase() === genre.toLowerCase())
    );

    return res.json(mivieFilter);
  }
  res.json(movies);
});

app.get('/movies/:id', (req, res) => {
  //:id -> parametro  de la ruta path=to-regex
  const { id } = req.params; // Extraemos el id de la ruta
  const movie = movies.find((m) => m.id === id);
  if (!movie) {
    res.status(404).json({ message: 'Película no encontrada' });
  }
  res.json(movie);
});

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body);

  if (!result.success) {
    // se puede usar 422 Unprocessable Entity para indicar que el request contiene datos inválidos
    return res.status(402).json({ error: JSON.parse(result.error.message) });
  }

  const newMovie = {
    id: crypto.randomUUID(), // crear un id único para cada película v4
    ...result.data, // copiar los datos del request a un nuevo objeto
  };

  //Esto no seria REST, porque estamos guardando la información en memoria
  movies.push(newMovie);

  res.status(201).json(newMovie);
});

app.patch('/movies/:id', (req, res) => {
  const result = validateParcialMovie(req.body);
  if (!result.success) {
    return restart.status(400).json({ error: JSON.parse(result.error.message) });
  }

  const { id } = req.params; // Extraemos el id de la ruta
  const movieIndex = movies.findIndex((movie) => movie.id === id);
  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Película no encontrada' });
  }

  
  
  const updatedMovie = {
    ...movies[movieIndex],
    ...result.data,

  }

  movies[movieIndex] = updatedMovie

  return res.json(updatedMovie);
});

app.delete('/movies/:id', (req, res) => {


  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  movies.splice(movieIndex, 1)

  return res.json({ message: 'Movie deleted' })
})



const PORT = process.env.PORT ?? 1234;
app.listen(PORT, () => {
  console.log(`Server escuchando en el puerto http://localhost:${PORT}`);
});
