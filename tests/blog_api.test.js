const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const api = supertest(app)

beforeEach(async () => {
	await Blog.deleteMany({})
	const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
	const promiseArray = blogObjects.map(blog => blog.save())
	await Promise.all(promiseArray)
})

test('verify the number of blogs are returned correctly', async () => {
	const response = await api.get('/api/blogs')

	expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('verify the unique identifier property of the blog posts is named id', async () => {
	const response = await api.get('/api/blogs')

	expect(response.body[0].id).toBeDefined()
})


test('verify that a new blog post is successfully created', async () => {
	
	const newBlog = { title: 'willremovethissoon', 
										author: 'John Doe', 
										url: 'http://noblog.com', 
										likes: 32 
									}
	
	await api
	  .post('/api/blogs')
		.send(newBlog)
		.expect(201)
		.expect('Content-Type', /application\/json/)
				
	const blogsAtEnd = await helper.blogsInDb()
	expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

	const contents = blogsAtEnd.map(n => n.title)
	expect(contents).toContain('willremovethissoon')
})

test('verify that if the likes property is missing from the request, it will default to 0', async () => {
	const newBlog = { title: 'willremovethissoon', 
										author: 'John Doe', 
										url: 'http://noblog.com' 
									}
	
	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(201)
		.expect('Content-Type', /application\/json/)

		const blogsAtTheEnd = await helper.blogsInDb()
		const newlyAddedBlog = blogsAtTheEnd.find(blog =>
			blog.title === 'willremovethissoon'
		)

		expect(newlyAddedBlog.likes).toBe(0)
})

test('verify that if the title and url properties are missing from the request data, responds with status code 400 Bad Request', async () => {
	const newBlog = { 
										author: 'John Doe', 
										likes: 21 
									}
	
	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(400)
})

afterAll(() => {
	mongoose.connection.close()
})