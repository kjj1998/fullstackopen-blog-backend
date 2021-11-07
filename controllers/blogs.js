const blogsRouter = require('express').Router()
const blog = require('../models/blog')
const Blog = require('../models/blog')
const User = require('../models/user')

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

		const user = await User.findOne({})
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
		await Blog.findByIdAndRemove(request.params.id)
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