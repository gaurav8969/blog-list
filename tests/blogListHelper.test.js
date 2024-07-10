const { test, describe } = require('node:test');
const assert = require('node:assert');
const blogHelper = require('../utils/blog_helper');

test('dummy returns one', () => {
  const blogs = [];

  const result = blogHelper.dummy(blogs);
  assert.strictEqual(result, 1);
});

const listWithOneBlog = [
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
    likes: 5,
    __v: 0
  }
];

const blogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0
  }
];

describe('total likes', () => {
  //prefix the prompts with the describe group title
  test('when list has only one blog, equal the likes of that blog', () => {
    const result = blogHelper.totalLikes(listWithOneBlog);
    assert.strictEqual(result, 5);
  });

  test('when list is empty, equals 0', () => {
    const result = blogHelper.totalLikes([]);
    assert.strictEqual(result, 0);
  });

  test('of many are calculated right', () => {
    const result = blogHelper.totalLikes(blogs);
    assert.strictEqual(result, 36);
  });
});

describe('favourite blog', () => {
  test('for an empty blog list is a null object', () => {
    const result = blogHelper.favouriteBlog([]);
    assert.strictEqual(result, null);
  });

  test('for many blogs is the right object', () => {
    const popular = {
      _id: '5a422b3a1b54a676234d17f9',
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12,
      __v: 0
    };

    const result = blogHelper.favouriteBlog(blogs);
    assert.deepStrictEqual(result, popular);
  });
});

describe('mostProlific', () => {
  const mostProlific = {
    author: 'Robert C. Martin',
    blogs: 3
  };

  test('for an empty array is null', () => {
    const result = blogHelper.mostBlogs([]);
    assert.deepStrictEqual(result, null);
  });

  test('for many blogs is correct', () => {
    const result = blogHelper.mostBlogs(blogs);
    assert.deepStrictEqual(result, mostProlific);
  });
});

describe('mostLiked', () => {
  const mostLiked = {
    author: 'Edsger W. Dijkstra',
    likes: 17
  };

  test('for an empty array is null', () => {
    const result = blogHelper.mostLiked([]);
    assert.deepStrictEqual(result, null);
  });

  test('for many blogs gives the correct author', () => {
    const result = blogHelper.mostLiked(blogs);
    assert.deepStrictEqual(result, mostLiked);
  });
});