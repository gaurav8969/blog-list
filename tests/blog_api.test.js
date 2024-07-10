const { test, after , describe, beforeEach } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const User = require('../models/user');
const blogHelper = require('../utils/blog_helper');
const userHelper = require('../utils/user_helper');

const api = supertest(app);

const blogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0,
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0,
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0
  }
];

const missingLikes = {
  _id: '5a422b3a1b54a676234d17f9',
  title: 'Canonical string reduction',
  author: 'Edsger W. Dijkstra',
  url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
  __v: 0,
};

const missingTitle = {
  _id: '5a422b3a1b54a676234d17f9',
  author: 'Edsger W. Dijkstra',
  url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
  likes: 12,
  __v: 0,
};

const missingUrl = {
  _id: '5a422b3a1b54a676234d17f9',
  title: 'Canonical string reduction',
  author: 'Edsger W. Dijkstra',
  likes: 12,
  __v: 0,
};

const replacement = {
  _id: new mongoose.Types.ObjectId('5a422aa71b54a676234d17f8'),
  title: 'Go To Statement Considered Harmful',
  author: 'Edsger W. Dijkstra',
  url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
  likes: 9000,
  __v: 0,
};

const invalidReplacement = {
  _id: new mongoose.Types.ObjectId('5a422aa71b54a676234d17f1'),
  title: 'Go To Statement Considered Harmful',
  author: 'Edsger W. Dijkstra',
  url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
  likes: 9000,
  __v: 0,
};

beforeEach(async () => {
  const users = await User.find({});
  await Blog.deleteMany({});
  blogs[0].user = users[0].id;
  let blogObject = new Blog(blogs[0]);
  await blogObject.save();
  blogs[1].user = users[1].id;
  blogObject = new Blog(blogs[1]);
  await blogObject.save();
  missingTitle.user = users[0].id;
  missingUrl.user = users[0].id;
  missingLikes.user = users[0].id;
  replacement.user = users[0].id;
  invalidReplacement.user = users[0].id;
});

test('blogs are returned as json', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.strictEqual(response.body.length, 2);
});

describe.only('unique identifier id', () => {
  test.only('is absent for empty input', async () => {
    const data = [];
    assert.strictEqual(Object.hasOwn(data,'id'), false);
  });

  test('is present in every individual block sent', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const blogs = response.body;
    for(let blog of blogs){
      assert.strictEqual(Object.hasOwn(blog,'id'), true);
    }
  });
});

describe.only('post is correctly handled by', () => {
  test('rejecting in case of no body', async () => {
    const response = await api
      .post('/api/blogs')
      .send({})
      .expect(400);
  });

  test('accepting a blog with a matching token', async () => {
    const initialBlogs = await api.get('/api/blogs');
    const users = await User.find({});
    const user = users.at(0);
    const token = userHelper.tokenForUser(user);
    await api
      .post('/api/blogs')
      .send(blogs[2])
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const finalBlogs = await api.get('/api/blogs');
    //all entries from blogs have been pushed to cloud atlas now
    assert.strictEqual(finalBlogs.body.length, initialBlogs.body.length + 1);
  });

  test('rejecting a blog with a missing token', async () => {
    const users = await User.find({});
    const user = users.at(0);
    const token = userHelper.tokenForUser(user);
    await api
      .post('/api/blogs')
      .send(blogs[2])
      .expect(401)
      .expect('Content-Type', /application\/json/);
  });

  test('rejecting a blog with an invalid token', async () => {
    const users = await User.find({});
    const user = users.at(0);
    const token = userHelper.tokenForUser(user);
    await api
      .post('/api/blogs')
      .send(blogs[2])
      .expect(401)
      .set('Authorization', 'Bearer')
      .expect('Content-Type', /application\/json/);
  });

  test('saving blog with 0 likes if the likes property is missing', async () => {
    const users = await User.find({});
    const user = users.at(0);
    const token = userHelper.tokenForUser(user);
    const savedObject = await api
      .post('/api/blogs')
      .send(missingLikes)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const body = savedObject.body;
    assert(Object.hasOwn(body,'likes'));
    assert.strictEqual(body.likes, 0);
  });

  test('rejecting blogs with missing url with 400 bad request', async () => {
    const users = await User.find({});
    const user = users.at(0);
    const token = userHelper.tokenForUser(user);
    await api
      .post('/api/blogs')
      .send(missingUrl)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
      .expect('Content-Type', /application\/json/);
  });

  test('rejecting blogs with missing title with 400 bad request', async () => {
    const users = await User.find({});
    const user = users.at(0);
    const token = userHelper.tokenForUser(user);
    await api
      .post('/api/blogs')
      .send(missingTitle)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
      .expect('Content-Type', /application\/json/);
  });

});

describe('deletion of a blog', () => {
  test('succeeds with code 204 for valid ids', async () => {
    const blogsAtStart = await blogHelper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    const users = await User.find({});
    const user = users.at(0);
    const token = userHelper.tokenForUser(user);

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const blogsAtEnd = await blogHelper.blogsInDb();
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length -1);

    const urls = blogsAtEnd.map(blog => blog.url);

    assert(!urls.includes(blogToDelete.url));
  });

  test('returns error code 400 bad request for invalid ids', async () => {
    const blogsAtStart = await blogHelper.blogsInDb();
    const blogToDelete = blogsAtStart[0];
    blogToDelete._id = '5a422a851b54a676234212f7';

    const users = await User.find({});
    const user = users.at(0);
    const token = userHelper.tokenForUser(user);

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    const blogsAtEnd = await blogHelper.blogsInDb();
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length);

    const ids = blogsAtEnd.map(blog => blog.ids);

    assert(!ids.includes(blogToDelete.id));
  });
});

describe('put requests are handled by', () => {
  test('updating the target blog with the new body', async () => {
    const initialBlogs = await blogHelper.blogsInDb();

    await api
      .put(`/api/blogs/${replacement._id}`)
      .send(replacement)
      .expect(200);

    const finalBlogs = await blogHelper.blogsInDb();
    assert.strictEqual(initialBlogs.length, finalBlogs.length);
  });

  test('rejecting in case of invalid id', async () => {
    const initialBlogs = await blogHelper.blogsInDb();

    await api
      .put(`/api/blogs/${invalidReplacement._id}`)
      .send(invalidReplacement)
      .expect(400);

    const finalBlogs = await blogHelper.blogsInDb();
    assert.strictEqual(initialBlogs.length, finalBlogs.length);
  });
});

after(async () => {
  await mongoose.connection.close();
});