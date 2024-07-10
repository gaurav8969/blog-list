// Load the full build.
var lodash = require('lodash');
var helper = require('./for_testing');
var Blog = require('../models/blog');

const dummy = (blogs) => {
  return 1;
};

const blogsInDb = async () => {
  return await Blog.find({});
};

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes;
  };

  return blogs.reduce(reducer,0);
};

const favouriteBlog = (blogs) => {
  let fav = null;
  let mostLikes = -1;
  for(let blog of blogs){
    if(blog.likes >= mostLikes){
      mostLikes = blog.likes;
      fav = blog;
    }
  }

  return fav;
};

const mostBlogs = (blogs) => {
  const byAuthor = lodash.groupBy(blogs, 'author');
  //author is key, blogs is value
  const authorsArray = lodash.map(byAuthor, (blogs, author) => ({
    author,
    blogs:blogs.length,
  }));

  const sortedByAuthor = lodash.sortBy(authorsArray, 'blogs');
  return blogs.length !== 0? sortedByAuthor.at(-1): null;
};

const mostLiked = (blogs) => {
  const byAuthor = lodash.groupBy(blogs, 'author');
  //author is key, blogs is value
  const likesArray = lodash.map(byAuthor, (blogs, author) => ({
    author,
    likes: lodash.sumBy(blogs, 'likes'),
  }));

  const sortedLikesArray = lodash.sortBy(likesArray, 'likes');

  return blogs.length !== 0? sortedLikesArray.at(-1): null;
};

module.exports = {
  dummy,
  blogsInDb,
  totalLikes,
  favouriteBlog,
  mostBlogs,
  mostLiked,
};