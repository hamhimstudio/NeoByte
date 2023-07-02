import {
  ApplicationCommandOptionType,
  CommandInteraction,
  Guild,
  GuildMember,
  TextChannel,
} from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import * as dotenv from "dotenv";
import { Inject } from "typedi";
import warnService from "../services/warnService.js";
import { asyncForEach } from "../utils/asyncForeach.js";
import serverSettingsService from "../services/serverSettingsService.js";
import logService from "../services/logService.js";

dotenv.config();

@Discord()
export class WarnCommand {
  @Inject()
  warnService: warnService;
  @Inject()
  logService: logService;

  @Slash({
    description: "Warns a user",
    dmPermission: false,
    defaultMemberPermissions: ["KickMembers"],
  })
  async warn(
    @SlashOption({
      name: "user",
      description: "The user to warn",
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    user: GuildMember,

    @SlashChoice(
      { name: "Spam", value: "spam" },
      { name: "Self Promotion", value: "self promotion" },
      { name: "Disrespect", value: "disrespect" },
      { name: "Begging", value: "begging" },
      { name: "NSFW Content", value: "nsfw content" }
    )
    @SlashOption({
      name: "reason",
      description: "Reason for the warn",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    reason: string,

    @SlashOption({
      name: "anonymous",
      description: "Display moderator",
      required: true,
      type: ApplicationCommandOptionType.Boolean,
    })
    anonymous: boolean,
    interaction: CommandInteraction
  ): Promise<void> {
    let moderator;
    if (anonymous) {
      moderator = "anonymous moderator" as string;
    } else {
      moderator = interaction.member
    }

    let moderatorLogMessage = interaction.member

    if (!interaction.guild) {
      await interaction.reply("You must be in a guild!");
      return;
    }

    const guild: Guild = interaction.guild;

    if (user === interaction.member) {
      await interaction.reply("You can't warn yourself");
      return;
    }

    const reasonPoints: { [key: string]: number } = {
      spam: 10,
      "self promotion": 10,
      disrespect: 20,
      begging: 10,
      "nsfw content": 30,
    };

    let points = reasonPoints[reason] || 0;
    try {
      await this.warnService.createWarning(
        user.id,
        interaction.guild.id,
        reason || "No reason specified",
        interaction.user.id,
        anonymous,
        points
      );
      await user.send(
        `You have been warned by ${moderator} for ${reason} in ${guild}. Points: ${points}`
      );
      await interaction.reply(
        `${user} has been warned by ${moderator} for ${reason}. Points: ${points}`
      );
      await this.logService.sendLogMessage(
        `${user} has been warned by ${moderatorLogMessage} for ${reason}. User has been given ${points} points for this warning.`,
        guild.id
      );
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Cannot send messages to this user") {
          await this.warnService.createWarning(
            user.id,
            interaction.guild.id,
            reason || "No reason specified",
            interaction.user.id,
            anonymous,
            points
          );
          await interaction.reply(
            `${user} has been warned by ${moderator} for ${reason}. Points: ${points}\nNote: Can't DM user.`
          );
          await this.logService.sendLogMessage(
            `${user} has been warned by ${moderatorLogMessage} for ${reason}. User has been given ${points} points for this warning.`,
            guild.id
          );
        } else {
          console.error("Error warning user:", error);
          await interaction.reply(
            `Failed to warn ${user}! Error: ${error.message}`
          );
        }
      }
    }
  }

  @Slash({
    description: "Removes warn from a user",
    dmPermission: false,
    defaultMemberPermissions: ["KickMembers"],
  })
  async unwarn(
    @SlashOption({
      name: "id",
      description: "Warning ID to remove",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    warnID: string,

    @SlashOption({
      name: "anonymous",
      description: "Display moderator",
      required: true,
      type: ApplicationCommandOptionType.Boolean,
    })
    anonymous: boolean,

    interaction: CommandInteraction
  ): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply("You must be in a guild!");
      return;
    }
    let channelId = process.env.PUNISIHMENTS_LOG_CHANNEL || "none";
    let channel = interaction.user.client.channels.cache.get(
      channelId
    ) as TextChannel;

    let moderator;

    if (anonymous) {
      moderator = "anonymous moderator" as string;
    } else {
      moderator = interaction.member
    }

    let moderatorLogMessage = interaction.member

    const warning = await this.warnService.findWarning(warnID);

    if (!warning) {
      await interaction.reply("Warning not found");
      return;
    }

    try {
      await this.warnService.removeWarning(warning);
      await interaction.reply(`Warning ${warnID} removed by ${moderator}`);
      await channel.send(`Warning ${warnID} removed by ${moderatorLogMessage}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error warning user:", error);
        await interaction.reply(
          `Failed to remove warning ${warning}! Error: ${error.message}`
        );
      }
    }
  }

  @Slash({
    description: "Gets all warnings for a user",
    dmPermission: false,
    defaultMemberPermissions: ["KickMembers"],
  })
  async getwarnings(
    @SlashOption({
      name: "user",
      description: "The user to get all warns for",
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
    const warnings = await this.warnService.getWarningForUser(
      user.id,
      interaction.guild.id
    );

    let message = "Warnings are:\n";
    await asyncForEach(warnings, async (warning, ind) => {
      const moderator = await interaction.guild?.members.fetch(
        warning.moderatorUserId
      );
      const moderatorName = warning.anonymous
        ? "Anonymous Moderator"
        : moderator
        ? moderator.displayName
        : warning.moderatorUserId;

      message += `## Warning ${ind + 1}
        > ID: \`${warning._id}\`
        > Reason: ${warning.reason}
        > Moderator: ${moderatorName}
        > Points: ${warning.points}
        > Time: <t:${Math.floor(warning.timestamp.getTime() / 1000)}:F>\n`;
    });

    interaction.reply(message);
  }
}
