import type { CommandInteraction } from 'discord.js'
import { Discord, Slash } from 'discordx'

@Discord()
export class PingCommand {
    @Slash({
        description: 'Ping-Pong!',
    })
    async ping(interaction: CommandInteraction): Promise<void> {
        interaction.reply('Pong!')
    }
}
