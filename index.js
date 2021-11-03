const http = require('http')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const logger = require('./utils/logger')
const config = require('./utils/config')
const blogsRouter = require('./controllers/blogs')

const app = express()
const mongoUrl = 'mongodb+srv://admin:fullstackopen2021@mycluster.xnorb.mongodb.net/favorite?retryWrites=true&w=majority'
mongoose.connect(mongoUrl)

app.use(cors())
app.use(express.json())
app.use('/api/blogs', blogsRouter)

app.listen(config.PORT, () => {
	logger.info(`Server running on port ${config.PORT}`)
})