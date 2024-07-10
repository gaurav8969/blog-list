const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({})
    .populate('blogs');

  response.json(users);
});

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body;

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  if(!username || !password){
    return response.status(400).json({
      error: 'missing username or password'
    });
  }

  if(username.length < 3 || password.length < 3){
    return response.status(400).json({
      error: 'password and usesrname both must be at least 3 characters in length'
    });
  }

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const SavedUser = await user.save();

  response.status(201).json(SavedUser);
});

module.exports = usersRouter;