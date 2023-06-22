import { ApplicationCommandOptionType, CommandInteraction, Guild, GuildMember } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";

@Discord()
export class BanCommand {
  @Slash({
    description: "Bans a user",
    dmPermission: false,
    defaultMemberPermissions: ["BanMembers"],
  })
  async ban(
    @SlashOption({
      name: "user",
      description: "The user to ban",
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    user: GuildMember,
    @SlashOption({
      name: "reason",
      description: "Reason for the ban",
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

    const guild: Guild = interaction.guild;

    if (user === interaction.member) {
      await interaction.reply("You can't ban yourself");
      return;
    }

    try {
      await user.send(`You have been banned for ${reason} in ${interaction.guild.name}.`);
      await guild.members.ban(user, { reason: reason });
      await interaction.reply(`${user} has been banned for ${reason}.`);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Cannot send messages to this user") {
          await guild.members.ban(user, { reason: reason });
          await interaction.reply(`${user} has been banned for ${reason}.\nNote: Can't DM user.`);
        } else {
          console.error("Error banning user:", error);
          await interaction.reply(`Failed to ban ${user}! Error: ${error.message}`);
        }
      }
    }
  }

  @Slash({
    description: "Unban a user",
    dmPermission: false,
    defaultMemberPermissions: ["BanMembers"],
  })
  async unban(
    @SlashOption({
      name: "user",
      description: "The user to unban",
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    user: GuildMember,
    interaction: CommandInteraction
  ): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply("You must be in a guild!");
      return;
    }

    const guild: Guild = interaction.guild;

    try {
      await user.send(`You have been unbanned from ${interaction.guild.name}.`);
      await guild.members.unban(user);
      await interaction.reply(`${user} has been unbanned.`);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Cannot send messages to this user") {
          await guild.members.unban(user);
          await interaction.reply(`${user} has been unbanned.\nNote: Can't DM user.`);
        } else {
          console.error("Error unbanning user:", error);
          await interaction.reply(`Failed to unban ${user}! Error: ${error.message}`);
        }
      }
    }
  }
}
