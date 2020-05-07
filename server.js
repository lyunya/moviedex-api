require('dotenv').config();
const express = require("express")
const morgan = require("morgan")
const cors = require('cors')
const helmet = require('helmet')
const MOVIEDEX = require('./moviedex.json')

const app = express()

const morganSetting = process.env.NODE_END === "production" ? "tiny" : "common";
app.use(morgan(morganSetting))
app.use(helmet())
app.use(cors())

app.use(function validateBearerToken(req, res, next){
    const authToken = req.get('Authorization')
    const apiToken = process.env.API_TOKEN;

    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({ error: 'Unauthorized request' })
    }
    //move to next middleware
    next()
})

app.get('/movie', function handleGetMovies(req, res){
    let response = MOVIEDEX;

    //filter out movies by genre if genre query param is present
    if(req.query.genre){
        response = response.filter(movie => 
         movie.genre.toLowerCase().includes(req.query.genre.toLowerCase())
        )
    }

    //filter out movies by country if country param is present
    if (req.query.country) {
      response = response.filter((movie) =>
        movie.country.toLowerCase().includes(req.query.country.toLowerCase())
      )
    }

    //filter movies by greater than or equal to avg_vote if avg_vote is present
        if (req.query.avg_vote) {
          response = response.filter((movie) =>
            Number(movie.avg_vote) >= Number(req.query.avg_vote)
          )
        }

    res.json(response)
})

// 4 parameters in middleware, express knows to treat this as error handler
app.use((error, req, res, next) => {
  let response
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }}
  } else {
    response = { error }
  }
  res.status(500).json(response)
})

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
