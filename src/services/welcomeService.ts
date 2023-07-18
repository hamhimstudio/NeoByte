import { GuildMember, TextChannel } from "discord.js";
import { Inject, Service } from "typedi";
import { bot } from "../main.js";
import serverSettingsService from "./serverSettingsService.js";

@Service()
export default class logService {
  @Inject()
  serverSettingsService: serverSettingsService;
  welcomeMessageChannelId: TextChannel | undefined;
  welcomeMessage: string | undefined;

  async sendWelcomeMessage(member: GuildMember, guildId: string) {
    // message: MessagePayload |
    const settings = await this.serverSettingsService.getSettings(guildId);
    if (!settings.welcomeMessageChannelId) return;
    try {
      if (!this.welcomeMessageChannelId) {
        try {
          const channel = bot.guilds.cache
            .get(guildId)
            ?.channels.cache.get(settings.welcomeMessageChannelId);
          if (!channel || !channel.isTextBased())
            throw new Error("Invalid welcome message channel!");

          this.welcomeMessageChannelId = channel as TextChannel;
        } catch (e) {
          console.log(e);
          return;
        }
      }
      return await this.welcomeMessageChannelId.send(
        settings.welcomeMessage?.replaceAll(
          "{member}",
          member.toString()
        ) as string
      );
    } catch (e) {
      console.log(e);
    }
  }
}
