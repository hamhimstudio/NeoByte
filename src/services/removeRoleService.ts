import { GuildMember, TextChannel } from "discord.js";
import { Inject, Service } from "typedi";
import { bot } from "../main.js";
import serverSettingsService from "./serverSettingsService.js";

@Service()
export default class removeRoleService {
  @Inject()
  serverSettingsService: serverSettingsService;
  welcomeMessageChannelId: TextChannel | undefined;
  welcomeMessage: string | undefined;

  async removeUnverifiedRole(member: GuildMember, guildId: string) {
    const settings = await this.serverSettingsService.getSettings(guildId);
    const role = settings.unverifiedRole;
    if(!role) {
        return;
    }
    if (!settings.unverifiedRole) return;
    if(member.roles.cache.has(role)) {
        try {
        member.roles.remove(role)
        } catch (e) {
          console.log(e);
          return;
        }
    }
      }
}
