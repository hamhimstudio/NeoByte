import {
    ApplicationCommandOptionType,
    ChannelType,
    CommandInteraction,
    TextChannel,
} from 'discord.js'
import { Discord, Slash, SlashOption } from 'discordx'
import { Role } from 'discord.js'
import { Inject } from 'typedi'
import serverSettingsService from '../services/serverSettingsService.js'

@Discord()
export class ServerSettingsCommand {
    @Inject()
    serverSettings: serverSettingsService
    @Slash({
        description: 'Set server log Channel',
        dmPermission: false,
        defaultMemberPermissions: ['ManageGuild'],
    })
    async setLogchannel(
        @SlashOption({
            name: 'channel',
            description: 'The log channel where everything is logged.',
            required: true,
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
        })
        logChannel: TextChannel,
        interaction: CommandInteraction
    ): Promise<void> {
        if (!interaction.guild) {
            await interaction.reply(
                'Oops, you gotta be in a guild to use that command! 😅'
            )
            return
        }
        const guild = interaction.guild

        const serverSettings = await this.serverSettings.getSettings(guild.id)

        serverSettings.logsChannelId = logChannel.id
        try {
            await this.serverSettings.createOrUpdateSettings(serverSettings)
        } catch (exc) {
            console.error(exc)
            await interaction.reply(
                "Oops, looks like setting the log channel didn't go as planned."
            )
            return
        }
        interaction.reply('Log channel successfully set! 🎉')
    }
    @Slash({
        description: 'Set the channel where welcome messages will be sent.',
        dmPermission: false,
        defaultMemberPermissions: ['ManageGuild'],
    })
    async setWelcomeChannel(
        @SlashOption({
            name: 'channel',
            description:
                'TSet the channel where welcome messages should be sent.',
            required: true,
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
        })
        welcomeMessageChannel: TextChannel,
        interaction: CommandInteraction
    ): Promise<void> {
        if (!interaction.guild) {
            await interaction.reply(
                'Oops, you gotta be in a guild to use that command! 😅'
            )
            return
        }

        const guild = interaction.guild

        const serverSettings = await this.serverSettings.getSettings(guild.id)

        serverSettings.welcomeMessageChannelId = welcomeMessageChannel.id
        try {
            await this.serverSettings.createOrUpdateSettings(serverSettings)
        } catch (exc) {
            console.error(exc)
            await interaction.reply(
                'Oops, looks like there was an issue setting the welcome message channel.'
            )
            return
        }
        interaction.reply('Welcome channel successfully set! 🎉')
    }
    @Slash({
        description:
            'Set the warm welcome message that will be sent to new members when they join the server.',
        dmPermission: false,
        defaultMemberPermissions: ['ManageGuild'],
    })
    async setwelcomemessage(
        @SlashOption({
            name: 'message',
            description:
                'The warm and welcoming message for new members joining the server.',
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        welcomeMessage: string,
        interaction: CommandInteraction
    ): Promise<void> {
        if (!interaction.guild) {
            await interaction.reply(
                'Oops, you gotta be in a guild to use that command! 😅'
            )
            return
        }

        const guild = interaction.guild

        const serverSettings = await this.serverSettings.getSettings(guild.id)

        serverSettings.welcomeMessage = welcomeMessage
        try {
            await this.serverSettings.createOrUpdateSettings(serverSettings)
        } catch (exc) {
            console.error(exc)
            await interaction.reply(
                "Setting the welcome message didn't quite go as planned. 😅"
            )
            return
        }
        interaction.reply('Welcome message successfully updated! 🎉')
    }

    @Slash({
        description: 'Set the role for unverified users',
        dmPermission: false,
        defaultMemberPermissions: ['ManageGuild'],
    })
    async setUnverifiedRole(
        @SlashOption({
            name: 'role',
            description: 'The role to remove after user completes onboarding.',
            required: true,
            type: ApplicationCommandOptionType.Role,
        })
        unverifiedRole: Role,
        interaction: CommandInteraction
    ): Promise<void> {
        if (!interaction.guild) {
            await interaction.reply(
                'Oops, you gotta be in a guild to use that command! 😅'
            )
            return
        }
        const guild = interaction.guild
        const serverSettings = await this.serverSettings.getSettings(guild.id)

        serverSettings.unverifiedRole = unverifiedRole.id
        try {
            await this.serverSettings.createOrUpdateSettings(serverSettings)
        } catch (exc) {
            console.error(exc)
            await interaction.reply(
                'Oops, looks like there was a problem while trying to set the unverified role.'
            )
            return
        }
        interaction.reply('Unverified role set successfully! 🎉')
    }
}
