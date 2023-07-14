import {
    ApplicationCommandOptionType,
    AttachmentBuilder,
    ChannelType,
    CommandInteraction,
    TextBasedChannel,
    TextChannel,
} from 'discord.js'
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx'
import transcript from '../services/transcript.js'
import getMessages from '../utils/fetchManyMessages.js'

@Discord()
@SlashGroup({
    description: 'Creates a Transcript of the given channel in HTML.',
    name: 'transcript',
})
@SlashGroup('transcript')
export class transcriptcmd {
    static async startTranscript(
        channel: TextBasedChannel,
        maxsize: number = -1
    ) {
        const foundMessages = await getMessages(channel, maxsize)
        var data = new transcript({ messages: foundMessages })
        var html = data.getHtml()
        return html
    }

    @Slash({
        description: 'Create a Transcript',
        defaultMemberPermissions: ['ManageMessages'],
    })
    async create(
        @SlashOption({
            name: 'channel',
            description: 'the channel where you want the transcript from',
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [
                ChannelType.GuildText,
                ChannelType.GuildAnnouncement,
            ],
        })
        channel: TextBasedChannel | undefined,
        @SlashOption({
            name: 'maxsize',
            description: 'How many messages should be fetched',
            type: ApplicationCommandOptionType.Number,
        })
        size: number | undefined,
        interaction: CommandInteraction
    ) {
        await interaction.deferReply()
        try {
            var attachment = new AttachmentBuilder(
                Buffer.from(
                    await transcriptcmd.startTranscript(
                        channel || interaction.channel!,
                        size
                    ),
                    'utf8'
                ),
                {
                    name:
                        ((channel || interaction.channel!) as TextChannel)
                            .name + '.html',
                }
            )

            await interaction.editReply({ files: [attachment] })
        } catch (err) {
            console.error(err)
            await interaction.editReply({
                content: 'An error occured while creating the transcript!',
            })
        }
    }
}
