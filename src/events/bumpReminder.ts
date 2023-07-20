import {
  CommandInteraction,
  InteractionType,
  Message,
  MessageType,
} from "discord.js";
import { ArgsOf, Discord, On } from "discordx";

const bumpData: {
  interactionId: string;
  timeDelaySeconds: number;
  check: (message: Message) => Promise<boolean>;
  response: (message: Message) => Promise<any>;
  reminder: (message: Message) => Promise<any>;
}[] = [
  {
    interactionId: "302050872383242240",
    timeDelaySeconds: 60 * 60 * 2,
    check: async (message: Message) => {
      return (
        message.embeds.length > 0 &&
        message.embeds[0].fields[0].value.includes("Bump done!")
      );
    },
    response: async (message: Message) => await message.reply("Bump done!"),
    reminder: async (message: Message) =>
      await message.reply("You can Bump again!"),
  },
];

@Discord()
class bumpReminder {
  async checkBump(message: Message) {
    if (!message.interaction) return;
    const data = bumpData.find(
      (d) => d.interactionId === message.interaction?.id
    );
    if (!data) return;
    if (await data.check(message)) {
      await data.response(message);
      setTimeout(async () => {
        try {
          const msg = await message.fetch();
          await data.reminder(msg);
        } catch (exc) {
          console.log("Couldnt send Bump Reminder");
          console.log(message);
          console.log(exc);
        }
      }, data.timeDelaySeconds * 1000);
    }
  }

  @On({ event: "messageCreate" })
  async onMessage([message]: ArgsOf<"messageCreate">) {
    if (!message.author.bot || message.author.system || message.type) return;
    this.checkBump(message);
  }

  @On({ event: "messageUpdate" })
  async onUpdateMessage([oldMessage, newMessage]: ArgsOf<"messageUpdate">) {
    if (!(newMessage instanceof Message)) return;
    this.checkBump(newMessage);
  }
}
