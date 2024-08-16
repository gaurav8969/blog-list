const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: String,
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'blog' // Reference to the Blog model
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user' // Reference to the User model
  }
});

commentSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    if (!returnedObject.id && returnedObject._id) {
      returnedObject.id = returnedObject._id.toString();
      delete returnedObject._id;
      delete returnedObject.__v;
    }
  }
});

const Comment = mongoose.model('comment', commentSchema);

module.exports = Comment;