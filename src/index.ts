import fs from "node:fs";
import path from "node:path";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import IEvent from "./models/IEvent.js";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
export const commands = new Collection<string, ICommand>();
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

import dotenv from "dotenv";
import ICommand from "models/ICommand.js";
dotenv.config();
if (!process.env.token) {
  throw new Error("Config is not complete.");
}

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));
  for (const file of commandFiles) {
    import("./commands/" + folder + "/" + file).then((data) => {
      const command = data.default as ICommand;
      if ("data" in command && "execute" in command) {
        commands.set(command.data.name, command);
      } else {
        console.log(
          `[WARNING] The command at ${file} is missing a required "data" or "execute" property.`
        );
      }
    });
  }
}
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));
const promises: Promise<void>[] = [];
for (const file of eventFiles) {
  promises.push(
    new Promise(async (resolve, reject) => {
      const event = (await import("./events/" + file)).default as IEvent;
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
      } else {
        client.on(event.name, (...args) => event.execute(...args));
      }
      resolve()
    })
  );
}

Promise.all(promises).then(() => {
  client.login(process.env.token)
})