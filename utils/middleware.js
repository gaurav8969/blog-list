const jwt = require('jsonwebtoken');
const User = require('../models/user');
const util = require('util');

const getTokenFrom = request => {
  const authorization = request.get('authorization');
  if(authorization && authorization.startsWith('Bearer')){
    return authorization.replace('Bearer ', '');
  }
  return null;
};

const userExtractor = async (request, response, next) => {
  const jwebtoken = getTokenFrom(request);

  if(util.isDeepStrictEqual(request.body, {})){
    console.log('empty body');
    return response.status(400).json({
      error:'empty body'
    });
  }

  if(jwebtoken === null){
    return response.status(401).json({
      error: 'missing token: check authorization header'
    });
  }

  let decodedToken = null;
  try{
    decodedToken = jwt.verify(jwebtoken, process.env.SECRET);
  }catch(e){
    console.log('invalid token');
    return response.status(401).json({
      error: 'bad authorization attempt- invalid token'
    });
  }

  const matchingUser = await User.findById(decodedToken.id);
  request.user = matchingUser;
  next();
};

module.exports = { getTokenFrom, userExtractor };