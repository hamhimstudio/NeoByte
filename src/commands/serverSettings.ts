import {
  ApplicationCommandOptionType,
  ChannelType,
  CommandInteraction,
  TextChannel,
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { Inject } from "typedi";
import serverSettingsService from "../services/serverSettingsService.js";

@Discord()
export class ServerSettingsCommand {
  @Inject()
  serverSettings: serverSettingsService;
  @Slash({
    description: "Set server log Channel",
    dmPermission: false,
    defaultMemberPermissions: ["ManageGuild"],
  })
  async setlogchannel(
    @SlashOption({
      name: "channel",
      description: "The channel to set as the log channel",
      required: true,
      type: ApplicationCommandOptionType.Channel,
      channelTypes: [ChannelType.GuildText],
    })
    logChannel: TextChannel,
    interaction: CommandInteraction
  ): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply("You must be in a guild!");
      return;
    }

    const guild = interaction.guild;

    const serverSettings = await this.serverSettings.getSettings(guild.id);

    serverSettings.logsChannelId = logChannel.id;
    try {
      await this.serverSettings.createOrUpdateSettings(serverSettings);
    } catch (exc) {
      console.error(exc);
      await interaction.reply("Failed to set the log channel!");
      return;
    }
    interaction.reply("Successfully set the log channel!");
  }
  @Slash({
    description: "Set welcome message channel",
    dmPermission: false,
    defaultMemberPermissions: ["ManageGuild"],
  })
  async setwelcomechannel(
    @SlashOption({
      name: "channel",
      description: "The channel to set as the welcome message channel",
      required: true,
      type: ApplicationCommandOptionType.Channel,
      channelTypes: [ChannelType.GuildText],
    })
    welcomeMessageChannel: TextChannel,
    interaction: CommandInteraction
  ): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply("You must be in a guild!");
      return;
    }

    const guild = interaction.guild;

    const serverSettings = await this.serverSettings.getSettings(guild.id);

    serverSettings.welcomeMessageChannelId = welcomeMessageChannel.id;
    try {
      await this.serverSettings.createOrUpdateSettings(serverSettings);
    } catch (exc) {
      console.error(exc);
      await interaction.reply("Failed to set the welcome message channel!");
      return;
    }
    interaction.reply("Successfully set the welcome message channel!");
  }
  @Slash({
    description: "Set welcome message",
    dmPermission: false,
    defaultMemberPermissions: ["ManageGuild"],
  })
  async setwelcomemessage(
    @SlashOption({
      name: "message",
      description: "The message to set as the welcome message",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    welcomeMessage: string,
    interaction: CommandInteraction
  ): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply("You must be in a guild!");
      return;
    }

    const guild = interaction.guild;

    const serverSettings = await this.serverSettings.getSettings(guild.id);

    serverSettings.welcomeMessage = welcomeMessage;
    try {
      await this.serverSettings.createOrUpdateSettings(serverSettings);
    } catch (exc) {
      console.error(exc);
      await interaction.reply("Failed to set the welcome message!");
      return;
    }
    interaction.reply("Successfully set the welcome message!");
  }
}
