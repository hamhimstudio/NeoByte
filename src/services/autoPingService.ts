import { ThreadChannel, Role, TextChannel, Guild } from "discord.js"
import { Inject, Service } from "typedi"
import { bot } from "../main.js"
import serverSettingsService from "./serverSettingsService.js"

@Service()
export default class removeRoleService {
    @Inject()
    serverSettingsService: serverSettingsService
    autoPingRole: Role | undefined

    async pingHelperRole(guildId: string, helpPost: ThreadChannel) {
        const settings = await this.serverSettingsService.getSettings(guildId)
        if (!settings.autoPingRole) {
            helpPost.send("Oops, auto ping role not set.")
            return
        }

        try {
            const guild = bot.guilds.cache.get(guildId)
            if (!guild) {
                helpPost.send(
                    "Oops, you can only use this command in a valid guild. 😅"
                )
                return
            }

            const autoPingRole = guild.roles.cache.get(settings.autoPingRole)
            if (!autoPingRole) {
                helpPost.send(
                    "Oops, I have an invalid auto ping role saved to the database. 😅"
                )
                return
            }

            return await helpPost.send(
                `Hey helpers, looks somebody needs help. <@&${autoPingRole.id}>`
            )
        } catch (e) {
            helpPost.send(
                `Oh no, error while sending the message. Error message: ${e}`
            )
        }
    }
}
