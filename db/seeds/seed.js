const db = require("../connection");
const format = require("pg-format");
//const createLookupObject = require('./utils.js');
const { convertTimestampToDate, createLookupObject } = require("./utils.js");

const seed = ({ topicData, userData, articleData, commentData }) => {
  return db
    .query("DROP TABLE IF EXISTS comments;")
    .then(() => {
      return db.query("DROP TABLE IF EXISTS articles;");
    })
    .then(() => {
      return db.query("DROP TABLE IF EXISTS users;");
    })
    .then(() => {
      return db.query("DROP TABLE IF EXISTS topics;");
    })
    .then(() => {
      return createTopics();
    })
    .then(() => {
      return createUsers();
    })
    .then(() => {
      return createArticles();
    })
    .then(() => {
      return createComments();
    })
    .then(() => {
      const topicArray = topicData.map((topic) => [
        topic.description,
        topic.slug,
        topic.img_url,
      ]);
      return insertTopicsData(topicArray);
    })
    .then(() => {
      const userArray = userData.map((user) => [
        user.username,
        user.name,
        user.avatar_url,
      ]);
      return insertUsersData(userArray);
    })
    .then(() => {
      const articleArray = articleData.map((article) => {
        //console.log(article.created_at.getTimezoneOffset())
        const fixedTimestamp = convertTimestampToDate(article);
        // if(article.title === 'UNCOVERED: catspiracy to bring down democracy') {
        //   console.log(fixedTimestamp.created_at, '<--- created at before entering db')
        // }

        //get timezone offset and adjust date by this before adding to db
        const offset = fixedTimestamp.created_at.getTimezoneOffset();
        const offsetFix = new Date(
          fixedTimestamp.created_at.getTime() - offset * 60000
        );

        //console.log(fixedTimestamp.title);
        //console.log(fixedTimestamp.created_at.getTimezoneOffset(), '<---timezone offset in seed')

        return [
          article.title,
          article.topic,
          article.author,
          article.body,
          offsetFix,
          article.votes,
          article.article_img_url,
        ];
      });
      return insertArticleData(articleArray);
    })
    .then((articleTitleId) => {
      const articleLookup = createLookupObject(
        articleTitleId.rows,
        "title",
        "article_id"
      );
      const commentsArray = commentData.map((comment) => {
        const articleTitle = comment.article_title;
        const articleId = articleLookup[articleTitle];
        const fixedTimestamp = convertTimestampToDate(comment);

        const offset = fixedTimestamp.created_at.getTimezoneOffset();
        const offsetFix = new Date(
          fixedTimestamp.created_at.getTime() - offset * 60000
        );
        return [
          articleId,
          comment.body,
          comment.votes,
          comment.author,
          offsetFix,
        ];
      });

      return insertCommentData(commentsArray);
    });
};

function createTopics() {
  return db.query(`
    CREATE TABLE topics (
    slug VARCHAR PRIMARY KEY,
    description VARCHAR NOT NULL,
    img_url VARCHAR(1000) NOT NULL
    );`);
}
function createUsers() {
  return db.query(`
    CREATE TABLE users (
    username VARCHAR(32) PRIMARY KEY,
    name VARCHAR(32) NOT NULL,
    avatar_url VARCHAR(1000) NOT NULL
    );`);
}
function createArticles() {
  return db.query(`
    CREATE TABLE articles (
    article_id SERIAL PRIMARY KEY,
    title VARCHAR(128) NOT NULL,
    topic VARCHAR REFERENCES topics(slug) ON DELETE CASCADE,
    author VARCHAR(32) REFERENCES users(username) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    votes INT DEFAULT 0,
    article_img_url VARCHAR(1000) NOT NULL
    );`);
}
function createComments() {
  return db.query(`
    CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    article_id INT REFERENCES articles(article_id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    votes INT DEFAULT 0,
    author VARCHAR(32) REFERENCES users(username) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);
}

function insertTopicsData(topics) {
  const sqlString = format(
    `INSERT INTO topics (description, slug, img_url) VALUES %L`,
    topics
  );
  return db.query(sqlString);
}

function insertUsersData(users) {
  const sqlString = format(
    `INSERT INTO users (username, name, avatar_url) VALUES %L`,
    users
  );
  return db.query(sqlString);
}

function insertArticleData(articles) {
  const sqlString = format(
    `INSERT INTO articles (title, topic, author, body, created_at, votes, article_img_url) VALUES %L RETURNING article_id, title`,
    articles
  );
  return db.query(sqlString);
}

function insertCommentData(comments) {
  const sqlString = format(
    `INSERT INTO comments (article_id, body, votes, author, created_at) VALUES %L `,
    comments
  );
  return db.query(sqlString);
}

module.exports = seed;
