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

module.exports = {
	dummy,
	totalLikes
}