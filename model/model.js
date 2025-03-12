const db = require("../db/connection");
const endpointsJson = require("../endpoints.json");

exports.fetchApi = () => {
  return endpointsJson;
};

exports.fetchTopics = () => {
  return db.query(`SELECT * FROM topics`).then(({ rows }) => {
    return rows;
  });
};

exports.fetchTopicBySlug = (slug) => {
  if (typeof slug !== "string") {
    return Promise.reject({
      status: 400,
      msg: "Bad request: topic must be of type 'string'",
    });
  }
  return db
    .query(`SELECT * FROM topics WHERE slug = $1`, [slug])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `The topic '${slug}' does not exist`,
        });
      } else {
        return rows[0];
      }
    });
};

exports.fetchArticles = (
  sortBy = "created_at",
  order = "DESC",
  topic = undefined
) => {
  const sortByGreenlist = [
    "article_id",
    "title",
    "topic",
    "author",
    "created_at",
    "votes",
  ];
  const orderGreenlist = ["ASC", "DESC"];

  let queryStr = `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comment_id)::int AS comment_count
        FROM articles
        LEFT JOIN comments
        ON articles.article_id = comments.article_id
        `;

  const queryArr = [];

  const whereArgs = [];

  if (topic) {
    if (Array.isArray(topic)) {
      for (let item of topic) {
        queryArr.push(item);
        whereArgs.push(` topic = $${queryArr.length}`);
      }
    } else {
      queryArr.push(topic);
      whereArgs.push(` topic = $${queryArr.length}`);
    }
    queryStr += `WHERE ${whereArgs.join(" OR")}`;
  }

  queryStr += `
     GROUP BY articles.article_id`;

  if (sortByGreenlist.includes(sortBy)) {
    queryStr += ` ORDER BY ${sortBy}`;
  } else {
    return Promise.reject({
      status: 400,
      msg: `Bad request: Cannot sort by '${sortBy}'`,
    });
  }

  if (orderGreenlist.includes(order.toUpperCase())) {
    queryStr += ` ${order}`;
  } else {
    return Promise.reject({
      status: 400,
      msg: `Bad request: Cannot order by '${order}'`,
    });
  }
  return db.query(queryStr, queryArr).then(({ rows }) => {
    return rows;
  });
};

exports.fetchArticle = (id) => {
  return db
    .query(
      ` SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, articles.body, COUNT(comments.comment_id)::int AS comment_count
        FROM articles 
        LEFT JOIN comments
        USING (article_id)
        WHERE article_id = $1
        GROUP BY articles.article_id`,
      [id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return rows[0];
    });
};

exports.fetchCommentsByArticle = (id) => {
  return db
    .query(
      `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC`,
      [id]
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.insertComment = (articleId, username, body) => {
  const createdAt = new Date(Date.now());
  return db
    .query(
      ` INSERT INTO comments
        (body, author, article_id, created_at)
        VALUES
        ($1, $2, $3, $4)
        RETURNING *`,
      [body, username, articleId, createdAt]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.updateArticleVotes = (articleId, voteChange) => {
  if (!voteChange) {
    return Promise.reject({ status: 400, msg: "Bad request: no votes passed" });
  }
  return db
    .query(
      ` UPDATE articles
        SET votes = votes + $1
        WHERE article_id = $2
        RETURNING article_id, votes`,
      [voteChange, articleId]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.fetchComment = (commentId) => {
  return db
    .query("SELECT * FROM comments WHERE comment_id = $1", [commentId])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Comment not found" });
      } else {
        return rows[0];
      }
    });
};

exports.removeComment = (commentId) => {
  return db.query("DELETE FROM comments WHERE comment_id = $1", [commentId]);
};

exports.fetchUsers = () => {
  return db.query(`SELECT * FROM users`).then(({ rows }) => rows);
};

exports.fetchUser = (username) => {
  if (username.length > 32) {
    return Promise.reject({
      status: 400,
      msg: "Bad request: Invalid username",
    });
  }
  if (typeof username !== "string") {
    return Promise.reject({
      status: 400,
      msg: "Bad request: Username must be of type 'string'",
    });
  }
  return db
    .query(`SELECT * FROM users WHERE username = $1`, [username])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `User '${username}' not found`,
        });
      } else {
        return rows[0];
      }
    });
};

exports.updateComment = (commentId, voteChange) => {
  if (!voteChange) {
    return Promise.reject({ status: 400, msg: "Bad request: no votes passed" });
  } else if (typeof voteChange !== "number") {
    return Promise.reject({
      status: 400,
      msg: "Bad request: inc_votes must be a number",
    });
  }
  return db
    .query(
      ` UPDATE comments
        SET votes = votes + $1
        WHERE comment_id = $2
        RETURNING *`,
      [voteChange, commentId]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.insertArticle = (inputArticle) => {
  const { title, author, body, topic, article_img_url } = inputArticle;

  if (!title || !author || !body || !topic) {
    return Promise.reject({
      status: 400,
      msg: "Bad request: Missing one or more necessary input values",
    });
  }
  //not pretty, should refactor
  let columnStr = "";
  let valuesStr = "";
  const inputArr = [];
  if (article_img_url) {
    columnStr = "(title, author, body, topic, article_img_url)";
    valuesStr = "($1, $2, $3, $4, $5)";
    inputArr.push(title, author, body, topic, article_img_url);
  } else {
    columnStr = "(title, author, body, topic)";
    valuesStr = "($1, $2, $3, $4)";
    inputArr.push(title, author, body, topic);
  }

  return db
    .query(
      `INSERT INTO articles
      ${columnStr}
      VALUES
      ${valuesStr}
      RETURNING article_id`,
      inputArr
    )
    .then(({ rows }) => {
      return rows[0];
    });
};
