import { Inject, Service } from "typedi";
import serverSettingsRepository from "../repositories/serverSettingsRepository.js";
import serverSettings from "../models/serverSettings.js";
import serverSettingsService from "./serverSettingsService.js";
import { MessagePayload, TextChannel } from "discord.js";
import { bot } from "../main.js";

@Service()
export default class logService {
  @Inject()
  serverSettingsService: serverSettingsService;

  logChannel: TextChannel | undefined;
  async sendLogMessage(message: MessagePayload | string, guildId: string) {
    const settigns = await this.serverSettingsService.getSettings(guildId);
    if (!settigns.logsChannelId) return;
    try {
      if (!this.logChannel) {
        try {
          const channel = bot.guilds.cache
            .get(guildId)
            ?.channels.cache.get(settigns.logsChannelId);
          if (!channel || !channel.isTextBased())
            throw new Error("Invalid Log Channel!");

          this.logChannel = channel as TextChannel;
        } catch (e) {
          console.log(e);
          return;
        }
      }
      return await this.logChannel.send(message);
    } catch (e) {
      console.log(e);
    }
  }
}
