const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({})
    .populate('blogs');

  response.json(users);
});

usersRouter.get('/:id', async (request, response) => {
  try {
    const user = await User
      .findById(request.params.id)
      .populate('blogs', { title: 1, author: 1, url: 1, id: 1, likes:1 })
      .populate({
        path: 'comments',
        select: { content: 1, blog: 1 },
        populate: {
          path: 'blog',
          select: { title: 1, author: 1, url: 1 }
        }
      });

    if (user) {
      response.json(user);
    } else {
      response.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    response.status(400).json({ error: 'malformatted id' });
  }
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