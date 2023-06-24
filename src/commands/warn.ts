
import {
  ApplicationCommandOptionType,
  CommandInteraction,
  Guild,
  GuildMember
} from "discord.js";
import {
  Discord,
  Slash,
  SlashOption
} from "discordx";
import { Inject } from "typedi";
import warnService from "../services/warnService.js";

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

    interaction: CommandInteraction,

  ): Promise<void> {
    let moderator;
    if (anonymous) {
      moderator = "anonymous moderator" as String
    } else {
      moderator = interaction.user as unknown as GuildMember;
    }
    
    if (!interaction.guild) {
      await interaction.reply("You must be in a guild!");
      return;
    }

    const guild: Guild = interaction.guild;

    if (user === interaction.member) {
      await interaction.reply("You can't warn yourself");
      return;
    }

    try {
      await user.send(`You have been warned by ${moderator} for ${reason} in ${guild}.`);
      await this.warnService.createWarning(
        user.id,
        interaction.guild.id,
        reason || "No reason specified",
        interaction.user.id
      );
      await interaction.reply(`${user} has been warned by ${moderator} for ${reason}.`);
    
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Cannot send messages to this user") {
          await this.warnService.createWarning(
            user.id,
            interaction.guild.id,
            reason || "No reason specified",
            interaction.user.id
          );
    
          await interaction.reply(`${user} has been warned by ${moderator} for ${reason}. \nNote: Can't DM user.`);
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
      moderator = "anonymous moderator" as String
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
    }
 
  catch(error) {
    if (error instanceof Error) {
    console.error("Error warning user:", error);
    await interaction.reply(`Failed to remove warning ${warning}! Error: ${error.message}`);
  }
}
  }
}