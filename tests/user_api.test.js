const { test, after, describe, beforeEach } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const User = require('../models/user');
const userHelper = require('../utils/user_helper');

const api = supertest(app);

const users = [
  {
    'username': 'flux8969',
    'name': 'yash',
    'password': '512'
  },
  {
    'username': 'yash8969',
    'name': 'gaurav',
    'password': '125'
  },
  {
    'username': 'addMe',
    'name': 'add',
    'password': 'addition'
  }
];

const badRequest = {
  'username': 'bad',
  'name': 'request',
  'password': '69'
};

beforeEach(async () => {
  await User.deleteMany({});
  let user = new User(users[0]);
  await user.save();
  user = new User(users[1]);
  await user.save();
});

describe('adding users is handled correctly by', () => {
  test('accepting when password and user length are both above 3', async () => {
    const initialUsers = await userHelper.usersInDb();

    await api
      .post('/api/users')
      .send(users[2])
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const finalUsers = await userHelper.usersInDb();
    assert.strictEqual(initialUsers.length + 1, finalUsers.length);
  });

  test('rejecting when password or username are below 3 characters in length',
    async () => {
      const initialUsers = await userHelper.usersInDb();

      await api
        .post('/api/users')
        .send(badRequest)
        .expect(400)
        .expect('Content-Type', /application\/json/);

      const finalUsers = await userHelper.usersInDb();
      assert.strictEqual(initialUsers.length, finalUsers.length);
    });
});

after(async () => {
  await mongoose.connection.close();
});