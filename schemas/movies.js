const z = require('zod');

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'El título de la película debe ser una cadena',
    required_error: 'Se requiere título',
  }),
  year: z.number().int().min(1900).max(2025),
  director: z.string(),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10).default(5),
  poster: z.string().url({
    message: 'El enlace del poster debe ser una URL válida',
  }), // valida que sea una URL
  genre: z.array(
    z.enum([
      'Action',
      'Adventure',
      'Comedy',
      'Drama',
      'Fantasy',
      'Horror',
      'Musical',
      'Romance',
      'Sci-Fi',
      'Thriller',
    ]),
    {
      required_error: 'Se requiere género',
      invalid_type_error: 'El género debe ser una lista de cadenas',
    }
  ),
});

function validateMovie(object) {
  return movieSchema.safeParse(object); // safeParse devuelve un objeto o un error o datos
}

function validateParcialMovie(object) {
  return movieSchema.partial().safeParse(object);
  // partial() todos las propiedades de schema son opcionales
}
module.exports = {
  validateMovie,
  validateParcialMovie,
};


