# NEWS BACKEND PROJECT

## WHAT AM I LOOKING AT?

This is a project to create a RESTful api backend for a basic news aggregation site. The site has articles, comments, users and topics stored in the database and this api can be used to access and edit data.

Explore the db online:

    https://be-news-olwx.onrender.com/api

Expect to receive a '502 Bad Gateway' error on first clicking this link as it will take some time to come online. Refresh the link after a few minutes have passed.


## INITIAL SETUP

In order to run this project on your local machine you must have installed:

    node >= 0.12.0
    postgres >= [SOME_VERSION_NO]

Clone the repository to a directory of your choice using git clone.

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