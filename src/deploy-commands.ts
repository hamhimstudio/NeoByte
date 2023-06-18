import {
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from "discord.js";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { dirname } from "path";
import { fileURLToPath } from "url";
import ICommand from "models/ICommand.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config();
if (!process.env.token || !process.env.clientid || !process.env.guildid) {
  throw new Error("Config is not complete.");
}
const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
// Grab all the command files from the commands directory you created earlier

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.token);
const promisses:Promise<void>[] = [];
// and deploy your commands!
(async () => {
  for (const folder of commandFolders) {
    // Grab all the command files from the commands directory you created earlier
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));
    // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
    commandFiles.forEach((file) => {
      promisses.push(
        new Promise(async (resolve, reject) => {
          const command = (await import("./commands/" + folder + "/" + file))
            .default as ICommand;
          console.log(command);
          if ("data" in command && "execute" in command) {
            commands.push(command.data.toJSON());
          } else {
            console.log(
              `[WARNING] The command at ${file} is missing a required "data" or "execute" property.`
            );
          }
		  resolve();
        })
      );
    });
  }
  await Promise.all(promisses);
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = (await rest.put(
      Routes.applicationGuildCommands(
        process.env.clientId!,
        process.env.guildId!
      ),
      { body: commands }
    )) as any[];

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();
