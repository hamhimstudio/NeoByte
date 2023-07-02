import { ApplicationCommandOptionType, CommandInteraction, GuildMember, TextChannel } from "discord.js";
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
    if (!interaction.guild) {
      await interaction.reply("You must be in a guild!");
      return;
    }

    if (user === interaction.member) {
      await interaction.reply("You cannot kick yourself!");
      return;
    }

    let channelId = process.env.PUNISHMENTS_LOG_CHANNEL || "none";
    let channel = interaction.user.client.channels.cache.get(channelId) as TextChannel;
    let moderatorLogMessage = interaction.user as unknown as GuildMember;

    try {
      await user.send(`You have been kicked from ${interaction.guild.name} for ${reason}.`);
      await interaction.reply(`${user} has been kicked for ${reason}.`);
      await channel.send(`${user} has been kicked by ${moderatorLogMessage} for ${reason}.`);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Cannot send messages to this user") {
          await user.kick(reason);
          await interaction.reply(`${user} has been kicked for ${reason}.\nNote: Can't DM user.`);
          await channel.send(`${user} has been kicked by ${moderatorLogMessage} for ${reason}.`);
        } else {
          console.error("Error kicking user:", error);
          await interaction.reply(`Failed to kick ${user}! Error: ${error.message}`);
        }
      }
    }
  }
}
