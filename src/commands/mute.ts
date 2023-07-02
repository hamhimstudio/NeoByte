import {
  ApplicationCommandOptionType,
  CommandInteraction,
  GuildMember,
  TextChannel,
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import logService from "../services/logService.js";
import { Inject } from "typedi";

@Discord()
export class MuteCommand {
  @Inject()
  logService: logService;
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
    })
    user: GuildMember,
    @SlashOption({
      name: "reason",
      description: "Reason for the mute",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    reason: string,
    @SlashOption({
      name: "time",
      description: "Time for mute in minutes",
      required: true,
      type: ApplicationCommandOptionType.Integer,
    })
    time: number,
    interaction: CommandInteraction
  ): Promise<void> {
    if (!interaction.guild) {
      await interaction.editReply("You must be in a guild!");
      return;
    }

    const timeoutTime: number = time * 60 * 1000;

    if (time < 1) {
      await interaction.editReply("Time must be valid!");
      return;
    }

    if (user === interaction.member) {
      await interaction.editReply("You cannot mute yourself!");
      return;
    }

    let moderatorLogMessage = interaction.member

    try {
      await user.send(
        `You have been muted for ${time} minute(s) in ${interaction.guild.name} for ${reason}.`
      );
      await user.timeout(timeoutTime);
      await interaction.reply(
        `${user} has been muted for ${time} minute(s) for ${reason}.`
      );
      await this.logService.sendLogMessage(
        `${user} has been muted by ${moderatorLogMessage} for ${time} minute(s) for ${reason}.`,
        interaction.guild.id
      );
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Cannot send messages to this user") {
          await user.timeout(timeoutTime);
          await interaction.reply(
            `${user} has been muted for ${time} minute(s) for ${reason}\nNote: Can't DM user.`
          );
          await this.logService.sendLogMessage(
            `${user} has been muted by ${moderatorLogMessage} for ${time} minute(s) for ${reason}.`,
            interaction.guild.id
          );
        } else {
          console.error("Error muting user:", error);
          await interaction.reply(
            `Failed to mute ${user}! Error: ${error.message}`
          );
        }
      }
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
    })
    user: GuildMember,
    interaction: CommandInteraction
  ): Promise<void> {
    if (!interaction.guild) {
      await interaction.editReply("You must be in a guild!");
      return;
    }

    let moderatorLogMessage = interaction.member

    try {
      await user.send(`You have been unmuted in ${interaction.guild.name}.`);
      await user.timeout(null);
      await interaction.reply(`${user} has been unmuted.`);
      await this.logService.sendLogMessage(
        `${user} has been unmuted by ${moderatorLogMessage}.`,
        interaction.guild.id
      );
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Cannot send messages to this user") {
          await user.timeout(null);
          await interaction.reply(
            `${user} has been unmuted.\nNote: Can't DM user.`
          );
          await this.logService.sendLogMessage(
            `${user} has been unmuted by ${moderatorLogMessage}.`,
            interaction.guild.id
          );
        } else {
          console.error("Error unmuting user:", error);
          await interaction.reply(
            `Failed to unmute ${user}! Error: ${error.message}`
          );
        }
      }
    }
  }
}
