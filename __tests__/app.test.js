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