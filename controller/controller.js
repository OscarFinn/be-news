const { get } = require("../app");
const model = require("../model/model")

exports.getApi = (req,res,next) => {
    const endpoints = model.fetchApi()
    res.status(200).send({endpoints:endpoints});
}

exports.getTopics = (req,res,next) => {
    model.fetchTopics()
        .then((topics) => {
            res.status(200).send({topics:topics})
        })
        .catch(next)
}

exports.getArticles = (req,res,next) => {
    model.fetchArticles()
        .then((articles) => {
            res.status(200).send({articles:articles})
        })
        .catch(next)
}

exports.getArticleById = (req,res,next) => {
    const articleId = req.params.article_id
    model.fetchArticle(articleId)
        .then((article) => {
            res.status(200).send({article:article})
        })
        .catch(next)
}

exports.getCommentsByArticle = (req,res,next) => {
    const articleId = req.params.article_id
    const checkExists = model.fetchArticle(articleId)
    const getComments = model.fetchCommentsByArticle(articleId)

    Promise.all([checkExists,getComments])
        .then(({[1]:comments}) => {
            res.status(200).send({comments:comments})
        })
        .catch(next)
    // model.fetchArticle(articleId)
    //     .then(() => {
    //          return model.fetchCommentsByArticle(articleId)
    //     })
    //     .then((comments) => {
    //         res.status(200).send({comments:comments})
    //     })
    //     .catch(next)
    
}

exports.postCommentToArticle = (req,res,next) => {
    const articleId = req.params.article_id
    const {username, body} = req.body
    //console.log(articleId, username, body)
    const checkUserExists = model.fetchUser(username)
    const checkArticleExists = model.fetchArticle(articleId)
    const postComment = model.insertComment(articleId,username,body)

    Promise.all([checkArticleExists, checkUserExists, postComment])
    .then(({[2]:comment}) => {
        res.status(201).send({comment:comment})
    })
    .catch(next)
}

exports.patchArticle = (req,res,next) => {
    const articleId = req.params.article_id
    const {inc_votes} = req.body
    const checkArticleExists = model.fetchArticle(articleId)
    const updateVotes = model.updateArticleVotes(articleId, inc_votes)

    Promise.all([checkArticleExists,updateVotes])
    .then(({[1]:article}) => {
        res.status(200).send({article:article})
    })
    .catch(next)
}

exports.deleteComment = (req,res,next) => {
    const commentId = req.params.comment_id

    const checkCommentExists = model.fetchComment(commentId)

    const removeComment = model.removeComment(commentId)

    Promise.all([checkCommentExists,removeComment])
    .then(() => {
        res.status(204).send()
    })
    .catch(next)
}

exports.getCommentById = (req,res,next) => {
    const commentId = req.params.comment_id
    model.fetchComment(commentId)
    .then((comment) => {
        res.status(200).send({comment:comment})
    })
    .catch(next)
}