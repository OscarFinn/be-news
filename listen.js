const app = require('./app.js')

const {PORT = 5050 } = process.env;

app.listen(PORT, () => {
    console.log(`server is listening on port ${PORT}`);
})