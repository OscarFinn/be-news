const endpointsJson = require("../endpoints.json");

/* Set up your test imports here */
const app = require("../app.js");
const request = require("supertest");

const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data");
const db = require("../db/connection.js");

/* Set up your beforeEach & afterAll functions here */
beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

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
      .then(({ body }) => {
        const topics = body.topics;
        expect(topics.length).toBe(3);
        topics.forEach((topic) => {
          expect(typeof topic.slug).toBe("string");
          expect(typeof topic.description).toBe("string");
        });
      });
  });
  test("404: topics table is not found if topics table does not exist", () => {
    return db.query("DROP TABLE comments, articles, users, topics").then(() => {
      return request(app)
        .get("/api/topics")
        .expect(404)
        .then(({ body }) => {
          const msg = body.msg;
          expect(msg).toBe("Table not found");
        });
    });
  });
});

describe("GET /api/articles", () => {
  test("200: responds with an array of articles", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const articles = body.articles;
        expect(articles.length > 1).toBe(true);
        articles.forEach((article) => {
          expect(typeof article.title).toBe("string");
          expect(typeof article.author).toBe("string");
          expect(typeof article.article_id).toBe("number");
          expect(typeof article.topic).toBe("string");
          expect(typeof article.created_at).toBe("string");
          expect(typeof article.votes).toBe("number");
          expect(typeof article.article_img_url).toBe("string");
        });
      });
  });
  test("200: Array of articles contains a number of comments that is a number", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const articles = body.articles;
        articles.forEach((article) => {
          expect(typeof article.comment_count).toBe("number");
        });
      });
  });
  test("200: Array of articles do not contain the body of the article", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const articles = body.articles;
        articles.forEach((article) => {
          expect(article.body).toBe(undefined);
        });
      });
  });
  test("200: Array of articles is sorted in descending order using the creation date", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const articles = body.articles;
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("200: Returns an array of articles with the given topic when passed a topic query", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then(({ body }) => {
        const articles = body.articles;
        //all else are mitch
        expect(articles.length).toBe(1);
        expect(articles[0].topic).toBe("cats");
      });
  });
  test("200: Returns an empty array of articles when passed a valid topic not used", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body }) => {
        const articles = body.articles;
        expect(articles.length).toBe(0);
      });
  });
  test("404: Returns a 404 if passed a topic not present in the database", () => {
    return request(app)
      .get("/api/articles?topic=thingsthatarentmitch")
      .expect(404)
      .then(({ body }) => {
        const msg = body.msg;
        expect(msg).toBe("The topic 'thingsthatarentmitch' does not exist");
      });
  });
  test("200: Returns an array of articles when passed multiple topic queries", () => {
    const regex = /(^(mitch|cats)$)/;
    return request(app)
      .get("/api/articles?limit=15&topic=mitch&topic=cats")
      .expect(200)
      .then(({ body }) => {
        const articles = body.articles;
        expect(articles.length).toBe(13);
        articles.forEach((article) => {
          expect(article.topic).toMatch(regex);
        });
      });
  });
  //unnecessary but im leaving it there
  test("404: articles table is not found if articles table does not exist", () => {
    return db.query("DROP TABLE comments, articles, users, topics").then(() => {
      return request(app)
        .get("/api/articles")
        .expect(404)
        .then(({ body }) => {
          const msg = body.msg;
          expect(msg).toBe("Table not found");
        });
    });
  });
  test("200: returned articles are sorted by given greenlisted query", () => {
    return request(app)
      .get("/api/articles?sort_by=topic")
      .expect(200)
      .then(({ body }) => {
        const articles = body.articles;
        expect(articles).toBeSortedBy("topic", { descending: true });
      });
  });
  test("200: returned articles are sorted by given order", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then(({ body }) => {
        const articles = body.articles;
        expect(articles).toBeSortedBy("created_at", { ascending: true });
      });
  });
  test("400: Returns a bad request error when passed a non greenlisted sort", () => {
    return request(app)
      .get("/api/articles?sort_by=article_img_url")
      .expect(400)
      .then(({ body }) => {
        const msg = body.msg;
        expect(msg).toBe("Bad request: Cannot sort by 'article_img_url'");
      });
  });
  test("400: Returns a bad request error when passed a non greenlisted order", () => {
    return request(app)
      .get("/api/articles?order=desk")
      .expect(400)
      .then(({ body }) => {
        const msg = body.msg;
        expect(msg).toBe("Bad request: Cannot order by 'desk'");
      });
  });
  test("200: Returns a list of articles of length limit", () => {
    return request(app)
      .get("/api/articles?limit=5")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(5);
      });
  });
  test("200: Returns the articles found on the passed in page", () => {
    return request(app)
      .get("/api/articles?p=2")
      .expect(200)
      .then(({ body: { articles } }) => {
        //13 articles total, limit is 10, so 3 articles should be present on page2
        expect(articles.length).toBe(3);
      });
  });
  test("400: returns a bad request if page is not a number", () => {
    return request(app)
      .get("/api/articles?p=notanum")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request: 'p' must be a number");
      });
  });
  test("400: returns a bad request if limit is not a number", () => {
    return request(app)
      .get("/api/articles?limit=notanum")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request: 'limit' must be a number");
      });
  });
  test("200: Returns an empty array if page goes beyond number of articles", () => {
    return request(app)
      .get("/api/articles?p=1000")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(0);
      });
  });
  test("200: Returns an empty array if limit is 0", () => {
    return request(app)
      .get("/api/articles?limit=0")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(0);
      });
  });
  test("200: Returns a total count property", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles, total_count } }) => {
        expect(articles.length).toBe(10);
        expect(total_count).toBe(13);
      });
  });
  test("200: total count is adjusted when queries filter the results", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then(({ body: { total_count } }) => {
        expect(total_count).toBe(1);
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200: Responds with the article denoted by the given article id", () => {
    return request(app)
      .get("/api/articles/5")
      .expect(200)
      .then(({ body }) => {
        const article = body.article;
        const date = new Date(1596464040000);

        expect(article.title).toBe(
          "UNCOVERED: catspiracy to bring down democracy"
        );
        expect(article.author).toBe("rogersop");
        expect(article.article_id).toBe(5);
        expect(article.body).toBe(
          "Bastet walks amongst us, and the cats are taking arms!"
        );
        expect(article.topic).toBe("cats");
        expect(new Date(article.created_at).toString()).toBe(date.toString());
        expect(article.votes).toBe(0);
        expect(article.article_img_url).toBe(
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
        );
      });
  });
  test("200: Article with a 0 offset in its timestamp returns correct created_at", () => {
    return request(app)
      .get("/api/articles/11")
      .expect(200)
      .then(({ body }) => {
        const article = body.article;
        const date = new Date(1579126860000);

        expect(article.title).toBe("Am I a cat?");
        expect(new Date(article.created_at).toString()).toBe(date.toString());
      });
  });
  test("200: Article has a comment_count set to the number of comments associated with it", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const article = body.article;
        expect(article.comment_count).toBe(11);
      });
  });
  test("404: responds with a not found message if the article id does not exist", () => {
    return request(app)
      .get("/api/articles/999")
      .expect(404)
      .then(({ body }) => {
        const msg = body.msg;
        expect(msg).toBe("Article not found");
      });
  });
  test("400: responds with an invalid query message if passed id isnt a number", () => {
    return request(app)
      .get("/api/articles/invalid")
      .expect(400)
      .then(({ body }) => {
        const msg = body.msg;
        expect(msg).toBe("Bad request >:(");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: responds with an array of comments when passed a valid article", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=999")
      .expect(200)
      .then(({ body }) => {
        const comments = body.comments;

        expect(comments.length).toBe(11);

        comments.forEach((comment) => {
          expect(typeof comment.comment_id).toBe("number");
          expect(comment.article_id).toBe(1);
          expect(typeof comment.body).toBe("string");
          expect(typeof comment.votes).toBe("number");
          expect(typeof comment.author).toBe("string");
          expect(typeof comment.created_at).toBe("string");
        });
      });
  });
  test("200: checking a specific article with a single comment returns correct values", () => {
    return request(app)
      .get("/api/articles/6/comments")
      .expect(200)
      .then(({ body }) => {
        const comments = body.comments;

        expect(comments.length).toBe(1);
        comments.forEach((comment) => {
          expect(comment.comment_id).toBe(16);
          expect(comment.article_id).toBe(6);
          expect(comment.body).toBe("This is a bad article name");
          expect(comment.votes).toBe(1);
          expect(comment.author).toBe("butter_bridge");
          expect(`${new Date(comment.created_at)}`).toBe(
            `${new Date(1602433380000)}`
          );
        });
      });
  });
  test("200: responds with an empty array of comments when passed a valid article with no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body }) => {
        const comments = body.comments;
        expect(comments.length).toBe(0);
      });
  });
  test("404: responds with an error message when trying to access comments of a nonexistent article", () => {
    return request(app)
      .get("/api/articles/999/comments")
      .expect(404)
      .then(({ body }) => {
        const msg = body.msg;
        expect(msg).toBe("Article not found");
      });
  });
  test("400: responds with an error message when trying to access comment from an invalid article", () => {
    return request(app)
      .get("/api/articles/banana/comments")
      .expect(400)
      .then(({ body }) => {
        const msg = body.msg;
        expect(msg).toBe("Bad request >:(");
      });
  });
  test("200: comments are ordered by most recent first", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        const comments = body.comments;
        //ORDER BY created_at DESC means latest comments first
        expect(comments).toBeSortedBy("created_at", { descending: true });
      });
  });
  describe("Comment Pagination", () => {
    test("200: Returned array is limited to length of limits query", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=3")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments.length).toBe(3);
        });
    });
    test("200: Returned array is the page selected by p query", () => {
      return request(app)
        .get("/api/articles/1/comments?p=2")
        .expect(200)
        .then(({ body: { comments } }) => {
          //total comments is 11, default limit is 10, so there will be one comment on page 2
          expect(comments.length).toBe(1);
        });
    });
    test("400: Returns a bad request error when limit is NaN", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=sixplease")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad Request: 'limit' must be a number");
        });
    });
    test("400: Returns a bad request error when p is NaN", () => {
      return request(app)
        .get("/api/articles/1/comments?p=invalid")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad Request: 'p' must be a number");
        });
    });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("201: Comment is posted on a valid article and returns correct values", () => {
    const input = {
      username: "icellusedkars",
      body: "got ahold of a lot of teslas recently...",
    };

    return request(app)
      .post("/api/articles/2/comments")
      .send(input)
      .expect(201)
      .then(({ body }) => {
        const comment = body.comment;
        expect(comment.comment_id).toBe(19);
        expect(comment.author).toBe("icellusedkars");
        expect(comment.body).toBe("got ahold of a lot of teslas recently...");
        expect(comment.votes).toBe(0);
        expect(comment.article_id).toBe(2);
        expect(typeof comment.created_at).toBe("string");
        //test created_at too but not sure how
      });
  });
  test("404: Comment is posted on a nonexistent article returns a an error", () => {
    const input = {
      username: "icellusedkars",
      body: "got ahold of a lot of teslas recently...",
    };

    return request(app)
      .post("/api/articles/999/comments")
      .send(input)
      .expect(404)
      .then(({ body }) => {
        const msg = body.msg;
        expect(msg).toBe("Article not found");
      });
  });
  test("400: Comment posted without a usename or body attached returns a bad query", () => {
    const input = {
      username: "icellusedkars",
    };

    return request(app)
      .post("/api/articles/5/comments")
      .send(input)
      .expect(400)
      .then(({ body }) => {
        const msg = body.msg;
        expect(msg).toBe("Bad request, missing values");
      });
  });
  test("400: Comment posted to an invalid article returns a bad query error", () => {
    const input = {
      username: "rogersop",
      body: "Here i am, making a comment",
    };

    return request(app)
      .post("/api/articles/notarticle/comments")
      .send(input)
      .expect(400)
      .then(({ body }) => {
        const msg = body.msg;
        expect(msg).toBe("Bad request >:(");
      });
  });
  test("404: Comment posted by a nonexistent user returns a not found error", () => {
    const input = {
      username: "oscarisnotinthisdb",
      body: "not a real person",
    };

    return request(app)
      .post("/api/articles/4/comments")
      .send(input)
      .expect(404)
      .then(({ body }) => {
        const msg = body.msg;
        expect(msg).toBe("User 'oscarisnotinthisdb' not found");
      });
  });
});

describe("PATCH: /api/articles/:article_id", () => {
  test("200: Correctly updates votes on given article", () => {
    const input = {
      inc_votes: 13,
    };
    return request(app)
      .patch("/api/articles/1")
      .send(input)
      .expect(200)
      .then(({ body }) => {
        const article = body.article;
        expect(article.votes).toBe(113);
        expect(article.article_id).toBe(1);
      });
  });
  test("200: Correctly updates votes when passed a negative on given article", () => {
    const input = {
      inc_votes: -6,
    };
    return request(app)
      .patch("/api/articles/2")
      .send(input)
      .expect(200)
      .then(({ body }) => {
        const article = body.article;
        expect(article.article_id).toBe(2);
        expect(article.votes).toBe(-6);
      });
  });
  test("404: returns a not found error if article does not exist", () => {
    const input = {
      inc_votes: -999,
    };
    return request(app)
      .patch("/api/articles/999")
      .send(input)
      .expect(404)
      .then(({ body }) => {
        const msg = body.msg;
        expect(msg).toBe("Article not found");
      });
  });
  test("400: returns a bad request error if votes passed is not a number", () => {
    const input = {
      inc_votes: "Me nan",
    };
    return request(app)
      .patch("/api/articles/3")
      .send(input)
      .expect(400)
      .then(({ body }) => {
        const msg = body.msg;
        expect(msg).toBe("Bad request >:(");
      });
  });
  test("400: returns a bad request error if no votes are passed", () => {
    const input = {};
    return request(app)
      .patch("/api/articles/3")
      .send(input)
      .expect(400)
      .then(({ body }) => {
        const msg = body.msg;
        expect(msg).toBe("Bad request: no votes passed");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("204: deletes given comment, no response", () => {
    return request(app)
      .delete("/api/comments/7")
      .expect(204)
      .then(() => {
        return request(app)
          .get("/api/comments/7")
          .expect(404)
          .then(({ body }) => {
            const msg = body.msg;
            expect(msg).toBe("Comment not found");
          });
      });
  });
  test("404: Cannot delete a comment that does not exist", () => {
    return request(app)
      .delete("/api/comments/999")
      .expect(404)
      .then(({ body }) => {
        const msg = body.msg;
        expect(msg).toBe("Comment not found");
      });
  });
  test("400: returns a bad request when passed an invalid comment id", () => {
    return request(app)
      .delete(`/api/comments/notthecommentid`)
      .expect(400)
      .then(({ body }) => {
        const msg = body.msg;
        expect(msg).toBe("Bad request >:(");
      });
  });
});

describe("GET /api/users", () => {
  test("200: Returns the array of users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        const users = body.users;
        expect(users.length).toBe(4);
        users.forEach((user) => {
          expect(typeof user.username).toBe("string");
          expect(typeof user.name).toBe("string");
          expect(typeof user.avatar_url).toBe("string");
        });
      });
  });
});

describe("GET /api/users/:username", () => {
  test("200: Returns the user associated with the given username", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then(({ body }) => {
        const user = body.user;
        expect(user.username).toBe("butter_bridge");
        expect(user.name).toBe("jonny");
        expect(user.avatar_url).toBe(
          "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg"
        );
      });
  });
  test("404: Returns a 404 error when the user does not exist", () => {
    return request(app)
      .get("/api/users/bingus")
      .expect(404)
      .then(({ body }) => {
        const msg = body.msg;
        expect(msg).toBe("User 'bingus' not found");
      });
  });
  test("400: Returns a 400 when an invalid username is passed", () => {
    //max username length is 32 chars
    return request(app)
      .get(
        "/api/users/daenerysstormbornofhousetargaryenthefirstofhernamequeenoftheandalsandthefirstmenprotectorofthesevenkingdomsthemotherofdragonsthekhaleesiofthegreatgrasseatheunburntthebreakerofchains"
      )
      .expect(400)
      .then(({ body }) => {
        const msg = body.msg;
        expect(msg).toBe("Bad request: Invalid username");
      });
  });
});

describe("PATCH: /api/comments/:comment_id", () => {
  test("200: Comment votes are updated correctly when passed a valid update", () => {
    const input = {
      inc_votes: -100,
    };
    return request(app)
      .patch("/api/comments/2")
      .send(input)
      .expect(200)
      .then(({ body }) => {
        const comment = body.comment;
        expect(comment.comment_id).toBe(2);
        expect(comment.votes).toBe(-86);
        expect(comment.article_id).toBe(1);
        expect(comment.body).toBe(
          "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky."
        );
        expect(comment.author).toBe("butter_bridge");
        expect(`${new Date(comment.created_at)}`).toBe(
          `${new Date(1604113380000)}`
        );
      });
  });
  test("404: Returns a not found error when comment does not exist", () => {
    const input = {
      inc_votes: -100,
    };
    return request(app)
      .patch("/api/comments/9999")
      .send(input)
      .expect(404)
      .then(({ body }) => {
        const msg = body.msg;
        expect(msg).toBe("Comment not found");
      });
  });
  test("400: Returns a bad request error when passed an invalid input", () => {
    const input = {
      invalid: -100,
    };
    return request(app)
      .patch("/api/comments/1")
      .send(input)
      .expect(400)
      .then(({ body }) => {
        const msg = body.msg;
        expect(msg).toBe("Bad request: no votes passed");
      });
  });
  test("400: Returns a bad request error when passed an inc_votes that isnt a number", () => {
    const input = {
      inc_votes: "Add 4 votes please",
    };
    return request(app)
      .patch("/api/comments/1")
      .send(input)
      .expect(400)
      .then(({ body }) => {
        const msg = body.msg;
        expect(msg).toBe("Bad request: inc_votes must be a number");
      });
  });
  test("400: Returns a bad request error when passed comment id isnt a number", () => {
    const input = {
      inc_votes: 16,
    };
    return request(app)
      .patch("/api/comments/four")
      .send(input)
      .expect(400)
      .then(({ body }) => {
        const msg = body.msg;
        expect(msg).toBe("Bad request >:(");
      });
  });
});

describe("POST: /api/articles", () => {
  test("201: Posts the given article", () => {
    const input = {
      title: "Test",
      author: "rogersop",
      body: "lorem ipsum",
      topic: "paper",
      article_img_url:
        "https://t4.ftcdn.net/jpg/02/20/95/07/360_F_220950772_ewKiVCUs9QQWeUUfRCGlEndhU1RRmX8H.jpg",
    };
    return request(app)
      .post("/api/articles")
      .send(input)
      .expect(201)
      .then(({ body: { article } }) => {
        expect(article.title).toBe("Test");
        expect(article.author).toBe("rogersop");
        expect(article.body).toBe("lorem ipsum");
        expect(article.topic).toBe("paper");
        expect(article.article_img_url).toBe(
          "https://t4.ftcdn.net/jpg/02/20/95/07/360_F_220950772_ewKiVCUs9QQWeUUfRCGlEndhU1RRmX8H.jpg"
        );
        expect(article.votes).toBe(0);
        expect(article.article_id).toBe(14);
        expect(article.comment_count).toBe(0);
        expect(typeof article.created_at).toBe("string");
      });
  });
  test("201: Article is posted with a default img_url if not provided", () => {
    const input = {
      title: "Test",
      author: "rogersop",
      body: "lorem ipsum",
      topic: "paper",
    };
    return request(app)
      .post("/api/articles")
      .send(input)
      .expect(201)
      .then(({ body: { article } }) => {
        expect(article.article_img_url).toBe(
          "https://yt3.googleusercontent.com/ytc/AIdro_neeCM9My-5KsXa2Y5r7MtxRmUoV2On0UK3EmkUucJpTt0=s900-c-k-c0x00ffffff-no-rj"
        );
      });
  });
  test("400: Returns a bad request when missing necessary input data", () => {
    const input = {
      title: "Test",
      author: "rogersop",
      topic: "paper",
      article_img_url:
        "https://t4.ftcdn.net/jpg/02/20/95/07/360_F_220950772_ewKiVCUs9QQWeUUfRCGlEndhU1RRmX8H.jpg",
    };
    return request(app)
      .post("/api/articles")
      .send(input)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          "Bad request: Missing one or more necessary input values"
        );
      });
  });
  test("400: Returns a bad request if input data is of incorrect type", () => {
    const input = {
      title: "Test",
      author: "rogersop",
      topic: 1,
      body: "topic is of wrong type",
      article_img_url:
        "https://t4.ftcdn.net/jpg/02/20/95/07/360_F_220950772_ewKiVCUs9QQWeUUfRCGlEndhU1RRmX8H.jpg",
    };
    return request(app)
      .post("/api/articles")
      .send(input)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request: topic must be of type 'string'");
      });
  });
  test("404: Returns a 404 user not found if the author is not present in the db", () => {
    const input = {
      title: "Test",
      author: "oscar",
      topic: "paper",
      body: "oscar is not present",
    };
    return request(app)
      .post("/api/articles")
      .send(input)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("User 'oscar' not found");
      });
  });
  test("404: Returns a 404 topic not found if the topic is not present in the db", () => {
    const input = {
      title: "Test",
      author: "rogersop",
      topic: "notmitch",
      body: "all topics are mitch, not mitch topics dont exist",
    };
    return request(app)
      .post("/api/articles")
      .send(input)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("The topic 'notmitch' does not exist");
      });
  });
});

describe("POST: /api/topics", () => {
  test("201: When passed a valid topic adds it to the db", () => {
    const input = {
      slug: "mitchsquared",
      description: "for when a single mitch just isnt enough",
    };
    return request(app)
      .post("/api/topics")
      .send(input)
      .expect(201)
      .then(({ body: { topic } }) => {
        expect(topic.slug).toBe("mitchsquared");
        expect(topic.description).toBe(
          "for when a single mitch just isnt enough"
        );
        expect(topic.img_url).toBe("");
      });
  });
  test("400: Returns a bad request error when the topic already exists", () => {
    const input = {
      slug: "mitch",
      description: "trying to add mitch again???",
    };
    return request(app)
      .post("/api/topics")
      .send(input)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(`Bad request: Key (slug)=(mitch) already exists.`);
      });
  });
  test("400: Returns a bad request error when a topic value is of incorrect type", () => {
    const input = {
      slug: "descnotastring",
      description: 4,
    };
    return request(app)
      .post("/api/topics")
      .send(input)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          `Bad request: One of more necessary input values is of the incorrect type`
        );
      });
  });
  test("400: Returns a bad request error when topic is missing values", () => {
    const input = {
      slug: "missingDesc",
    };
    return request(app)
      .post("/api/topics")
      .send(input)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(
          `Bad request: Missing one or more necessary input values`
        );
      });
  });
});
