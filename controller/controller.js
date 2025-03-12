const { get } = require("../app");
const model = require("../model/model");

exports.getApi = (req, res, next) => {
  const endpoints = model.fetchApi();
  res.status(200).send({ endpoints: endpoints });
};

exports.getTopics = (req, res, next) => {
  model
    .fetchTopics()
    .then((topics) => {
      res.status(200).send({ topics: topics });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  const { sort_by, order, topic, limit, p } = req.query;

  const promiseArr = [];

  const fetchArticles = model.fetchArticles(limit, p, sort_by, order, topic);
  promiseArr.push(fetchArticles);

  if (topic) {
    if (Array.isArray(topic)) {
      for (let item of topic) {
        const checkTopicExists = model.fetchTopicBySlug(item);
        promiseArr.push(checkTopicExists);
      }
    } else {
      const checkTopicExists = model.fetchTopicBySlug(topic);
      promiseArr.push(checkTopicExists);
    }
  }

  Promise.all(promiseArr)
    .then(([{ articles, total_count }]) => {
      res.status(200).send({ articles, total_count });
    })
    .catch(next);
};

exports.getArticleById = (req, res, next) => {
  const articleId = req.params.article_id;
  model
    .fetchArticle(articleId)
    .then((article) => {
      res.status(200).send({ article: article });
    })
    .catch(next);
};

exports.getCommentsByArticle = (req, res, next) => {
  const articleId = req.params.article_id;
  const { limit, p } = req.query;
  const checkExists = model.fetchArticle(articleId);
  const getComments = model.fetchCommentsByArticle(articleId, limit, p);

  Promise.all([checkExists, getComments])
    .then(([exists, comments]) => {
      res.status(200).send({ comments: comments });
    })
    .catch(next);
};
exports.postCommentToArticle = (req, res, next) => {
  const articleId = req.params.article_id;
  const { username, body } = req.body;

  const checkUserExists = model.fetchUser(username);
  const checkArticleExists = model.fetchArticle(articleId);
  const postComment = model.insertComment(articleId, username, body);

  Promise.all([checkArticleExists, checkUserExists, postComment])
    .then(({ [2]: comment }) => {
      res.status(201).send({ comment: comment });
    })
    .catch(next);
};

exports.patchArticle = (req, res, next) => {
  const articleId = req.params.article_id;
  const { inc_votes } = req.body;
  const checkArticleExists = model.fetchArticle(articleId);
  const updateVotes = model.updateArticleVotes(articleId, inc_votes);

  Promise.all([checkArticleExists, updateVotes])
    .then(({ [1]: article }) => {
      res.status(200).send({ article: article });
    })
    .catch(next);
};

exports.deleteComment = (req, res, next) => {
  const commentId = req.params.comment_id;

  const checkCommentExists = model.fetchComment(commentId);

  const removeComment = model.removeComment(commentId);

  Promise.all([checkCommentExists, removeComment])
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};

exports.getCommentById = (req, res, next) => {
  const commentId = req.params.comment_id;
  model
    .fetchComment(commentId)
    .then((comment) => {
      res.status(200).send({ comment: comment });
    })
    .catch(next);
};

exports.getUsers = (req, res, next) => {
  model
    .fetchUsers()
    .then((users) => {
      res.status(200).send({ users: users });
    })
    .catch(next);
};

exports.getUserByUsername = (req, res, next) => {
  const username = req.params.username;
  model
    .fetchUser(username)
    .then((user) => {
      res.status(200).send({ user: user });
    })
    .catch(next);
};

exports.patchComment = (req, res, next) => {
  const commentId = req.params.comment_id;
  const { inc_votes } = req.body;

  const checkCommentExists = model.fetchComment(commentId);
  const updateComment = model.updateComment(commentId, inc_votes);

  Promise.all([updateComment, checkCommentExists])
    .then(([comment]) => {
      res.status(200).send({ comment });
    })
    .catch(next);
};

exports.postArticle = (req, res, next) => {
  const checkAuthorExists = model.fetchUser(req.body.author);
  const checkTopicExists = model.fetchTopicBySlug(req.body.topic);

  const insertArticle = model.insertArticle(req.body);

  Promise.all([insertArticle, checkAuthorExists, checkTopicExists])
    .then(([article]) => {
      return model.fetchArticle(article.article_id);
    })
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch(next);
};
