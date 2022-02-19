const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  if (blogs) {
    response.json(blogs)
  } else {
    response.status(404).end()
  }
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body
  const user = request.user

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user
  })

  if (blog.title === undefined || blog.author === undefined) {
    response.status(400).end()
  } else {
  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  
  response.json(savedBlog)  
  response.status(201).end()
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  const user = request.user
  if (blog.user.toString() === user.id.toString()) {
    const deletedBlog = await Blog.findByIdAndRemove(request.params.id)
    response.json(deletedBlog)
    response.status(204).end()
  } else {
    response.status(400).json({ error: 'User cannot delete.' })
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    website: body.website,
    likes: body.likes,
    user: body.user
  }

  await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  await response.status(204).end()
})

module.exports = blogsRouter