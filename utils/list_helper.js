const _ = require("lodash");

const dummy = (blogs) => {
	return 1
}

const totalLikes = blogs => {
	if (blogs.length === 0)
		return 0
  else if (blogs.length === 1)
		return blogs[0].likes
	
	const reducer = (sum, item) => {
    return sum + item.likes
	}

	return blogs.reduce(reducer, 0)
	
}

const favoriteBlog = blogs => {
	if (blogs.length === 0)
		return {}
  else if (blogs.length === 1)
		return { title: blogs[0].title, author: blogs[0].author, likes: blogs[0].likes }

	
	const mostLikes = Math.max.apply(this, blogs.map(blog => blog.likes))
	const mostLikedBlog = blogs.find(blog => blog.likes === mostLikes)

	return {
		title: mostLikedBlog.title,
		author: mostLikedBlog.author,
		likes: mostLikedBlog.likes
	}
}

const blogs = [
	{
		_id: "5a422a851b54a676234d17f7",
		title: "React patterns",
		author: "Michael Chan",
		url: "https://reactpatterns.com/",
		likes: 7,
		__v: 0,
		user: "6188df204765b7c9be738188"
	},
	{
		_id: "5a422aa71b54a676234d17f8",
		title: "Go To Statement Considered Harmful",
		author: "Edsger W. Dijkstra",
		url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
		likes: 5,
		__v: 0
	},
	{
		_id: "5a422b3a1b54a676234d17f9",
		title: "Canonical string reduction",
		author: "Edsger W. Dijkstra",
		url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
		likes: 11,
		__v: 0
	},
	{
		_id: "5a422b891b54a676234d17fa",
		title: "First class tests",
		author: "Robert C. Martin",
		url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
		likes: 10,
		__v: 0
	},
	{
		_id: "5a422ba71b54a676234d17fb",
		title: "TDD harms architecture",
		author: "Robert C. Martin",
		url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
		likes: 0,
		__v: 0
	},
	{
		_id: "5a422bc61b54a676234d17fc",
		title: "Type wars",
		author: "Robert C. Martin",
		url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
		likes: 12,
		__v: 0
	}  
]

const mostBlogs = blogs => {
	if (blogs.length === 0)
		return {}
	
	const groupByName = _.groupBy(blogs, 'author')

	let author, count = 0
	_.forEach(groupByName, (value, key) => {
		if (value.length > count) {
			author = key
			count = value.length
		}
	})

	return { author: author, blogs: count }
}

const mostLikes = blogs => {
	if (blogs.length === 0)
		return {}
	
	let authorAndLikes = {}
	_.forEach(blogs, (value) => {
		const name = value.author
		
		if (name in authorAndLikes)
			authorAndLikes[name] += value.likes
		else
			authorAndLikes[name] = value.likes	
	})

	let name, count = 0
	_.forEach(authorAndLikes, (value, key) => {
		if (value > count)
			name = key
			count = value
	})
	
	return { author: name, likes: count }
}

module.exports = {
	dummy,
	totalLikes,
	favoriteBlog,
	mostBlogs,
	mostLikes
}