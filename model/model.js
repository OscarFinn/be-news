const db = require("../db/connection")
const endpointsJson = require('../endpoints.json')

exports.fetchApi = () => {
    return endpointsJson;
}

exports.fetchTopics = () => {
    return db.query(`SELECT * FROM topics`)
        .then(({rows}) => rows)
}