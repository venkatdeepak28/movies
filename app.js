const express = require('express')
const app = express()

const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initalizeDbandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Connected')
    })
  } catch (e) {
    console.log(`connection Error: ${e.message}`)
    process.exit(1)
  }
}

module.exports = app

initalizeDbandServer()

let convertArrayObj = returnObject => {
  return {
    movieId: returnObject.movie_id,
    directorId: returnObject.director_id,
    movieName: returnObject.movie_name,
    leadActor: returnObject.lead_actor,
    directorName: returnObject.director_name,
  }
}

let onlyMovieList = givenValue => {
  return {
    movieName: givenValue.movie_name,
  }
}

// API 1

app.get('/movies/', async (request, response) => {
  const getQueryValue = `SELECT * FROM movie`
  let returnValue = await db.all(getQueryValue)
  response.send(returnValue.map(eachPlayer => onlyMovieList(eachPlayer)))
})

//API 2

app.post('/movies/', async (request, response) => {
  let {directorId, movieName, leadActor} = request.body
  const postQueryValue = `INSERT INTO movie(director_id,movie_name,lead_actor)
    VALUES (${directorId},"${movieName}","${leadActor}");`
  let postedValue = await db.run(postQueryValue)
  response.send('Movie Successfully Added')
})

// API 3

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const singleQueryValue = `SELECT * FROM movie WHERE movie_id = ${movieId};`
  let getSingleValue = await db.all(singleQueryValue)
  response.send(convertArrayObj(getSingleValue[0]))
})

// API 4

app.put('/movies/:movieId', async (request, response) => {
  let {movieId} = request.params
  let {directorId, movieName, leadActor} = request.body
  const updateQueryValue = `UPDATE movie SET director_id = ${directorId},movie_name = "${movieName}",lead_actor = "${leadActor}" WHERE movie_id = ${movieId};`
  await db.run(updateQueryValue)
  response.send('Movie Details Updated')
})

// API 5

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteQueryValue = `DELETE FROM movie WHERE movie_id = ${movieId};`
  await db.run(deleteQueryValue)
  response.send('Movie Removed')
})

// API 6

app.get('/directors/', async (request, response) => {
  const getQueryValue = `SELECT * FROM director`
  let returnValue = await db.all(getQueryValue)
  response.send(returnValue.map(eachMovie => convertArrayObj(eachMovie)))
})

// API 7

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirectorQuery = `SELECT * FROM movie WHERE director_id = ${directorId};`
  let directorArray = await db.all(getDirectorQuery)
  response.send(directorArray.map(eachMovie => onlyMovieList(eachMovie)))
})
