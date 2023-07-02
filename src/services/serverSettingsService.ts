import { Inject, Service } from "typedi";
import serverSettingsRepository from "../repositories/serverSettingsRepository.js";
import serverSettings from "../models/serverSettings.js";

@Service()
export default class serverSettingsService {
  @Inject()
  serverSettingsRepository: serverSettingsRepository;

  async getSettings(guildId: string) {
    return (
      (await this.serverSettingsRepository.findOne({
        where: { guildId: guildId },
      })) || this.createSettings(guildId)
    );
  }

  createSettings(guildId: string) {
    const newSetting = this.serverSettingsRepository.create();
    newSetting.guildId = guildId;
    return newSetting;
  }
  
  async createOrUpdateSettings(serverSettings: serverSettings) {
    return await this.serverSettingsRepository.save(serverSettings);
  }
}
