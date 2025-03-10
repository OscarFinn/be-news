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
        SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comment_id)::int AS number_of_comments
        FROM articles
        LEFT JOIN comments
        ON articles.article_id = comments.article_id
        GROUP BY articles.article_id
        ORDER BY articles.created_at DESC`)
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

exports.fetchCommentsByArticle = (id) => {
    return db.query(`SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC`, [id])
        .then(({rows}) => {
            //console.log(rows, '<--- comments for an article')
            return rows
        })
}