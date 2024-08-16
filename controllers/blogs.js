const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const { getTokenFrom, userExtractor } = require('../utils/middleware');
const userHelper = require('../utils/user_helper');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1, id: 1 });

  response.json(blogs);
});

blogsRouter.get('/:id', async (request, response, next) => {
  try {
    const blog = await Blog
      .findById(request.params.id)
      .populate('user', { username: 1, name: 1 })
      .populate({
        path: 'comments',
        select: { content: 1, user: 1 },
        populate: {
          path: 'user',
          select: { name: 1, username: 1 }
        }
      });

    if (blog) {
      response.json(blog);
    } else {
      response.status(404).end();
    }
  } catch (error) {
    next(error);
  }
});

blogsRouter.post('/', userExtractor, async (request, response, next) => {
  const body = request.body;
  body.user = request.user.id;

  if(!Object.hasOwn(body, 'likes')){
    body.likes = '0';
  }

  if(!Object.hasOwn(body, 'url') || !Object.hasOwn(body,'title')){
    return response.status(400).json({
      error: 'missing title or url'
    });
  }

  const blog = new Blog(body);
  await blog.save();

  const user = request.user;
  user.blogs.push(blog.id);
  try{
    await User.findByIdAndUpdate(user.id, user, { new:true });
    return response.status(201).json(blog);
  }catch(error){
    console.error('Error updating user:', error);
    next(error);
  }
});

blogsRouter.delete('/:id', async (request,response,next) => {
  const id = request.params.id;
  const token = getTokenFrom(request);
  const requestingUser = await userHelper.userFromToken(token);

  const blog = await Blog.findById(id);
  if(!blog){
    console.log('invalid id');
    return response.status(400).json({
      error:'invalid id'
    });
  }

  const registeredUserID = String(blog.user);
  if(registeredUserID === requestingUser.id){
    Blog.findByIdAndDelete(id)
      .then(result => result ? response.status(204).end(): response.status(400).end())
      .catch(error => next);
  }else{
    console.log('only user who added the blog can delete it');
    return response.status(401).json({
      error: 'only user who added the blog can delete it'
    });
  }
});

blogsRouter.put('/:id', (request, response, next) => {
  const blog = request.body;

  Blog.findByIdAndUpdate(request.params.id, blog, { new:true })
    .then(updatedBlog => {
      if(!updatedBlog)return response.status(400).end();
      response.json(updatedBlog);
    })
    .catch(error => {
      console.error('Error updating blog:', error);
      next(error);
    });
});

module.exports = blogsRouter;