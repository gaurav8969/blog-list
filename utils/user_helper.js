const User = require('../models/user');
const jwt = require('jsonwebtoken');

const usersInDb = async () => {
  return await User.find({});
};

//generates a token signed for the provided user
const tokenForUser = (user) => {
  if(!user)return null;

  const userForToken = {
    username: user.username,
    id: user._id,
  };

  const token = jwt.sign(userForToken, process.env.SECRET);
  return token;
};

const userFromToken = async (token) => {
  let decodedToken = null;
  try{
    decodedToken = jwt.verify(token, process.env.SECRET);
  }catch(e){
    console.log('missing token');
    return;
  }

  const matchingUser = await User.findById(decodedToken.id);
  return matchingUser;
};

module.exports = {
  usersInDb,
  tokenForUser,
  userFromToken
};