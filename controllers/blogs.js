const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response, next) => {
	
	try {
		const blogs = await Blog.find({})
		response.json(blogs)
	} catch(exception) {
		next(exception)
	}

})

blogsRouter.post('/', async (request, response, next) => {
  
	try {
		const blog = new Blog(request.body)
		const result = await blog.save()
		response.status(200).json(result)
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