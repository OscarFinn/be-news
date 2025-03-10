const endpointsJson = require("../endpoints.json");

/* Set up your test imports here */
const app = require("../app.js")
const request = require("supertest")

const seed = require("../db/seeds/seed.js")
const data = require("../db/data/test-data")
const db = require('../db/connection.js')

/* Set up your beforeEach & afterAll functions here */
beforeEach(() => {
  return seed(data);
})

afterAll(() => {
  return db.end();
})


describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("GET /api/topics", () => {
  test("200: Responds with an array of topic objects containing a slug and a description", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({body}) => {
        const topics = body.topics;
        expect(topics.length).toBe(3)
        topics.forEach(topic => {
          expect(typeof topic.slug).toBe('string')
          expect(typeof topic.description).toBe('string');
        });
      })
  })
  test("404: topics table is not found if topics table does not exist", () => {
    return db.query('DROP TABLE comments, articles, users, topics')
      .then(() => {
        return request(app)
          .get("/api/topics")
          .expect(404)
          .then(({body}) => {
            const msg = body.msg;
            expect(msg).toBe("Table not found")
      })
    })
  })
})

describe("GET /api/articles", () => {
  test("200: responds with an array of articles", () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({body}) => {
        const articles = body.articles;
        articles.forEach((article) => {
          expect(typeof article.title).toBe("string")
          expect(typeof article.author).toBe("string")
          expect(typeof article.article_id).toBe("number")
          expect(typeof article.topic).toBe("string")
          expect(typeof article.created_at).toBe("string")
          expect(typeof article.votes).toBe("number")
          expect(typeof article.article_img_url).toBe("string")
        })
      })
  })
  test("200: Array of articles contains a number of comments that is a number", () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({body}) => {
        const articles = body.articles;
        articles.forEach((article) => {
          expect(typeof article.number_of_comments).toBe("number")
        })
      })
  })
  test("200: Array of articles do not contain the body of the article", () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({body}) => {
        const articles = body.articles;
        articles.forEach((article) => {
          expect(article.body).toBe(undefined)
        })
      })
  })
  test("200: Array of articles is sorted in descending order using the creation date", () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({body}) => {
        const articles = body.articles;
        expect(articles).toBeSortedBy('created_at',{descending: true})
      })
  })
  //unnecessary but im leaving it there
  test("404: articles table is not found if articles table does not exist", () => {
    return db.query('DROP TABLE comments, articles, users, topics')
      .then(() => {
        return request(app)
          .get("/api/articles")
          .expect(404)
          .then(({body}) => {
            const msg = body.msg;
            expect(msg).toBe("Table not found")
      })
    })
  })
})

describe("GET /api/articles/:article_id", () => {
  test("200: Responds with the article denoted by the given article id", () => {
    return request(app)
      .get('/api/articles/5')
      .expect(200)
      .then(({body}) => {
        const article = body.article;
        const date = new Date(1596464040000)

        expect(article.title).toBe("UNCOVERED: catspiracy to bring down democracy")
        expect(article.author).toBe("rogersop")
        expect(article.article_id).toBe(5)
        expect(article.body).toBe("Bastet walks amongst us, and the cats are taking arms!")
        expect(article.topic).toBe("cats")
        expect(new Date(article.created_at).toString()).toBe(date.toString())
        expect(article.votes).toBe(0)
        expect(article.article_img_url).toBe("https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700")
      })
  })
  test("200: Article with a 0 offset in its timestamp returns correct created_at", () => {
    return request(app)
      .get('/api/articles/11')
      .expect(200)
      .then(({body}) => {
        const article = body.article;
        const date = new Date(1579126860000)

        expect(article.title).toBe("Am I a cat?")
        expect(new Date(article.created_at).toString()).toBe(date.toString())
      })
  })
  test("404: responds with a not found message if the article id does not exist", () => {
    return request(app)
      .get('/api/articles/999')
      .expect(404)
      .then(({body}) => {
        const msg = body.msg;
        expect(msg).toBe('Article not found')
      })
  })
  test("400: responds with an invalid query message if passed id isnt a number", () => {
    return request(app)
      .get('/api/articles/invalid')
      .expect(400)
      .then(({body}) => {
        const msg = body.msg;
        expect(msg).toBe('Bad request >:(')
      })
  })
})

describe("GET /api/articles/:article_id/comments", () => {
  test("200: responds with an array of comments when passed a valid article", () => {
    return request(app)
      .get('/api/articles/1/comments')
      .expect(200)
      .then(({body}) => {
        const comments = body.comments;

        expect(comments.length).toBe(11);

        comments.forEach((comment) => {
          expect(typeof comment.comment_id).toBe("number");
          expect(comment.article_id).toBe(1);
          expect(typeof comment.body).toBe("string");
          expect(typeof comment.votes).toBe("number");
          expect(typeof comment.author).toBe("string");
          expect(typeof comment.created_at).toBe("string");
        })
      })
  })
  test("200: checking a specific article with a single comment returns correct values", () => {
    return request(app)
      .get('/api/articles/6/comments')
      .expect(200)
      .then(({body}) => {
        const comments = body.comments;

        expect(comments.length).toBe(1);
        comments.forEach((comment) => {
          expect(comment.comment_id).toBe(16);
          expect(comment.article_id).toBe(6);
          expect(comment.body).toBe("This is a bad article name");
          expect(comment.votes).toBe(1);
          expect(comment.author).toBe("butter_bridge");
          expect(`${new Date(comment.created_at)}`).toBe(`${new Date(1602433380000)}`);
        })
      })
  })
  test("200: responds with an empty array of comments when passed a valid article with no comments", () => {
    return request(app)
      .get('/api/articles/2/comments')
      .expect(200)
      .then(({body}) => {
        const comments = body.comments;
        expect(comments.length).toBe(0)
      })
  })
  test("404: responds with an error message when trying to access comments of a nonexistent article", () => {
    return request(app)
      .get('/api/articles/999/comments')
      .expect(404)
      .then(({body}) => {
        const msg = body.msg
        expect(msg).toBe('Article not found')
      })
  })
  test("400: responds with an error message when trying to access comment from an invalid article",() => {
    return request(app)
      .get('/api/articles/banana/comments')
      .expect(400)
      .then(({body}) => {
        const msg = body.msg
        expect(msg).toBe('Bad request >:(')
      })
  })
  test("200: comments are ordered by most recent first", () => {
    return request(app)
      .get('/api/articles/1/comments')
      .expect(200)
      .then(({body}) => {
        const comments = body.comments
        //ORDER BY created_at DESC means latest comments first
        expect(comments).toBeSortedBy('created_at', {descending:true})
      })
  })
})

describe("POST /api/articles/:article_id/comments", () => {
  test("201: Comment is posted on a valid article and returns correct values", () => {
    const input = {
      username: "icellusedkars",
      body: "got ahold of a lot of teslas recently..."
    }
    
    return request(app)
      .post('/api/articles/2/comments')
      .send(input)
      .expect(201)
      .then(({body}) => {
        const comment = body.comment
        expect(comment.author).toBe('icellusedkars')
        expect(comment.body).toBe('got ahold of a lot of teslas recently...')
        expect(comment.votes).toBe(0);
        expect(comment.article_id).toBe(2)
        //test created_at too but not sure how
      })
  })
})