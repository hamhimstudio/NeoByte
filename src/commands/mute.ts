import { ApplicationCommandOptionType, CommandInteraction, Guild, GuildMember } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";

@Discord()
export class MuteCommand {
    @Slash({
        description: "Timeouts a user",
        dmPermission: false,
        defaultMemberPermissions: ["MuteMembers"],
    })
    async mute(
        @SlashOption({
            name: "user",
            description: "The user to timeout",
            required: true,
            type: ApplicationCommandOptionType.User,
        }) user: GuildMember,
        @SlashOption({
            name: "reason",
            description: "Reason for the timeout",
            required: true,
            type: ApplicationCommandOptionType.String,
        }) reason: string,
        @SlashOption({
            name: "time",
            description: "Time for timeout in minutes.",
            required: true,
            type: ApplicationCommandOptionType.Integer,
        }) time: number,
        interaction: CommandInteraction
    ): Promise<void> {

        if (!interaction.guild) {
            await interaction.editReply("You must be in a guild!");
            return;
        }

        const guild: Guild = interaction.guild;
        const timeoutTime: number = time * 60 * 1000;

        await interaction.deferReply();

        if (time < 1) {
            await interaction.editReply("Time must be valid!");
            return;
        }

        if (user === interaction.member) {
            await interaction.editReply("You cannot timeout yourself!");
            return;
        }

        try {
            await user.timeout(timeoutTime);
            await interaction.editReply(`${user} has been timed out for ${time} minute(s) for ${reason}.`);

        } catch (error) {
            console.error("Error timing out user:", error);
            await interaction.editReply("Failed to timeout user!");
        }
    }
}
