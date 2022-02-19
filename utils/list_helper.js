const Blog = require('../models/blog')
const dummy = (blogs) => {
  return 1
}

const initialBlogs = [
  {
    "title": "Test Title",
    "author": "Test Guy",
    "url": "www.google.com",
    "likes": 10
  },
  {
    "title": "Test Title 2",
    "author": "Test Guy 2",
    "url": "www.google.com",
    "likes": 12
  }
]

const newBlog = {
  "title": "New Blog",
  "author": "Test Guy 3",
  "url": "www.google.com",
  "likes": 2
}

const noLikesBlog = {
  "title": "New Blog",
  "author": "Test Guy 3",
  "url": "www.google.com"
}

const noTitleUrlBlog = {
  "author": "Test Guy 3",
  "likes": 4
  
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const totalLikes = (blogs) => blogs.reduce((p, c) => p + c.likes, 0)

const favoriteBlog = (blogs) => {
  const highVal = Math.max.apply(Math, blogs.map((blog) => blog.likes))
  const resObj = blogs.find((blog) => blog.likes === highVal)
  return resObj
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  blogsInDb,
  initialBlogs,
  newBlog,
  noLikesBlog,
  noTitleUrlBlog
}