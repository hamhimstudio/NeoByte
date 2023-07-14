import type {
    CommandInteraction,
    ForumChannel,
    ThreadChannel,
} from 'discord.js'
import { Discord, Slash } from 'discordx'

@Discord()
export class solvedCommand {
    @Slash({
        description: 'Mark a help post as solved.',
    })
    async solved(interaction: CommandInteraction): Promise<void> {
        const channel = interaction.channel as ThreadChannel
        const parentChannel = channel.parent as ForumChannel
        const tags = parentChannel.availableTags

        if (!parentChannel || !channel) {
            interaction.reply('A post or a parent forum channel was not found.')
            return
        }

        if (!parentChannel.isThread) {
            interaction.reply(
                'I cannot apply tags to a non-forum post channel.'
            )
            return
        }

        try {
            const foundTag = tags.find((t) => t.name === 'Solved')
            if (!foundTag) {
                interaction.reply('No tag was found.')
                return
            }

            const tagId = foundTag.id
            await channel.setAppliedTags([tagId], 'test')
            interaction.reply('The post was successfully marked as solved.')
        } catch (error) {
            if (error instanceof Error) {
                interaction.reply(`An error occurred: ${error.message}`)
            }
        }
    }
}
