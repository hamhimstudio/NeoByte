import { ApplicationCommandOptionType, CommandInteraction, Guild, GuildMember } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";

@Discord()
export class BanCommand {
    @Slash({
        description: "Bans a user",
        dmPermission: false,
    })
    async ban(
        @SlashOption({
            name: "user",
            description: "The user to ban",
            required: true,
            type: ApplicationCommandOptionType.User,

        })
        @SlashOption({
            name: "reason",
            description: "Reason for the ban",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        user: GuildMember,
        reason: string,
        interaction: CommandInteraction
    ): Promise<void> {
        const guild: Guild | null = interaction.guild;
        await interaction.deferReply();

        if (guild && user) {
            if (user === interaction.member as GuildMember) {
                await interaction.editReply("⛔ You can't ban yourself")
                return
            }
            try {
                await guild.members.ban(user, { reason: reason });
                await interaction.editReply("✅ User has been banned.");
            } catch (error) {
                console.error("Error banning user:", error);
                await interaction.editReply("⛔ Failed to ban user.");
            }
        } else {
            await interaction.editReply("⛔ Failed to ban user.");
        }
    }
}
