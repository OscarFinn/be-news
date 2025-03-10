const db = require("../db/connection")
const endpointsJson = require('../endpoints.json')

exports.fetchApi = () => {
    return endpointsJson;
}

exports.fetchTopics = () => {
    return db.query(`SELECT * FROM topics`)
        .then(({rows}) => {
            //console.log(rows, '<--- topics in model')
            return rows
        })
}

exports.fetchArticles = () => {
    return db.query(`SELECT * FROM articles`)
        .then(({rows}) => {
            return rows;
        })
}
 
exports.fetchArticle = (id) => {
    return db.query(`SELECT * FROM articles WHERE article_id = $1`,[id])
        .then(({rows}) => {
            //console.log(rows, '<--- article')
            if(rows.length === 0) {
                return Promise.reject({status:404, msg: 'Article not found'})
            }
            //console.log(rows, '<--- article in model')
            return rows[0];
        })
}