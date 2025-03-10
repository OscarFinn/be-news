const app = require('./app.js')

const port = 5050

app.listen(port, () => {
    console.log(`server is listening on port ${port}`);
})