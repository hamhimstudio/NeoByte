import type { ArgsOf } from "discordx";
import { Discord, On } from "discordx";
import { Inject } from "typedi";
import welcomeService from "../services/welcomeService.js";

@Discord()
export class ReadyEvent {
  @On({ event: "ready" })
  readyEvent([client]: ArgsOf<"ready">): void {
    console.log("Bot is ready and logged in as " + client.user?.tag);
  }
}
@Discord()
export class MemberJoinEvent {
  @Inject()
  welcomeService: welcomeService;
  @On({ event: "guildMemberAdd" })
  async memberJoinEvent([member]: ArgsOf<"guildMemberAdd">): Promise<void> {
    const guildId = member.guild.id;
    try {
      await this.welcomeService.sendWelcomeMessage(member, guildId);
    } catch (error) {
      console.error("Error in memberJoinEvent:", error);
    }
  }
}
