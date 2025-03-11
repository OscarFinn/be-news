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

exports.insertComment = (articleId, username, body) => {
    //fetch article first as article title is needed in comment
    //console.log(title);
    const createdAt = new Date(Date.now())
    //console.log(createdAt)
    return db.query(`
        INSERT INTO comments
        (votes, body, author, article_id, created_at)
        VALUES
        (0, $1, $2, $3, $4)
        RETURNING *`, 
        [body,username,articleId,createdAt])
        .then(({rows})=> {
            //console.log(rows)
            return rows[0]})
}

exports.fetchUser = (username) => {
    return db.query(`
        SELECT * FROM users
        WHERE username = $1`, [username])
        .then(({rows}) => {
            if(rows.length === 0) {
                return Promise.reject({status: 404, msg: "User not found"})
            } else {
                return rows[0]
            }
        })
}

exports.updateArticleVotes = (articleId, voteChange) => {
    if(!voteChange) {
        return Promise.reject({status: 400, msg: "Bad request: no votes passed"})
    }
    return db.query(`
        UPDATE articles
        SET votes = votes + $1
        WHERE article_id = $2
        RETURNING article_id, votes`, [voteChange,articleId])
        .then(({rows})=> {
            return rows[0]
        })
}