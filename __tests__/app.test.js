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
            //console.log(body);
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
          //expect(article.number_of_comments).not.toBe(null)
        })
      })
  })
  test("200: Array of articles contains a number of comments that is not null", () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({body}) => {
        const articles = body.articles;
        articles.forEach((article) => {
          expect(article.number_of_comments).not.toBe(null)
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
  test("404: articles table is not found if articles table does not exist", () => {
    return db.query('DROP TABLE comments, articles, users, topics')
      .then(() => {
        return request(app)
          .get("/api/articles")
          .expect(404)
          .then(({body}) => {
            //console.log(body);
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

        // console.log(article.created_at, '<--- created at with no changes')
        // console.log(date, '<-- date with no changes')
        // console.log(new Date(article.created_at).getTimezoneOffset(), '<--- created_at timezone offset')
        // console.log(date.getTimezoneOffset(), '<--- timezone offset from test data')
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

        // console.log(article.created_at, '<--- created at with no changes')
        // console.log(date, '<-- date with no changes')
        // console.log(new Date(article.created_at).getTimezoneOffset(), '<--- created_at timezone offset')
        // console.log(date.getTimezoneOffset(), '<--- timezone offset from test data')
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