const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:String,
  name:String,
  passwordHash:String,
  blogs:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'blog'
    }
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'comment'
    }
  ]
});

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    if (!returnedObject.id && returnedObject._id) {
      returnedObject.id = returnedObject._id.toString();
      delete returnedObject._id;
      delete returnedObject.__v;
      delete returnedObject.passwordHash;
    }
  }
});

const User = mongoose.model('user', userSchema);

module.exports = User;