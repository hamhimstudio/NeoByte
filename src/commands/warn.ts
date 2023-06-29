import {
  ApplicationCommandOptionType,
  CommandInteraction,
  Guild,
  GuildMember
} from "discord.js";
import {
  Discord,
  Slash,
  SlashChoice,
  SlashOption
} from "discordx";
import { Inject } from "typedi";
import warnService from "../services/warnService.js";
import { asyncForEach } from "../utils/asyncForeach.js";

@Discord()
export class WarnCommand {
  @Inject()
  warnService: warnService;

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

    @SlashChoice({ name: "Spam", value: "spam" })
    @SlashChoice({ name: "Self Promotion", value: "self promotion" })
    @SlashChoice({ name: "Disrespect", value: "disrespect" })
    @SlashChoice({ name: "Begging", value: "begging" })
    @SlashChoice({ name: "NSFW Content", value: "nsfw content" })
    @SlashOption({
      name: "reason",
      description: "Reason for the warn",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    reason: string | undefined,

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
      moderator = interaction.user as unknown as GuildMember;
    }

    let points;
    if (!interaction.guild) {
      await interaction.reply("You must be in a guild!");
      return;
    }

    const guild: Guild = interaction.guild;

    if (user === interaction.member) {
      await interaction.reply("You can't warn yourself");
      return;
    }

    const reasonPoints: Record<string, number> = {
      "spam": 10,
      "self promotion": 10,
      "disrespect": 20,
      "begging": 10,
      "nsfw content": 30,
    };

    if (reason && reasonPoints.hasOwnProperty(reason)) {
      points = reasonPoints[reason];
    } else {
      points = 0;
    }

    try {
      await this.warnService.createWarning(
        user.id,
        interaction.guild.id,
        reason || "No reason specified",
        interaction.user.id,
        anonymous,
        points
      );
      await user.send(`You have been warned by ${moderator} for ${reason} in ${guild}. Points: ${points}`);
      await interaction.reply(`${user} has been warned by ${moderator} for ${reason}. Points: ${points}`);
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
          await interaction.reply(`${user} has been warned by ${moderator} for ${reason}. Points: ${points} \nNote: Can't DM user.`);
        } else {
          console.error("Error warning user:", error);
          await interaction.reply(`Failed to warn ${user}! Error: ${error.message}`);
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

    let moderator;
    if (anonymous) {
      moderator = "anonymous moderator" as string;
    } else {
      moderator = interaction.user as unknown as GuildMember;
    }

    const warning = await this.warnService.findWarning(warnID);

    if (!warning) {
      await interaction.reply("Warning not found");
      return;
    }

    try {
      await this.warnService.removeWarning(warning);
      await interaction.reply(`Warning ${warnID} successfully removed by ${moderator}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error warning user:", error);
        await interaction.reply(`Failed to remove warning ${warning}! Error: ${error.message}`);
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
      description: "The user to warn",
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
      const moderator = await interaction.guild?.members.fetch(warning.moderatorUserId);
      const moderatorName = warning.anonymous ? "Anonymous Moderator" : moderator ? moderator.displayName : warning.moderatorUserId;

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
