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
    
    const checkExists = model.fetchArticle(articleId)
    const postComment = model.insertComment(articleId,username,body)

    Promise.all([checkExists, postComment])
    .then(({[1]:comment}) => {
        res.status(201).send({comment:comment})
    })
}