import { ThreadChannel, Role } from "discord.js"
import { Inject, Service } from "typedi"
import serverSettingsService from "./serverSettingsService.js"

@Service()
export default class removeRoleService {
    @Inject()
    serverSettingsService: serverSettingsService
    autoPingRole: Role | undefined

    async pingHelperRole(guildId: string, helpPost: ThreadChannel) {
        try {
            const settings = await this.serverSettingsService.getSettings(
                guildId
            )
            const helpChannelId = settings?.helpChannel

            if (helpChannelId) {
                const channel = (await helpPost.guild.channels.fetch(
                    helpChannelId
                )) as ThreadChannel
                const parent = helpPost.parent

                if (channel?.id === parent?.id) {
                    const guild = helpPost.guild
                    if (!guild) {
                        await helpPost.send(
                            "Oops, you can only use this command in a valid guild. 😅"
                        )
                        return
                    }

                    const autoPingRoleId = settings.autoPingRole
                    if (!autoPingRoleId) {
                        await helpPost.send(
                            "Oops, the auto ping role is undefined. 😅"
                        )
                        return
                    }

                    const autoPingRole = guild.roles.cache.get(autoPingRoleId)
                    if (!autoPingRole) {
                        await helpPost.send(
                            "Oops, I have an invalid auto ping role saved to the database. 😅"
                        )
                        return
                    }

                    await helpPost.send(
                        `Hey helpers, looks somebody needs help. <@&${autoPingRole.id}>`
                    )
                }
            }
        } catch (e) {
            await helpPost.send(
                `Oh no, error while sending the message. Error message: ${e}`
            )
        }
    }
}
