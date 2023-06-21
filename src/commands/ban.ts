import {
  ApplicationCommandOptionType,
  CommandInteraction,
  Guild,
  GuildMember,
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";

@Discord()
export class ban {
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
      await interaction.editReply("You must be in a guild!");
      return
    }

    const guild: Guild = interaction.guild;
    await interaction.deferReply();

    if (guild && user) {
      if (user === (interaction.member as GuildMember)) {
        await interaction.editReply("You can't ban yourself");
        return;
      }
      try {
        await user.send(`You have been banned for ${reason} in ${interaction.guild.name}.`)
          .catch(() => interaction.followUp(`Can't send DM to ${user}!`));
      } catch (error) {
        console.error("Error banning user:", error);
        await interaction.editReply(`Failed to ban ${user}!`);
      }
      await guild.members.ban(user, { reason: reason });
      await interaction.editReply(`${user} has been banned for ${reason}.`);

    } else {
      await interaction.editReply(`Failed to ban ${user}!`);
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

    await interaction.deferReply();

    if (!interaction.guild) {
      await interaction.editReply("You must be in a guild!");
      return;
    }

    const guild: Guild | null = interaction.guild;

    if (user === interaction.member) {
      await interaction.editReply("You cannot ban yourself!");
      return;
    }

    try {
      await user.send(`You have been unbanned in ${interaction.guild.name}.`)
        .catch(() => interaction.followUp(`Can't send DM to ${user}!`));

    } catch (error) {
      console.error("Error unbanning user:", error);
      await interaction.editReply(`Failed to unban ${user}!`);

    }
    await guild.members.unban(user);
    await interaction.editReply(`${user} has been unbanned.`);

  }
}