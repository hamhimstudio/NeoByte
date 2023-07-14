import Dangercord from 'dangercord'
import {
    ApplicationCommandOptionType,
    CommandInteraction,
    EmbedBuilder,
    GuildMember,
    User,
} from 'discord.js'
import { Discord, Slash, SlashOption } from 'discordx'

@Discord()
export class UserInfoCommand {
    dangercord: Dangercord
    constructor() {
        if (!process.env.DANGERCORD_TOKEN)
            throw new Error('DANGERCORD_TOKEN is not defined!')
        this.dangercord = new Dangercord(process.env.DANGERCORD_TOKEN)
    }
    @Slash({
        description: 'Displays information about the user',
        dmPermission: false,
    })
    async userinfo(
        @SlashOption({
            name: 'user',
            description: 'The user to get information about',
            required: false,
            type: ApplicationCommandOptionType.User,
        })
        user: GuildMember | undefined,
        interaction: CommandInteraction
    ): Promise<void> {
        await interaction.deferReply()

        if (!user) {
            user = interaction.member as GuildMember
        }

        if (user instanceof User) {
            interaction.editReply('The user is not in this guild!')
            return
        }
        var result = await this.dangercord.getUser(user.id)

        const userInfo = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('User Information')
            .setAuthor({
                name: 'The Coding Empire',
                iconURL:
                    'https://cdn.discordapp.com/icons/952138215136055329/a_9ada81bcdd8f523936199b56106bd222.webp?size=96',
                url: 'https://discord.gg/Z7NDVrTmDN',
            })
            .setColor('#d3535f')
            .addFields(
                { name: '**User ID**:', value: `${user.id}` },
                { name: '**Username**:', value: `${user.displayName}` },
                { name: '**Created at**:', value: `${user.user.createdAt}` },
                { name: '**Is a bot?**:', value: `${user.user.bot == true}` },
                { name: '**Reports**:', value: `${result.reports}` },
                {
                    name: '**Spammer**:',
                    value: `${result.flags?.spammer == true}`,
                },
                {
                    name: '**Blacklisted**:',
                    value: `${result.badges.blacklisted == true}`,
                },
                {
                    name: '**Raid Bot**:',
                    value: `${result.badges.raid_bot == true}`,
                },
                {
                    name: '**Scam Bot**:',
                    value: `${result.badges.scam_bot == true}`,
                },
                {
                    name: 'Votes:',
                    value: `👍:${result.votes.upvotes} \n👎: ${result.votes.downvotes}`,
                }
            )
            .setTimestamp()
        interaction.editReply({ embeds: [userInfo] })
    }
}
