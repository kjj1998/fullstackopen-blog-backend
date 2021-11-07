const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const api = supertest(app)
const bcrypt = require('bcrypt')
const User = require('../models/user')

describe('when there is initially one user in db', () => {
	beforeEach(async () => {
		await User.deleteMany({})
	
		const passwordHash = await bcrypt.hash('secret', 10)
		const user = new User({ username: 'root', passwordHash })
	
		await user.save()
	})
	
	test('creation succeeds with a fresh username', async () => {
		const usersAtStart = await helper.usersInDb()

		const newUser = {
			username: 'kjj',
			name: 'Koh Jun Jie',
			password: 'jjkoh'
		}

		await api
			.post('/api/users')
			.send(newUser)
			.expect(200)
			.expect('Content-Type', /application\/json/)

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

		const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
	})

	
	test('creation fails with proper statuscode and message if username already taken', async () => {
		const usersAtStart = await helper.usersInDb()

		const newUser = {
			username: 'root',
			name: 'Superuser',
			password: 'secret',
		}

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)

		expect(result.body.error).toContain('`username` to be unique')

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toHaveLength(usersAtStart.length)
	})
	
	test('creation fails with proper statuscode and message if password less than three characters', async () => {
		const usersAtStart = await helper.usersInDb()

		const newUser = {
			username: 'hello',
			name: 'Superuser',
			password: 'ab'
		}

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)

		expect(result.body.error).toContain('password less than 3 characters long')

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toHaveLength(usersAtStart.length)
	})

	test('creation fails with proper statuscode and message if username less than three characters', async () => {
		const usersAtStart = await helper.usersInDb()

		const newUser = {
			username: 'hi',
			name: 'Superuser',
			password: 'abcdefg'
		}

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)

		expect(result.body.error).toContain('shorter than the minimum allowed length (3)')

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toHaveLength(usersAtStart.length)
	})

	test('creation fails with proper statuscode and message if username not given', async () => {
		const usersAtStart = await helper.usersInDb()

		const newUser = {
			name: 'Superuser',
			password: 'abcdefg'
		}

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)

		expect(result.body.error).toContain('`username` is required')

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toHaveLength(usersAtStart.length)
	})

	test('creation fails with proper statuscode and message if password not given', async () => {
		const usersAtStart = await helper.usersInDb()

		const newUser = {
			username: 'user1',
			name: 'Superuser'
		}

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)

		expect(result.body.error).toContain('password is not given')

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toHaveLength(usersAtStart.length)
	})
})

afterAll(() => {
	mongoose.connection.close()
})