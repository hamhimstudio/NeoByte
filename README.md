## What is this?

This is the source code for the official Discord bot of The Coding Empire Discord community.
## Do we accept contribution?

We welcome any contributions. You can make changes to the code by making a pull request.

*Note: You need to have to have [NodejS](https://nodejs.org/en/download) installed on your computer*
## How to run this locally for development purposes?

1. Before installing everything rename `.env.example` to `.env`. In the `BOT_TOKEN` variable put your discord bot token, and in the `DANGERCORD_TOKEN` put your Dangercord token.
2. Install all the dependencies using `npm install`.
3. After you've successfully installed all dependencies, run `npm run dev` or `npm run watch`, if you want Nodemon to take care of you and automatically restart the the bot on every change. 
4. Alternatively, you can use `docker-compose up -build`.

## How to run this locally for production purposes?

1. Before installing everything rename `.env.example` to `.env`. In the `BOT_TOKEN` variable put your discord bot token, and in the `DANGERCORD_TOKEN` put your Dangercord token.
2. Install all the dependencies using `npm install`.
3. After you've successfully installed all dependencies, you can run `npm run build`, followed by `npm run start`.

