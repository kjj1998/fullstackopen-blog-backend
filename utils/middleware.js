const logger = require('./logger')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

/* middleware modules */

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

/* middleware to extract the authentication token*/
const tokenExtractor = (request, response, next) => {
	const authorization = request.get('authorization')

	/* check if token is not undefined and it begins with 'bearer' */
	if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
		request.token = authorization.substring(7)
	} else {
		request.token = null
	}

	next()
}

/* middleware to extract the user token */
const userExtractor = async (request, response, next) => {
	//console.log(request.token)
	if (request.token) {
		const decodedToken = jwt.verify(request.token, process.env.SECRET)	// verify authentication token
	
		request.user = await User.findById(decodedToken.id)		// find user by id
	} else {
		return response.status(401).json({ error: 'token missing or invalid' })
	}
	
	next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

/* middlware to handle error */
const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token'
    })
  }

	logger.error(error.message)

  next(error)
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
	tokenExtractor,
	userExtractor
}