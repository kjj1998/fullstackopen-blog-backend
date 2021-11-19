const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

/* HTTP POST request for a user to login */
loginRouter.post('/', async (request, response) => {
	const body = request.body

	const user = await User.findOne({ username: body.username })		// search for a user using its username
	
	/* check if password is correct by comparing the hashes */
	const passwordCorrect = user === null
		? false
		: await bcrypt.compare(body.password, user.passwordHash)

	
	if (!(user && passwordCorrect)) {
		return response.status(401).json({
			error: 'invalid username or password'
		})
	}

	const userForToken = {
		username: user.username,
		id: user._id,
	}

	const token = jwt.sign(userForToken, process.env.SECRET) // generate token for authentication

	console.log("logged in successfully")
	response
		.status(200)
		.send({ token, username: user.username, name: user.name })
})	

module.exports = loginRouter