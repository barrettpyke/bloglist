const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
  if (users) {
    response.json(users)
  } else {
    response.status(404).end()
  }
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body
  const saltRound = 10
  const passwordHash = await bcrypt.hash(password, saltRound)
  const existingUsers = await User.find({})
  const existingUsersArr = existingUsers.map(r => r.username)
  if (existingUsersArr.includes(username)) {
      response.status(400).json({
        error: 'Invalid username'
      })
    } else if (username.length < 3 || password.length < 3) {
      response.status(400).json({
        error: 'Username/Password must be 3 characters.'
      })
    } else {
      const user = new User({
        username,
        name,
        passwordHash,
      })
    
      const savedUser = await user.save()
    
      response.status(201).json(savedUser)
    }
})

module.exports = usersRouter