const commentsRouter = require('express').Router();
const Comment = require('../models/comment');
const Blog = require('../models/blog');
const { getTokenFrom, userExtractor } = require('../utils/middleware');
const userHelper = require('../utils/user_helper');

// Get all comments for a specific blog
commentsRouter.get('/:blogId', async (request, response, next) => {
  try {
    const comments = await Comment
      .find({ blog: request.params.blogId })
      .populate('user', { username: 1, name: 1 })
      .populate('blog', { title: 1, author: 1, url: 1, likes: 1 });

    response.json(comments);
  } catch (error) {
    next(error);
  }
});

// Get a specific comment by ID
commentsRouter.get('/comment/:commentId', async (request, response, next) => {
  try {
    const comment = await Comment
      .findById(request.params.commentId)
      .populate('user', { username: 1, name: 1 });

    if (comment) {
      response.json(comment);
    } else {
      response.status(404).json({ error: 'Comment not found' });
    }
  } catch (error) {
    next(error);
  }
});

// Post a new comment
commentsRouter.post('/:blogId', userExtractor, async (request, response, next) => {
  const body = request.body;
  const user = request.user;
  const blog = await Blog.findById(request.params.blogId);

  if (!blog) {
    return response.status(404).json({ error: 'Blog not found' });
  }

  const comment = new Comment({
    content: body.content,
    blog: blog._id,
    user: user._id,
  });

  try {
    const savedComment = await comment.save();

    // Update the blog document
    blog.comments = blog.comments.concat(savedComment._id);
    await blog.save();

    // Update the user document
    user.comments = user.comments.concat(savedComment._id);
    await user.save();

    response.status(201).json(savedComment);
  } catch (error) {
    next(error);
  }
});


// Delete a comment
commentsRouter.delete('/:id', async (request, response, next) => {
  const id = request.params.id;
  const token = getTokenFrom(request);

  const requestingUser = await userHelper.userFromToken(token);

  try {
    const comment = await Comment.findById(id);

    if (!comment) {
      return response.status(404).json({ error: 'Comment not found' });
    }

    if (comment.user.toString() !== requestingUser._id.toString()) {
      return response.status(401).json({
        error: 'Only the user who created the comment can delete it'
      });
    }

    await Comment.findByIdAndDelete(request.params.id);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = commentsRouter;