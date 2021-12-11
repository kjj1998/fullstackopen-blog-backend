const mongoose = require('mongoose')

/* mongoose schema for the blog */
const blogSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	author: {
		type: String,
		required: true,
	},
	url: {
		type: String,
		required: true
	},
	likes: {
		type: Number,
		default: 0
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	comments: [
		{
			type: String
		}
	]
})

/* Transform data retrieved from the db*/
blogSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
	}
})

module.exports = mongoose.model('Blog', blogSchema)