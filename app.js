const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')
let db = null

const initializeDBServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is Running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBServer()

//GET MOVIES API 1
app.get('/movies/', async (request, response) => {
  const convertDbObjectToResponseObject = dbObject => {
    return {
      movieName: dbObject.movie_name,
    }
  }
  const moviesQuery = `
  SELECT movie_name
  FROM movie`
  const moviesArray = await db.all(moviesQuery)
  response.send(
    moviesArray.map(eachMovie => convertDbObjectToResponseObject(eachMovie)),
  )
})

//ADD MOVIE API 2
app.post('/movies/', async (request, response) => {
  const movieData = request.body
  const {directorId, movieName, leadActor} = movieData
  const movieDataQuery = `
  INSERT INTO
    movie(director_id, movie_name, lead_actor)
  VALUES
    ('${directorId}','${movieName}','${leadActor}');
  `
  const dbResponse = await db.run(movieDataQuery)
  const movieId = dbResponse.lastID
  response.send('Movie Successfully Added')
})

//GET PARTICULAR MOVIE API 3
app.get('/movies/:movieId/', async (request, response) => {
  const getTheResponseObject = dbObject => {
    return {
      movieId: dbObject.movie_id,
      directorId: dbObject.director_id,
      movieName: dbObject.movie_name,
      leadActor: dbObject.lead_actor,
    }
  }
  const {movieId} = request.params
  const getMovieData = `
  SELECT *
  FROM movie
  WHERE movie_id = ${movieId};`
  const movieData = await db.get(getMovieData)
  response.send(getTheResponseObject(movieData))
})

//UPDATE MOVIE API 4
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const updateMovieDetails = `
  UPDATE movie
  SET 
    director_id = '${directorId}',
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
  WHERE movie_id = ${movieId};`
  await db.run(updateMovieDetails)
  response.send('Movie Details Updated')
})

//DELETE MOVIE API 5
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieData = `
  DELETE FROM 
    movie
  WHERE movie_id = ${movieId};`
  await db.run(getMovieData)
  response.send('Movie Removed')
})

//GET DIRECTORS API
app.get('/directors/', async (request, response) => {
  const convertDbObjectToResponseObject = dbObject => {
    return {
      directorId: dbObject.director_id,
      directorName: dbObject.director_name,
    }
  }
  const directorsQuery = `
  SELECT *
  FROM director`
  const directorsArray = await db.all(directorsQuery)
  response.send(
    directorsArray.map(eachDirector =>
      convertDbObjectToResponseObject(eachDirector),
    ),
  )
})

//GET DIRECTOR MOVIES 7
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirectorMovies = `
  SELECT movie_name
  FROM movie
  WHERE director_id = ${directorId};
  `
  const moviesArray = await db.all(getDirectorMovies)
  response.send(moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name })));
})
module.exports = app
