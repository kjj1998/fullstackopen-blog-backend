const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const middleware = require('../utils/middleware')
const mongoose = require('mongoose')

/* HTTP GET request to retrieve all the blogs from the database */
blogsRouter.get('/', async (request, response, next) => {
	try {
		const blogs = await Blog.find({}).populate('user', {username: 1, name: 1, id: 1})		// find all blogs and populate the user references with the details of the user
		response.json(blogs)
	} catch(exception) {
		next(exception)
	}
})

/* HTTP POST request to add a new blog to the database */
blogsRouter.post('/', middleware.userExtractor, async (request, response, next) => {
	try {
		const body = request.body
		const user = request.user

		/* error handling for missing url or title */
		if (!body.url || !body.title) {
			return response.status(400).send({ error: 'title or url missing ' })
		}

		const blog = new Blog({
			title: body.title,
			author: body.author,
			url: body.url,
			likes: body.likes,
			user: user._id
		})
		
		let savedBlog = await blog.save()		// save the new blog to the database
		user.blogs = user.blogs.concat(savedBlog._id)	// add the id of the newly saved blog to the user who created it
		await user.save()		// save the updated user to the db
		savedBlog = await Blog.find({ _id: mongoose.Types.ObjectId(savedBlog.id) }).populate('user', {username: 1, name: 1, id: 1})	
		
		response.status(200).json(savedBlog[0])
	} catch(exception) {
		next(exception)
	}
})

/* HTTP DELETE request to delete a blog from the database */
blogsRouter.delete('/:id', middleware.userExtractor, async (request, response, next) => {
	try {
		
		const blog = await Blog.findById(request.params.id)
		const user = request.user

		/* check if the user id from the blog object is equal to the id of the user object */
		if (blog.user.toString() !== user._id.toString()) {
			return response.status(401).json({ error: 'only the creator can delete blogs' })
		}

		await Blog.findByIdAndDelete(request.params.id)		// delete blog from database
		user.blogs = user.blogs.filter(b => b.toString() !== request.params.id)		// filter out the blog that was deleted from the user's blog references
		await user.save()		// save user with the updated blog references
		
		response.status(204).end()
	} catch(exception) {
		next(exception)
	}
})

/* HTTP PUT request to update the details of a blog*/
blogsRouter.put('/:id', async (request, response, next) => {
	try {
		const blog = request.body
		//console.log(blog)
		const updated = await Blog.findByIdAndUpdate(request.params.id, blog, { new : true })		// find blog by its id and update it
		response.status(200).json(updated)
	} catch(exception) {
		next(exception)
	}
})

module.exports = blogsRouter