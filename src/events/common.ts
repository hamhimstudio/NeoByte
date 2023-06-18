import type { ArgsOf, Client } from "discordx";
import { Discord, On } from "discordx";

@Discord()
export class ReadyEvent {
  @On({event: "ready"})
  readyEvent([client]: ArgsOf<"ready">): void {
    console.log("Bot is ready and logged in as " + client.user?.tag);
  }
}
