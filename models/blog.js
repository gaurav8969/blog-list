const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
  user:
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'comment'
  }]
});

blogSchema.set('toJSON', {
  transform:(document,returnedObject) => {
    if (!returnedObject.id && returnedObject._id) {
      returnedObject.id = returnedObject._id.toString();
      delete returnedObject._id;
      delete returnedObject.__v;
    }
  }
});

const Blog = mongoose.model('blog', blogSchema);

module.exports = Blog;