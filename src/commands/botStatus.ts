import { CommandInteraction, EmbedBuilder } from 'discord.js'
import { Discord, Slash } from 'discordx'
import githubService from '../services/githubService.js'
import { Inject } from 'typedi'

@Discord()
export class BotStatusCommand {
    @Inject()
    githubService: githubService
    @Slash({
        description: 'Displays information about the bot',
        dmPermission: false,
    })
    async botinfo(interaction: CommandInteraction): Promise<void> {
        await interaction.deferReply()
        const contributes = await this.githubService.getCodeOwners()
        const userInfo = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('Bot Information')
            .setAuthor({
                name: 'The Coding Empire',
                iconURL:
                    'https://cdn.discordapp.com/icons/952138215136055329/a_9ada81bcdd8f523936199b56106bd222.webp?size=96',
                url: 'https://discord.gg/Z7NDVrTmDN',
            })
            .setColor('#d3535f')
            .addFields(
                { name: 'Name:', value: `${interaction.client.user.username}` },
                {
                    name: 'Created at:',
                    value: `${interaction.client.user.createdAt}`,
                },
                {
                    name: 'Contributors:',
                    value: `${contributes.data
                        .map(
                            (x) =>
                                ` [${x.login}](${x.html_url}) | ${x.contributions} Contributions\n`
                        )
                        .join('')}`,
                },
                {
                    name: 'Github:',
                    value: `https://github.com/The-Coding-Empire/discord-bot`,
                }
            )
            .setTimestamp()
        interaction.editReply({ embeds: [userInfo] })
    }
}
