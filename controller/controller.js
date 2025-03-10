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