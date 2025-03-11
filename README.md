# NEWS BACKEND PROJECT

Explore the db online:

    https://be-news-olwx.onrender.com/api

This is a project to create a RESTful api backend for a basic news aggregation site. The site has articles, comments, users and topics stored in the database and this api can be used to access and edit data.

## INITIAL SETUP

In order to run this project you must have installed:

    node >= 0.12.0
    postgres >= SOME_VERSION_NO.

Run the following after cloning:

    npm install

Create a .env.development file in the root of the project directory and add the line:

    PGDATABASE = nc_news

Create a .env.test file in the root of the project directory and add the line:

    PGDATABASE = nc_news_test

To seed the development database use the command:

    npm run seed-dev

To run the test db with jest use the command:

    npm test