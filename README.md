# The Coding Empire Discord Bot

[![Discord](https://img.shields.io/discord/738807697949517568?color=7289da&label=Discord&logo=discord&logoColor=white)](https://discord.gg/e6KyT4be) <!-- enable discord's embed feature for this to work -->
[![GitHub issues](https://img.shields.io/github/issues/The-Coding-Empire/discord-bot?color=green)]()

This is the source code for the official Discord bot of The Coding Empire Discord community.

## Contributing

Contributions are always welcome! Please read the [contribution guidelines](CONTRIBUTING.md) first.
Few things to keep in mind:

- This is a bog-standard TypeScript project. If you're not familiar with TypeScript, you can learn it [here](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html).
- Ensure you install the dev dependencies using `npm install --save-dev` before making any changes.
- Please follow the [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) guidelines while making commits. ("changed things" is not a good commit message)
- **Test your code before making a pull request.** We have a CI/CD pipeline set up, but it's always better to test your code locally before making a pull request.

## Running the bot locally

### Prerequisites

- Docker (optional)
- Node.js (v14 or higher)
- MongoDB (local or remote)
- A Discord bot token

### Setting up the database

Setting up the database is pretty straightforward. All you need to do is run a local instance of MongoDB. You can do this by running `docker-compose up -d` in the root directory of this project. If you don't have Docker installed, you can install it from [here](https://docs.docker.com/get-docker/).

Or, you can use a tool such as [MongoDB Compass](https://www.mongodb.com/products/compass) to connect to a remote database, or run a local instance of MongoDB.

### Running the bot

1. Rename `.env.example` to `.env` and fill out the necessary information.
2. To run your bot, you could use `npm run dev` or `npm run watch`, if you want Nodemon to take care of you and automatically restart the the bot on every change.
3. Alternatively, you can use `docker-compose up -build`.

## Running in production

Use `docker-compose up -d` to run the bot in production mode. This will build the bot and run it in a container. You can use `docker-compose down` to stop the bot.
