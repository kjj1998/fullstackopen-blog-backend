const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response, next) => {
	try {
		const body = request.body
		const password = body.password

		if (password === undefined) {
			return response.status(400).json({ 
				error: 'password is not given' 
			})
		}
		
		
		if (password.length < 3 ) {
			return response.status(400).json({ 
				error: 'password less than 3 characters long' 
			})
		}

		const saltRounds = 10
		const passwordHash = await bcrypt.hash(body.password, saltRounds)

		const user = new User({
			username: body.username,
			name: body.name,
			passwordHash,
		})

		const savedUser = await user.save()

		response.json(savedUser)
  } catch(exception) {
		next(exception)
	}
})

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', { author: 1, title: 1, url: 1, id: 1 })
  response.json(users)
})

module.exports = usersRouter