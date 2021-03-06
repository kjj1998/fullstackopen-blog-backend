const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const api = supertest(app)
const bcrypt = require('bcrypt')
const User = require('../models/user')
let token

beforeEach(async () => {
	await User.deleteMany({})
	const passwordHash = await bcrypt.hash('secret', 10)
	const user = new User({ username: 'root', passwordHash })
	const blogIds = helper.initialBlogs.map(blog => mongoose.Types.ObjectId(blog._id))
	user.blogs = blogIds
	await user.save()

	const blogsToBeAdded = helper.initialBlogs.map(blog =>  {
		blog.user = user._id
		return blog
	})
	
	await Blog.deleteMany({})
	await Blog.insertMany(blogsToBeAdded)
	
	const testUser = {
		username: "root",
		password: "secret"
	}								

	const response = await api
	 .post('/api/login')
	 .send(testUser)
	
	token = response.body.token 
})

describe('when there is initially some blogs saved', () => {
	test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
	
	test('all blogs are returned', async () => {
		const response = await api.get('/api/blogs')
		expect(response.body).toHaveLength(helper.initialBlogs.length)
	})
	
	test('the unique identifier property of the blog posts is named id', async () => {
		const response = await api.get('/api/blogs')
		response.body.map(blog => expect(blog.id).toBeDefined)
	})
})

describe('addition of a new blog', () => {
	test('succeeds with valid data', async () => {
		const newBlog = { 
			title: 'willremovethissoon', 
			author: 'John Doe', 
			url: 'http://noblog.com', 
			likes: 32 
		}

		await api
			.post('/api/blogs')
			.set('authorization', `bearer ${token}`)
			.send(newBlog)
			.expect(200)
			.expect('Content-Type', /application\/json/)
					
		const blogsAtEnd = await helper.blogsInDb()
		expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
	
		const contents = blogsAtEnd.map(n => n.title)
		expect(contents).toContain('willremovethissoon')
	})

	test('fails with status code 400 if data invalid', async() => {
		const newBlog = { title: 'willremovethissoon' }

		await api
			.post('/api/blogs')
			.set('authorization', `bearer ${token}`)
			.send(newBlog)
			.expect(400)

		const blogsAtEnd = await helper.blogsInDb()
		expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
	})
	test('fails with status code 401 Unauthorized if a token is not provided', async() => {
		const newBlog = { 
			title: 'willremovethissoon', 
			author: 'John Doe', 
			url: 'http://noblog.com', 
			likes: 32 
		}

		await api
			.post('/api/blogs')
			.send(newBlog)
			.expect(401)

		const blogsAtEnd = await helper.blogsInDb()
		expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
	})
})

describe('properties are all there', () => {
	test('if the likes property is missing from the request, it will default to 0', async () => {
		const newBlog = { 
			title: 'willremovethissoon', 
			author: 'John Doe', 
			url: 'http://noblog.com' 
		}
		
		await api
			.post('/api/blogs')
			.set('authorization', `bearer ${token}`)
			.send(newBlog)
			.expect(200)
			.expect('Content-Type', /application\/json/)
	
		const blogsAtTheEnd = await helper.blogsInDb()
		const newlyAddedBlog = blogsAtTheEnd.find(blog =>
			blog.title === 'willremovethissoon'
		)
	
		expect(newlyAddedBlog.likes).toBe(0)
	})
	test.only('if the title and url properties are missing from the request data, responds with status code 400 Bad Request', async () => {
		const newBlog = { 
			author: 'John Doe', 
			likes: 21 
		}
		
		await api
			.post('/api/blogs')
			.set('authorization', `bearer ${token}`)
			.send(newBlog)
			.expect(400)
	})
})

describe.only('deletion of a blog', () => {
	test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
			.set('authorization', `bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    )

    const titles = blogsAtEnd.map(r => r.title)

    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('updating of properties', () => {
	test('succeeds with status code 200 if number of likes is updated correctly', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
		const originalLikes = blogToUpdate.likes
		blogToUpdate.likes += 1


    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
			.send(blogToUpdate)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()

    const blogThatIsUpdated = blogsAtEnd.find(blog => blog.id === blogToUpdate.id)

    expect(blogThatIsUpdated.likes).toBe(originalLikes + 1)
  })
})

afterAll(() => {
	mongoose.connection.close()
})