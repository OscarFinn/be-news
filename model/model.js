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
    return db.query(`
        SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COALESCE(number_of_comments,0) AS number_of_comments
        FROM articles
        LEFT JOIN (
            SELECT COUNT(comment_id) AS number_of_comments, article_id
            FROM comments
            GROUP BY article_id) AS commentCount
        ON commentCount.article_id = articles.article_id`)
        .then(({rows}) => {
            //console.log(rows)
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