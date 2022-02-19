const { expect, test, describe, afterAll, beforeEach } = require('@jest/globals')
const listHelper = require('../utils/list_helper')
const userHelper = require('../utils/user_helper')
const supertest = require('supertest')
const app = require('../index')
const mongoose = require('mongoose')

const Blog = require('../models/blog')
const loginRouter = require('../controllers/login')
const User = require('../models/user')

const api = supertest(app)


beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  let blogObject = new Blog(listHelper.initialBlogs[0])
  await blogObject.save()

  blogObject = new Blog(listHelper.initialBlogs[1])
  await blogObject.save()
})

const listWithOneBlog = [
  {
    _id: '5a422a7777128973879',
    title: 'Go To Statement',
    author: 'Edgar Dijkstra',
    url: 'www.google.com',
    likes: 5,
    __v: 0
  }
]

const largeList = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0
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
    likes: 12,
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
    likes: 2,
    __v: 0
  }  
]

const emptyList = []

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

describe('total likes', () => {

  test('when list has only one blog', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    expect(result).toBe(5)
  })

  test('empty list', () => {
    const result = listHelper.totalLikes(emptyList)
    expect(result).toBe(0)
  })

  test('large list', () => {
    const result = listHelper.totalLikes(largeList)
    expect(result).toBe(36)
  })
})

describe ('favorite blog', () => {

  test('when the list has one blog', () => {
    const result = listHelper.favoriteBlog(listWithOneBlog)
    expect(result).toEqual(listWithOneBlog[0])
  })

  test('empty list', () => {
    const result = listHelper.favoriteBlog(emptyList)
    expect(result).toEqual(undefined)
  })

  test('large list', () => {
    const result = listHelper.favoriteBlog(largeList)
    expect(result).toEqual(largeList[2])
  })
})

describe('api calls', () => {

  let header

  beforeEach(async () => {
    const newUser = {
      username: 'barrettpyke2',
      password: 'chicago1',
      name: "Barrett Pyke"
    }
    
    await api
      .post('/api/users')
      .send(newUser)
    
    const logInUser = await api
      .post('/api/login')
      .send(newUser)

    header = {
      'Authorization': `bearer ${logInUser.body.token}`
    }
  })
  
  test('get request to api/blogs', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(listHelper.initialBlogs.length)
  })

  test ('check that id is formatted and exists', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body[0].id).toBeDefined()
  }, 100000)

  test('check post works', async () => {
    
    await api
      .post('/api/blogs')
      .send(listHelper.newBlog)
      .set(header)
      .expect(200)
      
      const response = await api.get('/api/blogs')
      const contents = response.body.map(r => r.title)

      expect(response.body).toHaveLength(listHelper.initialBlogs.length + 1)
      expect(contents).toContain(
        'New Blog'
      )
  })

  test('likes not included in request, default 0', async () => {
    await api
      .post('/api/blogs')
      .send(listHelper.noLikesBlog)
      .set(header)
      .expect(200)
    
      const response = await api
        .get('/api/blogs')
        .set(header)
      const contents = response.body.map(r => r.likes)

      expect(response.body).toHaveLength(listHelper.initialBlogs.length + 1)
      expect(contents).toContain(
        0
      )
  })

  test('title/url not included in request', async () => {
    await api
      .post('/api/blogs')
      .send(listHelper.noTitleUrlBlog)
      .set(header)
      .expect(400)
    
      const response = await api
        .get('/api/blogs')
        .set(header)

      expect(response.body).toHaveLength(listHelper.initialBlogs.length)
  })

  test('delete blog', async () => {
    const blogsAtStart = await listHelper.blogsInDb()
    const blogToDelete = blogsAtStart[0]
    
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set(header)
      .expect(204)

    const blogsAtEnd = await listHelper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      listHelper.initialBlogs.length - 1
    )

    const contents = blogsAtEnd.map(r => r.title)

    expect(contents).not.toContain(blogToDelete.title)
  })

  test('update blog', async () => {
    const blogsAtStart = await listHelper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updateBlog = {
      likes: 200
    }
    
    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set(header)
      .send(updateBlog)
      .expect(204)

    const blogsAtEnd = await listHelper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(listHelper.initialBlogs.length)

    expect(blogsAtEnd[0].likes).toEqual(200)
  })
})

afterAll(() => {
  mongoose.connection.close()
})