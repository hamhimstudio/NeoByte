import { CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash } from "discordx";

@Discord()
export class UserInfoCommand {
    @Slash({
        description: "Displays information about the user",
    })
    async userinfo(
        interaction: CommandInteraction): Promise<void> {
        const exampleEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('User Information')
            .setAuthor({ name: 'The Coding Empire', iconURL: 'https://cdn.discordapp.com/icons/952138215136055329/a_9ada81bcdd8f523936199b56106bd222.webp?size=96', url: 'https://discord.gg/Z7NDVrTmDN' })
            .setColor('#d3535f')
            .addFields(
                { name: 'User ID:', value: `${interaction.user.id}` },
                { name: 'Username:', value: `${interaction.user.username}` },
                { name: 'Created at:', value: `${interaction.user.createdAt}` },
                { name: 'Is a bot?:', value: `${interaction.user.bot}` },
            )
            .setTimestamp()
        interaction.reply({ embeds: [exampleEmbed] })
    }

}

