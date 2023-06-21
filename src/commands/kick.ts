import {
  ApplicationCommandOptionType,
  CommandInteraction,
  GuildMember
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";

@Discord()
export class KickCommand {
  @Slash({
    description: "Kicks a user",
    dmPermission: false,
    defaultMemberPermissions: ["KickMembers"],
  })
  async kick(
    @SlashOption({
      name: "user",
      description: "The user to kick",
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    user: GuildMember,
    @SlashOption({
      name: "reason",
      description: "Reason for the kick",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    reason: string,
    interaction: CommandInteraction
  ): Promise<void> {
    await interaction.deferReply();

    if (!interaction.guild) {
      await interaction.editReply("You must be in a guild!");
      return;
    }
    if (user === interaction.member) {
      await interaction.editReply("You cannot kick yourself!");
      return;
    }

    try {
      await user.send(`You have been kicked for ${reason} in ${interaction.guild.name}`)
        .catch(() =>
          interaction.followUp(`Can't send DM to ${user}!`)
        );

    } catch (error) {
      console.error("Error kicking user:", error);
      await interaction.editReply(`Failed to kick ${user}!`);
    }

    await user.kick(reason);
    await interaction.editReply(`${user} has been kicked for ${reason}.`);

  }
}
