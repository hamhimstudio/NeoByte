import { ApplicationCommandOptionType, CommandInteraction, Guild, GuildMember } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";

@Discord()
export class MuteCommand {
    @Slash({
        description: "Mute a user",
        dmPermission: false,
        defaultMemberPermissions: ["KickMembers"],
    })
    async mute(
        @SlashOption({
            name: "user",
            description: "The user to mute",
            required: true,
            type: ApplicationCommandOptionType.User,
        }) user: GuildMember,
        @SlashOption({
            name: "reason",
            description: "Reason for the mute",
            required: true,
            type: ApplicationCommandOptionType.String,
        }) reason: string,
        @SlashOption({
            name: "time",
            description: "Time for mute in minutes.",
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
            await interaction.editReply("You cannot mute yourself!");
            return;
        }

        try {
            await user.timeout(timeoutTime);
            await interaction.editReply(`${user} has been muted for ${time} minute(s) for ${reason}.`);

        } catch (error) {
            await interaction.editReply("Failed to mute user!");
        }
    }


    @Slash({
        description: "Unmute a member",
        dmPermission: false,
        defaultMemberPermissions: ["MuteMembers"],
    })
    async unmute(
        @SlashOption({
            name: "user",
            description: "The user to unmute",
            required: true,
            type: ApplicationCommandOptionType.User,
        }) user: GuildMember,
        interaction: CommandInteraction
    ): Promise<void> {

        if (!interaction.guild) {
            await interaction.editReply("You must be in a guild!");
            return;
        }

        if (user === interaction.member) {
            await interaction.editReply("You cannot unmute yourself!");
            return;
        }

        try {
            await user.timeout(null);
            await interaction.editReply(`${user} has been unmuted.`);

        } catch (error) {
            await interaction.editReply("Failed to unmute user!");
        }
    }
}