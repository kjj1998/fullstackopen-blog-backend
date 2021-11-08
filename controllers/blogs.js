const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response, next) => {
	try {
		const blogs = await Blog.find({}).populate('user', {username: 1, name: 1, id: 1})
		response.json(blogs)
	} catch(exception) {
		next(exception)
	}
})

blogsRouter.post('/', async (request, response, next) => {
	try {
		const body = request.body
		/*
		const decodedToken = jwt.verify(request.token, process.env.SECRET)
		if (!decodedToken || !decodedToken.id) {
			return response.status(401).json({ error: 'token missing or invalid' })
		}
		*/
		const user = request.user
		console.log(user)

		const blog = new Blog({
			title: body.title,
			author: body.author,
			url: body.url,
			likes: body.likes,
			user: user._id
		})
		
		const savedBlog = await blog.save()
		user.blogs = user.blogs.concat(savedBlog._id)
		await user.save()
		
		response.status(200).json(savedBlog)
	} catch(exception) {
		next(exception)
	}
})

blogsRouter.delete('/:id', async (request, response, next) => {
	try {

		const decodedToken = jwt.verify(request.token, process.env.SECRET)
		if (!decodedToken || !decodedToken.id) {
			return response.status(401).json({ error: 'token missing or invalid' })
		}
		const blog = await Blog.findById(request.params.id)

		if (blog.user.toString() === decodedToken.id.toString()) {
			await Blog.findByIdAndDelete(params.request.id)
		} else {
			return response.status(401).json({ error: 'wrong user' })
		}

		response.status(204).end()
	} catch(exception) {
		next(exception)
	}
})

blogsRouter.put('/:id', async (request, response, next) => {
	try {
		const blog = request.body
		const updated = await Blog.findByIdAndUpdate(request.params.id, blog, { new : true })
		response.status(200).json(updated)
	} catch(exception) {
		next(exception)
	}
})

module.exports = blogsRouter