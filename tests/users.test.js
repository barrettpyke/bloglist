const { expect, test, describe, afterAll } = require('@jest/globals')
const usersHelper = require('../utils/user_helper')
const supertest = require('supertest')
const app = require('../index')
const mongoose = require('mongoose')

const User = require('../models/user')

const api = supertest(app)

describe('user validation', () => {

  test('test invalid password', async () => {
    await api
      .post('/api/users')
      .send(usersHelper.invalidPassword)
      .expect(400)
    
      const response = await api.get('/api/users')

      expect(response.body).toHaveLength(1)
  })

  test('test invalid username', async () => {
    await api
      .post('/api/users')
      .send(usersHelper.invalidUsername)
      .expect(400)
    
      const response = await api.get('/api/users')

      expect(response.body).toHaveLength(1)
  })

  test('test dupe username', async () => {
    await api
      .post('/api/users')
      .send(usersHelper.dupeUsername)
      .expect(400)
    
      const response = await api.get('/api/users')

      expect(response.body).toHaveLength(1)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
