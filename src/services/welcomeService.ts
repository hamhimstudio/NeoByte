import { MessagePayload, TextChannel } from 'discord.js'
import { Inject, Service } from 'typedi'
import { bot } from '../main.js'
import serverSettingsService from './serverSettingsService.js'

@Service()
export default class logService {
    @Inject()
    serverSettingsService: serverSettingsService
    welcomeMessageChannelId: TextChannel | undefined
    welcomeMessage: string | undefined

    async sendWelcomeMessage(
        message: MessagePayload | string,
        guildId: string
    ) {
        const settings = await this.serverSettingsService.getSettings(guildId)
        if (!settings.welcomeMessageChannelId) return
        try {
            if (!this.welcomeMessageChannelId) {
                try {
                    const channel = bot.guilds.cache
                        .get(guildId)
                        ?.channels.cache.get(settings.welcomeMessageChannelId)
                    if (!channel || !channel.isTextBased())
                        throw new Error('Invalid welcome message channel!')

                    this.welcomeMessageChannelId = channel as TextChannel
                } catch (e) {
                    console.log(e)
                    return
                }
            }
            return await this.welcomeMessageChannelId.send(message)
        } catch (e) {
            console.log(e)
        }
    }
}
