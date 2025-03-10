const model = require("../model/model")

exports.getApi = (req,res,next) => {
    const endpoints = model.fetchApi()
    res.status(200).send({endpoints:endpoints});
}

exports.getTopics = (req,res,next) => {
    model.fetchTopics()
        .then((topics) => {
            //console.log(topics, "<-- ctrl topics")
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
    //console.log(articleId, '<--- article id')
    model.fetchArticle(articleId)
        .then((article) => {
            res.status(200).send({article:article})
        })
        .catch(next)
}