import {
  ApplicationCommandOptionType,
  CommandInteraction,
  Guild,
  GuildMember,
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";

@Discord()
export class kick {
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
      await interaction.editReply("⛔ You must be in a guild!");
      return
    }

    const guild: Guild = interaction.guild;
    await interaction.deferReply();

    if (guild && user) {
      if (user === (interaction.member as GuildMember)) {
        await interaction.editReply("You can't kick yourself.");
        return;
      }
      try {
        await guild.members.kick(user, reason);
        await interaction.editReply(`${user} has been kicked for ${reason}.`);
        await user.send(`You have been kicked for ${reason}.`)
          .catch(() => interaction.followUp(`Can't send DM to the ${user}!`));
      } catch (error) {
        console.error("Error kicking user:", error);
        await interaction.editReply(`Failed to kick ${user}!`);
      }
    } else {
      await interaction.editReply(`Failed to kick ${user}!`);
    }
  }
}
