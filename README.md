## What is this?

This is the source code for the official Discord bot of The Coding Empire Discord community.

## Do we accept contribution?

We welcome any contributions. You can make changes to the code by making a pull request.
For more information, please read CONTRIBUTING.md.

_Note: You need to have to have [NodejS](https://nodejs.org/en/download) installed on your computer_

## How to run this locally for development purposes?

Before anything else, install all the dependencies using `npm install`.

### Setting up the database

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Download [Docker Desktop](https://www.docker.com/products/docker-desktop)
3. Open Docker Desktop, search for `mongo` and download the image.
4. Once you've downloaded the image, click on run.
5. Go to optional settings and set the host port to a port of your liking. (make sure it matches the port in your .env file)

### Setting up your Discord bot

1. Rename `.env.example` to `.env` and fill out the necessary information.
2. To run your bot, you could use `npm run dev` or `npm run watch`, if you want Nodemon to take care of you and automatically restart the the bot on every change.
3. Alternatively, you can use `docker-compose up -build`.

## How to run this locally for production purposes?

1. Set up your database.
2. Rename `.env.example` to `.env` and fill out the necessary information.
3. Use`npm run build`, followed by `npm run start` to start your bot.
