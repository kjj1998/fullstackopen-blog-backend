const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

/* HTTP POST request to create a user */
usersRouter.post('/', async (request, response, next) => {
	try {
		const body = request.body
		const password = body.password

		/* check if password is given */
		if (password === undefined) {
			return response.status(400).json({ 
				error: 'password is not given' 
			})
		}
		
		/* check if password length is more than 3 */
		if (password.length < 3 ) {
			return response.status(400).json({ 
				error: 'password less than 3 characters long' 
			})
		}

		const saltRounds = 10
		const passwordHash = await bcrypt.hash(body.password, saltRounds)		// hash the password

		const user = new User({
			username: body.username,
			name: body.name,
			passwordHash,
		})

		const savedUser = await user.save()		// save new user into the db

		response.json(savedUser)
  } catch(exception) {
		next(exception)
	}
})

/* HTTP GET request to retrieve user from the db */
usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', { author: 1, title: 1, url: 1, id: 1 })		// retrieve user and populate the blog references with the blog objects
  response.json(users)
})

module.exports = usersRouter