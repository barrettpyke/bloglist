const jwt = require('jsonwebtoken')
const User = require('../models/user')

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  request.token = authorization.substring(7)

  next()
}

const userExtractor = async (request, response, next) => {
  const token = request.token
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'Token missing or invalid.' })
  } else {
    request.user = await User.findById(decodedToken.id)
  }
  next()
}

module.exports = { 
  tokenExtractor,
  userExtractor 
}